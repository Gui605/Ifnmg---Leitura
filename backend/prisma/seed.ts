// backend/prisma/seed.ts
import { gerarHashSenha } from '../src/shared/utils/hashing';
import prisma from '../src/shared/prisma/prisma.client';

async function main() {
  console.log('🌱 Iniciando Seed de Segurança & Robustez...');

  // --- 1. LIMPEZA EM CASCATA ---
  // A ordem é vital para não violar chaves estrangeiras durante a limpeza
  await prisma.postsCategorias.deleteMany();
  await prisma.interesses.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.usuarios.deleteMany();
  await prisma.perfis.deleteMany();
  await prisma.categorias.deleteMany();

  console.log('🧹 Banco limpo. Criando dependências para o ambiente de testes...');

  const senhaPadrao = await gerarHashSenha('Senha123');

  // --- 2. CRIAÇÃO DE CATEGORIAS ---
  const catGeral = await prisma.categorias.create({ data: { nome: 'Geral' } });
  const catTec = await prisma.categorias.create({ data: { nome: 'Tecnologia' } });
  const catDicas = await prisma.categorias.create({ data: { nome: 'Dicas' } });

  // --- 3. USUÁRIO SÊNIOR (ADMIN) ---
  const userSenior = await prisma.perfis.create({
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
  const userComum = await prisma.perfis.create({
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
  await prisma.perfis.create({
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
  await prisma.perfis.create({
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
  const postBoasVindas = await prisma.posts.create({
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
  await prisma.interesses.create({
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
    await prisma.$disconnect();
  });
