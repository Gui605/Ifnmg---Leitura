//backend/src/shared/utils/serviceEmail.ts
import nodemailer from 'nodemailer';
import { AppError } from './AppError';
import { ErrorCodes } from '../../errors/ErrorCodes';
import { logger } from './logger';

/**
 * 🛠️ CONFIGURAÇÃO DE TRANSPORTE COM FAIL-FAST
 * Timeouts de 10 segundos garantem que o servidor não fique travado
 * esperando uma resposta de um servidor SMTP lento ou offline.
 */
function getTransporter() {
    const EMAIL_HOST = process.env.EMAIL_HOST;
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const EMAIL_DKIM_DOMAIN = process.env.EMAIL_DKIM_DOMAIN;
    const EMAIL_DKIM_SELECTOR = process.env.EMAIL_DKIM_SELECTOR;
    const EMAIL_DKIM_KEY = process.env.EMAIL_DKIM_KEY;
    const transporterOptions: any = {
        host: EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
        }
    };
    if (EMAIL_DKIM_DOMAIN && EMAIL_DKIM_SELECTOR && EMAIL_DKIM_KEY) {
        transporterOptions.dkim = {
            domainName: EMAIL_DKIM_DOMAIN,
            keySelector: EMAIL_DKIM_SELECTOR,
            privateKey: EMAIL_DKIM_KEY
        };
    }
    return nodemailer.createTransport(transporterOptions);
}

/**
 * [Diagnóstico] Verifica a saúde da conexão SMTP.
 */
export async function verificarConexaoSMTP(): Promise<void> {
    const EMAIL_HOST = process.env.EMAIL_HOST;
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
        logger.warn("SMTP não configurado. E-mails transacionais desativados", { evento: 'SMTP_NOT_CONFIGURED', errorCode: ErrorCodes.EMAIL_SERVICE_UNAVAILABLE });
        return;
    }

    try {
        const transporter = getTransporter();
        await transporter.verify();
        logger.info("Servidor SMTP verificado: pronto para envio", { evento: 'SMTP_VERIFIED' });
    } catch (error) {
        logger.error("Erro crítico ao verificar SMTP", { evento: 'SMTP_VERIFY_FAILED', error: (error as any)?.message, errorCode: ErrorCodes.EMAIL_SERVICE_UNAVAILABLE });
    }
}

/**
 * [Health Check] Diagnostica o status do serviço de e-mail.
 */
export async function diagnosticarSMTP(): Promise<'UP' | 'DOWN' | 'DISABLED'> {
    const EMAIL_HOST = process.env.EMAIL_HOST;
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
        return 'DISABLED';
    }
    try {
        const transporter = getTransporter();
        await transporter.verify();
        return 'UP';
    } catch (error) {
        return 'DOWN';
    }
}

/**
 * Centralizador de e-mails transacionais.
 */
export async function enviarEmailComToken(
    email: string, 
    token: string, 
    acao: 'verificacao' | 'recuperacao'
): Promise<void> {
    
    const EMAIL_HOST = process.env.EMAIL_HOST;
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@seuprojeto.com';
    const APP_NAME = process.env.APP_NAME || 'IFNMG Leitura';
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
        logger.warn('SMTP não configurado. Simulando envio de e-mail.', { 
            evento: 'EMAIL_MOCK_SENT', 
            acao, 
            email, 
            token: process.env.NODE_ENV === 'development' ? token : '***' // Exibe token apenas em dev
        });
        return;
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    let urlAcao: string;
    let assunto: string;
    let titulo: string;
    let textoBotao: string;
    let subTexto: string;

    if (acao === 'verificacao') {
        urlAcao = `${baseUrl}/api/v1/auth/confirmar?token=${token}`;
        assunto = `Confirme seu cadastro - ${APP_NAME}`;
        titulo = 'Seja bem-vindo!';
        textoBotao = 'Ativar minha conta';
        subTexto = 'Sua jornada começa agora. Clique abaixo para validar seu acesso.';
    } else {
        urlAcao = `${frontendUrl}/redefinir-senha?token=${token}`; 
        assunto = `Recuperação de acesso - ${APP_NAME}`;
        titulo = 'Recuperar Senha';
        textoBotao = 'Definir nova senha';
        subTexto = 'Recebemos uma solicitação para redefinir sua senha de acesso.';
    }

    const corpoHTML = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #007bff; padding: 25px; text-align: center;">
                <h1 style="color: white; margin: 0;">${APP_NAME}</h1>
            </div>
            <div style="padding: 40px; background-color: white;">
                <h2 style="color: #333;">${titulo}</h2>
                <p style="color: #666; font-size: 16px;">${subTexto}</p>
                <div style="text-align: center; margin: 40px 0;">
                    <a href="${urlAcao}" style="background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        ${textoBotao}
                    </a>
                </div>
            </div>
        </div>
    `;

    const transporter = getTransporter();
    const send = async () => {
        return transporter.sendMail({
            from: `"${APP_NAME}" <${EMAIL_FROM}>`,
            to: email,
            subject: assunto,
            html: corpoHTML,
        });
    };

    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
        try {
            await send();
            logger.info('E-mail transacional enviado', { evento: acao === 'verificacao' ? 'EMAIL_VERIFICATION_SENT' : 'PASSWORD_RECOVERY_EMAIL_SENT', acao, email });
            return;
        } catch (error: any) {
            attempts++;
            const msg = String(error?.message || '');
            const respCode = Number(error?.responseCode || 0);
            const isLogicalError =
                /invalid/i.test(msg) ||
                /no such user/i.test(msg) ||
                (respCode >= 400 && respCode < 500);

            if (isLogicalError || attempts >= maxAttempts) {
                logger.error('Falha no envio de e-mail', { evento: acao === 'verificacao' ? 'EMAIL_VERIFICATION_FAILED' : 'PASSWORD_RECOVERY_EMAIL_FAILED', acao, email, attempts, error: msg, errorCode: ErrorCodes.EMAIL_SERVICE_UNAVAILABLE });
                throw new AppError(
                    'Serviço de e-mail indisponível. Tente novamente mais tarde.',
                    503,
                    ErrorCodes.EMAIL_SERVICE_UNAVAILABLE
                );
            }

            await new Promise((resolve) => setTimeout(resolve, 1000 * (attempts + 1)));
        }
    }
}
