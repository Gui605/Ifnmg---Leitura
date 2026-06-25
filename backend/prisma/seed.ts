// backend/prisma/seed.ts
import { gerarHashSenha } from '../src/shared/utils/hashing';
import prisma from '../src/shared/prisma/prisma.client';

async function main() {
  console.log('🌱 Iniciando Seed Unificado: Segurança, Robustez & Dados Acadêmicos...');

  // --- 1. LIMPEZA EM CASCATA ---
  await prisma.denuncias.deleteMany();
  await prisma.votos.deleteMany();
  await prisma.comentarios.deleteMany();
  await prisma.favoritos.deleteMany();
  await prisma.postsCategorias.deleteMany();
  await prisma.obrasCategorias.deleteMany();
  await prisma.interesses.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.obras.deleteMany();
  await prisma.usuarios.deleteMany();
  await prisma.perfis.deleteMany();
  await prisma.categorias.deleteMany();

  console.log('🧹 Banco perfeitamente limpo. Gerando dados de teste e produção...');

  const senhaPadrao = await gerarHashSenha('Senha123');

  // --- 2. CRIAÇÃO DE CATEGORIAS ---
  const categoriasBase = ['Geral', 'Tecnologia', 'Dicas'];
  const categoriasAcademicas = [
    'Algoritmos', 'Agronomia', 'Biologia Celular', 'Cálculo I', 'Direito Administrativo',
    'Engenharia de Software', 'Filosofia', 'Física Quântica', 'Gestão de Projetos',
    'História do Brasil', 'Inteligência Artificial', 'Literatura Brasileira', 
    'Medicina Veterinária', 'Química Orgânica', 'Redação Acadêmica', 'Sociologia'
  ];

  const todasCategorias = Array.from(new Set([...categoriasBase, ...categoriasAcademicas]));
  
  const categoriasMapeadas: Record<string, number> = {};
  for (const nome of todasCategorias) {
    const cat = await prisma.categorias.create({ data: { nome } });
    categoriasMapeadas[nome] = cat.categoria_id;
  }

  // --- 3. USUÁRIOS E PERFIS DO ARQUIVO ANTIGO (MANTIDOS E CORRIGIDOS) ---
  const userSenior = await prisma.perfis.create({
    data: {
      nome_user: 'Dev Sênior',
      usuario: {
        create: {
          email: 'senior@teste.com',
          password_hash: senhaPadrao,
          nome_completo: 'Desenvolvedor Sênior da Silva',
          nome_campus: 'Araçuaí',
          cadastro_confirmado: true,
          is_admin: true
        }
      }
    }
  });

  const userComum = await prisma.perfis.create({
    data: {
      nome_user: 'Usuário Comum',
      usuario: {
        create: {
          email: 'comum@teste.com',
          password_hash: senhaPadrao,
          nome_completo: 'Aluno Comum de Testes',
          nome_campus: 'Januária',
          cadastro_confirmado: true,
          is_admin: false
        }
      }
    }
  });

  await prisma.perfis.create({
    data: {
      nome_user: 'Usuário Excluído',
      usuario: {
        create: {
          email: 'excluido@system.local',
          password_hash: senhaPadrao,
          nome_completo: 'Conta Anonimizada',
          nome_campus: 'Araçuaí',
          cadastro_confirmado: true,
          is_admin: false
        }
      }
    }
  });

  await prisma.perfis.create({
    data: {
      nome_user: 'Usuário Temporário',
      level: 0,
      xp: 0,
      usuario: {
        create: {
          email: 'fantasma@teste.com',
          password_hash: senhaPadrao,
          nome_completo: 'Conta Fantasma Cron',
          nome_campus: 'Salinas',
          cadastro_confirmado: false,
          expiracao_pendente: new Date(Date.now() - (2 * 60 * 60 * 1000)) 
        }
      }
    }
  });

  // --- 4. NOVOS USUÁRIOS ACADÊMICOS PADRONIZADOS IFNMG ---
  const dadosUsuariosNovos = [
    { nome: 'Guilherme Silva', user: 'guilherme_dev', campus: 'Araçuaí', email: 'guilherme.silva@ifnmg.edu.br', admin: true },
    { nome: 'Ana Beatriz Oliveira', user: 'ana_bio', campus: 'Januária', email: 'ana.oliveira@ifnmg.edu.br', admin: false },
    { nome: 'Marcos Antônio Costa', user: 'marcos_agroleite', campus: 'Salinas', email: 'marcos.costa@ifnmg.edu.br', admin: false },
    { nome: 'Joana Martins', user: 'joana_profa', campus: 'Montes Claros', email: 'joana.martins@ifnmg.edu.br', admin: false },
    { nome: 'Carlos Eduardo Santos', user: 'cadu_adm', campus: 'Pirapora', email: 'carlos.santos@ifnmg.edu.br', admin: false },
    { nome: 'Beatriz Faria', user: 'bia_vet', campus: 'Almenara', email: 'beatriz.faria@ifnmg.edu.br', admin: false },
  ];

  const perfisNovos = await Promise.all(
    dadosUsuariosNovos.map(u => 
      prisma.perfis.create({
        data: {
          nome_user: u.user,
          bio: `Membro institucional do IFNMG - Campus ${u.campus}. Focado em produzir e revisar conteúdos acadêmicos.`,
          usuario: {
            create: {
              email: u.email,
              password_hash: senhaPadrao,
              nome_completo: u.nome,
              nome_campus: u.campus,
              cadastro_confirmado: true,
              is_admin: u.admin
            }
          }
        }
      })
    )
  );

  const [profGuilherme, alunaAna, alunoMarcos, profaJoana, alunoCarlos, alunaBeatriz] = perfisNovos;

  // --- 5. OBRAS INICIAIS E NOVAS OBRAS ---
  const obraAntiga = await prisma.obras.create({
    data: {
      titulo: 'A Jornada do Código',
      descricao: 'Uma obra épica sobre a evolução do desenvolvimento de software.',
      autor_id: userSenior.perfil_id,
      idioma: 'Português',
      status: 'ANDAMENTO',
      categorias: { create: [{ categoria_id: categoriasMapeadas['Tecnologia'] }] }
    }
  });

  const obraProgramacao = await prisma.obras.create({
    data: {
      titulo: 'Manual de Sobrevivência em Algoritmos',
      descricao: 'Guia prático definitivo com implementação de estruturas de dados e ponteiros complexos.',
      autor_id: profGuilherme.perfil_id,
      idioma: 'Português',
      status: 'ANDAMENTO',
      categorias: { create: [{ categoria_id: categoriasMapeadas['Algoritmos'] }] }
    }
  });

  const obraAgronomia = await prisma.obras.create({
    data: {
      titulo: 'Sistemas de Irrigação no Semiárido',
      descricao: 'Uma análise técnica e empírica das culturas do Vale do Jequitinhonha sob estresse hídrico.',
      autor_id: alunoMarcos.perfil_id,
      idioma: 'Português',
      status: 'CONCLUIDO',
      categorias: { create: [{ categoria_id: categoriasMapeadas['Agronomia'] }] }
    }
  });

  // --- 6. CRIAÇÃO DE POSTS E CAPÍTULOS DE OBRAS EXPANDIDOS (15 CAPÍTULOS EXTRAS) ---
  
  // Post de Boas-vindas (Do arquivo Antigo)
  await prisma.posts.create({
    data: {
      titulo: 'Boas-vindas à Comunidade',
      conteudo: 'Este é o post inicial para testes de robustez e integridade.',
      autor_id: userSenior.perfil_id,
      idioma: 'Português',
      status: 'CONCLUIDO',
      categorias: {
        create: [
          { categoria_id: categoriasMapeadas['Geral'] },
          { categoria_id: categoriasMapeadas['Tecnologia'] }
        ]
      }
    }
  });

  // Capítulos para "A Jornada do Código" (Obra Antiga - Adicionados 4 Capítulos)
  await prisma.posts.createMany({
    data: [
      { titulo: 'Capítulo 1: O Nascimento do Bit', conteudo: 'No início, os cartões perfurados moldavam a arquitetura mecânica da computação moderna...', autor_id: userSenior.perfil_id, obra_id: obraAntiga.obra_id, ordem: 1, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 2: A Era das linguagens de Baixo Nível', conteudo: 'Com o Assembly, passamos a conversar diretamente com os registradores do processador...', autor_id: userSenior.perfil_id, obra_id: obraAntiga.obra_id, ordem: 2, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 3: A Revolução do C', conteudo: 'Dennis Ritchie cria uma linguagem elegante que uniu eficiência de baixo nível e legibilidade...', autor_id: userSenior.perfil_id, obra_id: obraAntiga.obra_id, ordem: 3, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 4: Programação Orientada a Objetos', conteudo: 'Abstrair o mundo real em classes e objetos mudou para sempre a arquitetura dos sistemas de larga escala.', autor_id: userSenior.perfil_id, obra_id: obraAntiga.obra_id, ordem: 4, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 5: O Futuro na Nuvem', conteudo: 'Servidores locais dão espaço para datacenters globais distribuídos e infraestrutura resiliente.', autor_id: userSenior.perfil_id, obra_id: obraAntiga.obra_id, ordem: 5, idioma: 'Português', status: 'ANDAMENTO' }
    ]
  });

  // Capítulos Sequenciais para "Manual de Sobrevivência em Algoritmos" (Obra Nova 1 - Adicionados 6 Capítulos)
  await prisma.posts.createMany({
    data: [
      { titulo: 'Capítulo 1: Desmistificando Ponteiros', conteudo: '# Ponteiros em C\n\nPonteiros guardam **endereços de memória**.', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 1, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 2: Alocação Dinâmica com Malloc', conteudo: 'Usando malloc e free para gerenciar memória em C de forma eficiente...', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 2, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 3: Listas Encadeadas Dinâmicas', conteudo: 'Diferente de vetores estáticos, as listas encadeadas utilizam nós auto-referenciados.', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 3, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 4: Pilhas e Filas (FIFO e LIFO)', conteudo: 'Entenda os conceitos estruturais de inserção e remoção sequencial de dados em memória heap.', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 4, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 5: Árvores Binárias de Busca (BST)', conteudo: 'Estruturas ramificadas lineares que aceleram buscas em grandes volumes de dados através de árvores indexadas.', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 5, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 6: Algoritmos de Ordenação Complexos', conteudo: 'Uma comparação aprofundada de eficiência assintótica entre QuickSort, MergeSort e BubbleSort.', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 6, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 7: Grafos e Caminhos Mínimos', conteudo: 'Como funcionam os algoritmos de Dijkstra e busca em largura para mapear redes de dados complexas.', autor_id: profGuilherme.perfil_id, obra_id: obraProgramacao.obra_id, ordem: 7, idioma: 'Português', status: 'ANDAMENTO' }
    ]
  });

  // Capítulos Sequenciais para "Sistemas de Irrigação no Semiárido" (Obra Nova 2 - Adicionados 5 Capítulos)
  await prisma.posts.createMany({
    data: [
      { titulo: 'Capítulo 1: Gotejamento Subsuperficial', conteudo: 'A técnica de gotejamento reduz drasticamente a taxa de evaporação do solo no Jequitinhonha.', autor_id: alunoMarcos.perfil_id, obra_id: obraAgronomia.obra_id, ordem: 1, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 2: Manejo Dinâmico da Água', conteudo: 'Utilizando sensores de umidade de baixo custo, o produtor economiza recursos.', autor_id: alunoMarcos.perfil_id, obra_id: obraAgronomia.obra_id, ordem: 2, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 3: Evapotranspiração da Cultura (ETc)', conteudo: 'Cálculo essencial utilizando coeficientes de cultivo (Kc) adaptados para a agricultura familiar local.', autor_id: alunoMarcos.perfil_id, obra_id: obraAgronomia.obra_id, ordem: 3, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 4: Captação de Água de Chuva em Cisternas', conteudo: 'Estruturas de armazenamento estratégico para garantir ciclos contínuos durante estiagens severas.', autor_id: alunoMarcos.perfil_id, obra_id: obraAgronomia.obra_id, ordem: 4, idioma: 'Português', status: 'CONCLUIDO' },
      { titulo: 'Capítulo 5: Automação Sustentável com Arduino', conteudo: 'Uso de microcontroladores para gerenciar válvulas solenoide com base em dados climáticos em tempo real.', autor_id: alunoMarcos.perfil_id, obra_id: obraAgronomia.obra_id, ordem: 5, idioma: 'Português', status: 'CONCLUIDO' }
    ]
  });

  // --- 7. CRIAÇÃO DE POSTS SIMPLES/AVULSOS (10 POSTS NO TOTAL) ---
  const postsSimples = [
    { titulo: 'Guia de Redação Nota 1000', conteudo: '# Estrutura Dissertativa\n\n* **Introdução**\n* **Desenvolvimento**\n* **Conclusão**', autor: alunaAna.perfil_id, cat: 'Redação Acadêmica' },
    { titulo: 'Introdução às Redes Neurais Artificiais', conteudo: '# IA Prática\n\nPerceptrons e funções de ativação como ReLU ou Sigmoide.', autor: profaJoana.perfil_id, cat: 'Inteligência Artificial' },
    { titulo: 'Como Organizar o seu TCC sem estresse', conteudo: 'Dicas sobre cronograma, escolha de orientador e formatação correta de referências ABNT.', autor: userComum.perfil_id, cat: 'Dicas' },
    { titulo: 'Resumo de Filosofia: O Mito da Caverna', conteudo: 'Uma análise contemporânea da metáfora de Platão sobre conhecimento, ilusão e a saída da ignorância.', autor: alunaAna.perfil_id, cat: 'Filosofia' },
    { titulo: 'Propriedades da Matéria Orgânica no Solo', conteudo: 'Entenda como a decomposição afeta a fertilidade e a retenção de nitrogênio na terra cultivável.', autor: alunoMarcos.perfil_id, cat: 'Agronomia' },
    { titulo: 'Princípios do Direito Administrativo', conteudo: '# Princípios da Administração\n\nLembre-se do mnemônico LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade e Eficiência.', autor: alunoCarlos.perfil_id, cat: 'Direito Administrativo' },
    { titulo: 'Dicas Práticas para o Git e GitHub', conteudo: 'Comandos essenciais como `git commit --amend`, `git rebase` e boas práticas para evitar conflitos em branchs.', autor: profGuilherme.perfil_id, cat: 'Tecnologia' },
    { titulo: 'O que estuda a Física Quântica?', conteudo: 'Uma introdução conceitual ao princípio da incerteza de Heisenberg e à dualidade onda-partícula.', autor: profaJoana.perfil_id, cat: 'Física Quântica' },
    { titulo: 'Metodologias Ágeis: Scrum vs Kanban', conteudo: 'Como organizar as sprints do seu projeto de fábrica de software universitária usando metodologias ágeis.', autor: alunoCarlos.perfil_id, cat: 'Gestão de Projetos' },
    { titulo: 'Principais Parasitoses em Animais Domésticos', conteudo: 'Estudo de verminoses e tratamentos profiláticos com anti-helmínticos na medicina veterinária.', autor: alunaBeatriz.perfil_id, cat: 'Medicina Veterinária' }
  ];

  for (const p of postsSimples) {
    await prisma.posts.create({
      data: {
        titulo: p.titulo,
        conteudo: p.conteudo,
        autor_id: p.autor,
        idioma: 'Português',
        status: 'CONCLUIDO',
        categorias: { create: [{ categoria_id: categoriasMapeadas[p.cat] }] }
      }
    });
  }

  // --- 8. INTERESSES ---
  await prisma.interesses.create({
    data: {
      perfil_id: userSenior.perfil_id,
      categoria_id: categoriasMapeadas['Tecnologia']
    }
  });

  console.log(`✅ Seed Unificado concluído com sucesso!`);
  console.log(`--------------------------------------------------`);
  console.log(`🔑 ADMIN (Antigo): senior@teste.com | Senha123`);
  console.log(`🔑 USER  (Antigo): comum@teste.com  | Senha123`);
  console.log(`🔑 INSTITUCIONAL : guilherme.silva@ifnmg.edu.br | Senha123`);
  console.log(`--------------------------------------------------`);
}

main()
  .catch((e) => {
    console.error('❌ Erro crítico durante o Seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });