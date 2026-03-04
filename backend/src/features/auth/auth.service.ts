import prisma from '../../shared/prisma/prisma.client';
import { Prisma } from '@prisma/client'; 
import { gerarHashSenha, compararSenha } from '../../shared/utils/hashing';
import { gerarToken } from '../../shared/utils/jwtUtils';
import { enviarEmailComToken } from '../../shared/utils/serviceEmail'; 
import { RegistrarData } from '../../shared/types/auth.types';
import { AppError } from '../../shared/utils/AppError'; 
import { ErrorCodes } from '../../errors/ErrorCodes'; // Importação necessária para códigos manuais
import * as crypto from 'crypto'; 
import { registrar as registrarLog } from '../../shared/utils/logService';

/**
 * 🛡️ PADRÃO ENTERPRISE: Camada de Serviço de Autenticação
 * Sincronizado com ErrorCodes e Factory Methods.
 */

async function registrarUsuario(data: RegistrarData, requestId?: string): Promise<string> {
    const { email, senha, nome_completo, nome_campus, data_nascimento, nome_user } = data;
    
    const tokenVerificacao = crypto.randomBytes(32).toString('hex'); 
    const dataExpiracao = new Date(Date.now() + 1 * 60 * 60 * 1000); 
    const senhaHashed = await gerarHashSenha(senha);
    let novoPerfilId: number | undefined;
    let novoUsuarioId: number | undefined;

    try {
        const emailNormalizado = email.toLowerCase().trim();
        
        // 🔍 NOVO: Verificação profunda do estado do usuário existente
        const existente = await prisma.usuarios.findUnique({
            where: { email: emailNormalizado },
            select: { 
                usuario_id: true, 
                cadastro_confirmado: true, 
                expiracao_pendente: true 
            }
        });

        if (existente) {
            // CASO A: Usuário já é ativo (Segurança: Mensagem genérica para evitar enumeração)
            if (existente.cadastro_confirmado) {
                // Mantém lógica original de proteção contra timing attacks
                await gerarHashSenha(senha);
                await new Promise((r) => setTimeout(r, 300));
                return 'Solicitação recebida.';
            }

            // CASO B: Cadastro Pendente e link ainda válido (UX: Orienta ir ao e-mail)
            const agora = new Date();
            if (existente.expiracao_pendente && existente.expiracao_pendente > agora) {
                return `Você já possui um cadastro pendente. Verifique sua caixa de entrada e spam para ativar sua conta.`;
            }

            // CASO C: Link Expirado (Renovação automática e reenvio de e-mail)
            await prisma.usuarios.update({
                where: { usuario_id: existente.usuario_id },
                data: { 
                    token_verificacao: tokenVerificacao, 
                    expiracao_pendente: dataExpiracao 
                }
            });

            setImmediate(() => {
                enviarEmailComToken(emailNormalizado, tokenVerificacao, 'verificacao').catch(() => {});
            });

            return `Vimos que seu link expirou. Enviamos uma nova chave de ativação para ${emailNormalizado}.`;
        }

        // 🛡️ LÓGICA ORIGINAL: Transação para novos registros
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const novoPerfil = await tx.perfis.create({ 
                data: { 
                    nome_user: nome_user.trim(), 
                    score_karma: 0, 
                    reading_points: 0 
                } 
            });
            novoPerfilId = novoPerfil.perfil_id;

            await tx.usuarios.create({
                data: {
                    email: emailNormalizado,
                    password_hash: senhaHashed,
                    perfil_id: novoPerfil.perfil_id,
                    token_verificacao: tokenVerificacao,
                    cadastro_confirmado: false,
                    expiracao_pendente: dataExpiracao,
                    nome_completo: nome_completo.trim(),
                    nome_campus: nome_campus.trim(),
                    data_nascimento: new Date(data_nascimento as unknown as Date),
                },
            });

            const usuarioCriado = await tx.usuarios.findFirst({
                where: { perfil_id: novoPerfil.perfil_id },
                select: { usuario_id: true }
            });
            novoUsuarioId = usuarioCriado?.usuario_id;
        });

        

    } catch (error: any) {
        // Preserva o tratamento de erro original para restrições de banco (P2002)
        if (error.code === 'P2002') {
            await gerarHashSenha(senha);
            await new Promise((r) => setTimeout(r, 300));
            return 'Solicitação recebida.';
        }
        throw error; 
    }

    // Disparo de e-mail para NOVOS cadastros (fora do bloco catch/if)
    setImmediate(() => { enviarEmailComToken(email, tokenVerificacao, 'verificacao').catch(() => {}); });

    return `Cadastro realizado! Enviamos um link de ativação para ${email}.`;
}

