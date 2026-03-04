"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/prisma/seed.ts
const hashing_1 = require("../src/shared/utils/hashing");
const prisma_client_1 = __importDefault(require("../src/shared/prisma/prisma.client"));
async function main() {
    console.log('🌱 Iniciando Seed de Segurança & Robustez...');
    // --- 1. LIMPEZA EM CASCATA ---
    // A ordem é vital para não violar chaves estrangeiras durante a limpeza
    await prisma_client_1.default.postsCategorias.deleteMany();
    await prisma_client_1.default.interesses.deleteMany();
    await prisma_client_1.default.posts.deleteMany();
    await prisma_client_1.default.usuarios.deleteMany();
    await prisma_client_1.default.perfis.deleteMany();
    await prisma_client_1.default.categorias.deleteMany();
    console.log('🧹 Banco limpo. Criando dependências para o ambiente de testes...');
    const senhaPadrao = await (0, hashing_1.gerarHashSenha)('Senha123');
    // --- 2. CRIAÇÃO DE CATEGORIAS ---
    const catGeral = await prisma_client_1.default.categorias.create({ data: { nome: 'Geral' } });
    const catTec = await prisma_client_1.default.categorias.create({ data: { nome: 'Tecnologia' } });
    const catDicas = await prisma_client_1.default.categorias.create({ data: { nome: 'Dicas' } });
    // --- 3. USUÁRIO SÊNIOR (ADMIN) ---
    const userSenior = await prisma_client_1.default.perfis.create({
        data: {
            nome_user: 'Dev Sênior',
            usuario: {
                create: {
                    email: 'senior@teste.com',
                    password_hash: senhaPadrao,
                    cadastro_confirmado: true,
                    is_admin: true
                }
            }
        }
    });
    // --- 4. USUÁRIO COMUM (PARA TESTES DE PERMISSÃO) ---
    const userComum = await prisma_client_1.default.perfis.create({
        data: {
            nome_user: 'Usuário Comum',
            usuario: {
                create: {
                    email: 'comum@teste.com',
                    password_hash: senhaPadrao,
                    cadastro_confirmado: true,
                    is_admin: false
                }
            }
        }
    });
    // --- 4.1 USUÁRIO ESPECIAL PARA ANONIMIZAÇÃO ---
    // Preserva conteúdos ao excluir contas, sem expor dados sensíveis.
    await prisma_client_1.default.perfis.create({
        data: {
            nome_user: 'Usuário Excluído',
            usuario: {
                create: {
                    email: 'excluido@system.local',
                    password_hash: senhaPadrao,
                    cadastro_confirmado: true,
                    is_admin: false
                }
            }
        }
    });
    // --- 5. USUÁRIO FANTASMA (PARA TESTE DO CRON/AGENDADOR) ---
    // Criado com expiração no passado (2 horas atrás) para ser capturado pela limpeza
    await prisma_client_1.default.perfis.create({
        data: {
            nome_user: 'Usuário Temporário',
            usuario: {
                create: {
                    email: 'fantasma@teste.com',
                    password_hash: senhaPadrao,
                    cadastro_confirmado: false,
                    expiracao_pendente: new Date(Date.now() - (2 * 60 * 60 * 1000))
                }
            }
        }
    });
    // --- 6. POSTS INICIAIS ---
    const postBoasVindas = await prisma_client_1.default.posts.create({
        data: {
            titulo: 'Boas-vindas à Comunidade',
            conteudo: 'Este é o post inicial para testes de robustez e integridade.',
            autor_id: userSenior.perfil_id,
            categorias: {
                create: [
                    { categoria_id: catGeral.categoria_id },
                    { categoria_id: catTec.categoria_id }
                ]
            }
        }
    });
    // --- 7. INTERESSES INICIAIS (FOLLOWS) ---
    await prisma_client_1.default.interesses.create({
        data: {
            perfil_id: userSenior.perfil_id,
            categoria_id: catTec.categoria_id
        }
    });
    console.log(`✅ Seed finalizado com sucesso!`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`--------------------------------------------------`);
        console.log(`🔑 ADMIN: senior@teste.com | Senha123`);
        console.log(`🔑 USER:  comum@teste.com  | Senha123`);
        console.log(`--------------------------------------------------`);
    }
}
main()
    .catch((e) => {
    console.error('❌ Erro durante o Seed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_client_1.default.$disconnect();
});