async function logarUsuario(email: string, senha: string, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findUnique({ where: { email } });
    
    // 🛡️ Segurança: Usamos Factory Method para 401
    if (!user) { 
        throw AppError.unauthorized('E-mail ou senha incorretos.'); 
    }

    if (!user.cadastro_confirmado) { 
        const agora = new Date();
        
        if (user.expiracao_pendente && user.expiracao_pendente < agora) {
            const novoToken = crypto.randomBytes(32).toString('hex');
            const novaExp = new Date(Date.now() + 1 * 60 * 60 * 1000); 

            await prisma.usuarios.update({
                where: { usuario_id: user.usuario_id },
                data: { token_verificacao: novoToken, expiracao_pendente: novaExp },
            });
            
            setImmediate(() => { enviarEmailComToken(user.email, novoToken, 'verificacao').catch(() => {}); });

            // 🛡️ 410 Gone: Lançamento manual para casos específicos de expiração
            throw new AppError(
                `Seu link de ativação expirou. Enviamos um novo para ${user.email}.`, 
                410, 
                ErrorCodes.TOKEN_EXPIRED
            );
        }
        
        // 🛡️ 403 Forbidden: Conta inativa
        throw new AppError(
            'Sua conta ainda não foi ativada. Verifique seu e-mail para confirmar o cadastro.', 
            403, 
            ErrorCodes.FORBIDDEN
        );
    }

    const senhaValida = await compararSenha(senha, user.password_hash);
    if (!senhaValida) { 
        throw AppError.unauthorized('E-mail ou senha incorretos.'); 
    }

    const rotated = await prisma.usuarios.update({
        where: { usuario_id: user.usuario_id },
        data: { token_version: { increment: 1 } },
        select: { usuario_id: true, perfil_id: true, is_admin: true, token_version: true }
    });

    const token = gerarToken({ 
        usuario_id: rotated.usuario_id, 
        perfil_id: rotated.perfil_id,
        is_admin: rotated.is_admin,
        token_version: rotated.token_version
    });
    try { await registrarLog(rotated.perfil_id, 'USER_LOGIN', { usuario_id: rotated.usuario_id }, requestId); } catch {}
    return token;
}

async function verificarConta(token: string, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findFirst({ 
        where: { token_verificacao: token } 
    });

    if (!user) { 
        throw AppError.badRequest('Link de ativação inválido ou já utilizado.'); 
    }

    if (user.expiracao_pendente && user.expiracao_pendente < new Date()) {
         throw new AppError(
            'Este link expirou. Tente fazer login para receber um novo e-mail de ativação.', 
            410, 
            ErrorCodes.TOKEN_EXPIRED
         );
    }

    await prisma.usuarios.update({
        where: { usuario_id: user.usuario_id },
        data: {
            cadastro_confirmado: true,
            token_verificacao: null, 
            expiracao_pendente: null, 
        },
    });
    

    return 'Conta ativada com sucesso! Você já pode fazer login.';
}

async function logoutAll(usuarioId: number, requestId?: string): Promise<string> {
    const user = await prisma.usuarios.findUnique({ where: { usuario_id: usuarioId }, select: { perfil_id: true } });
    await prisma.usuarios.update({
        where: { usuario_id: usuarioId },
        data: { token_version: { increment: 1 } }
    });
    if (user?.perfil_id) { try { await registrarLog(user.perfil_id, 'USER_LOGOUT_ALL', { usuario_id: usuarioId }, requestId); } catch {} }
    return 'Sessões revogadas com sucesso.';
}

export default { registrarUsuario, logarUsuario, verificarConta, logoutAll };

