import axios from 'axios';
import { logger } from '../src/shared/utils/logger';

// ========================================
// CONFIGURAÇÃO
// ========================================
const API_URL = 'http://localhost:3000/api/v1';
const SLOW_THRESHOLD_MS = 800;

const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true,
  timeout: 10000
});

// ========================================
// USUÁRIOS DE TESTE
// ========================================
const usuario = {
  email: 'senior@teste.com',
  senha: 'Senha123'
};

let token: string;
let postId: number;
let categoriaId: number;

// ========================================
// HELPERS
// ========================================
function ok(cond: boolean, msg: string, data?: any) {
  if (!cond) {
    const err: any = new Error(msg);
    err.details = data;
    throw err;
  }
}

function auth() {
  return { Authorization: `Bearer ${token}` };
}

async function runCase(nome: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;

    logger.info(`✅ ${nome}`, {
      evento: 'SOCIAL_FEATURE_OK',
      ms: duration,
      slow: duration > SLOW_THRESHOLD_MS
    });

    console.log(`✅ ${nome}`);
  } catch (e: any) {
    logger.error(`❌ ${nome}`, {
      evento: 'SOCIAL_FEATURE_FAIL',
      error: e.message,
      details: e.details
    });

    console.error(`❌ ${nome}: ${e.message}`);
    process.exit(1);
  }
}

// ========================================
// SETUP
// ========================================
async function setup() {
  console.log('🔐 Realizando login...');

  const login = await api.post('/auth/logar', {
    email: usuario.email,
    senha: usuario.senha
  });

  ok(login.status === 200, 'Login falhou', login.data);

  token = login.data.data.token;

  console.log('📂 Criando categoria de teste...');

  const categoria = await api.post(
    '/categorias',
    { nome: `Categoria Teste ${Date.now()}` },
    { headers: auth() }
  );

  ok(categoria.status === 201, 'Falha ao criar categoria', categoria.data);
  categoriaId = categoria.data.data.categoria_id;

  console.log('📝 Criando post de teste...');

  const post = await api.post(
    '/posts',
    {
      titulo: 'Post de Teste Social',
      conteudo: 'Conteúdo para testes sociais',
      categoriasIds: [categoriaId]
    },
    { headers: auth() }
  );

  ok(post.status === 201, 'Falha ao criar post', post.data);
  postId = post.data.data.post_id;
}

// ========================================
// TESTES
// ========================================
async function runSocialTests() {
  console.log('🚀 Iniciando Testes de Funcionalidades Sociais...');

  // ============================
  // 1️⃣ VOTAÇÃO
  // ============================

  await runCase('Voto: UP (Positivo)', async () => {
    const res = await api.post(
      `/posts/${postId}/votar`,
      { tipo: 'UP' },
      { headers: auth() }
    );

    ok(res.status === 200, 'Deveria votar com sucesso', res.data);
    ok(res.data.data.total_upvotes === 1, 'Contador UP deveria ser 1', res.data);
  });

  await runCase('Voto: Prevenir Duplicidade', async () => {
    const res = await api.post(
      `/posts/${postId}/votar`,
      { tipo: 'UP' },
      { headers: auth() }
    );

    ok(res.status === 400, 'Deveria bloquear voto duplicado', res.data);
  });

  await runCase('Voto: DOWN altera contador corretamente', async () => {
    const res = await api.post(
      `/posts/${postId}/votar`,
      { tipo: 'DOWN' },
      { headers: auth() }
    );

    ok(res.status === 200, 'Deveria permitir alterar voto', res.data);
    ok(res.data.data.total_downvotes === 1, 'Contador DOWN deveria ser 1', res.data);
  });

  // ============================
  // 2️⃣ COMENTÁRIOS
  // ============================

  await runCase('Comentário: Adicionar', async () => {
    const res = await api.post(
      `/posts/${postId}/comentarios`,
      { texto: 'Teste de comentário válido' },
      { headers: auth() }
    );

    ok(res.status === 201, 'Deveria comentar', res.data);
  });

  await runCase('Comentário: Bloquear vazio', async () => {
    const res = await api.post(
      `/posts/${postId}/comentarios`,
      { texto: '' },
      { headers: auth() }
    );

    ok(res.status === 400, 'Deveria bloquear comentário vazio', res.data);
  });

  // ============================
  // 3️⃣ DENÚNCIAS
  // ============================

  await runCase('Denúncia: Criar', async () => {
    const res = await api.post(
      `/denuncias/${postId}`,
      {
        motivo: 'Conteúdo impróprio'
      },
      { headers: auth() }
    );

    ok(res.status === 201, 'Deveria denunciar', res.data);
  });

  await runCase('Denúncia: Bloquear duplicada', async () => {
    const res = await api.post(
      `/denuncias/${postId}`,
      {
        motivo: 'Conteúdo impróprio'
      },
      { headers: auth() }
    );

    ok(res.status === 400, 'Deveria bloquear denúncia duplicada', res.data);
  });

  // ============================
  // 4️⃣ FILTROS
  // ============================

  await runCase('Filtros: Ordenar por score', async () => {
    const res = await api.get('/posts?ordenarPor=score');

    ok(res.status === 200, 'Deveria listar ordenado por score', res.data);
    ok(Array.isArray(res.data.data), 'Retorno deveria ser array', res.data);
  });

  await runCase('Filtros: Ordenar por data', async () => {
    const res = await api.get('/posts?ordenarPor=data');

    ok(res.status === 200, 'Deveria listar ordenado por data', res.data);
  });

  // ============================
  // 5️⃣ VALIDAÇÃO DE SEGURANÇA
  // ============================

  await runCase('Segurança: Bloquear voto sem token', async () => {
    const res = await api.post(`/posts/${postId}/votar`, { tipo: 'UP' });

    ok(res.status === 401, 'Deveria exigir autenticação', res.data);
  });

  await runCase('Segurança: Bloquear comentário sem token', async () => {
    const res = await api.post(`/posts/${postId}/comentarios`, {
      texto: 'Sem token'
    });

    ok(res.status === 401, 'Deveria exigir autenticação', res.data);
  });

  console.log('🏁 Todos os testes sociais passaram com sucesso.');
}

// ========================================
// EXECUÇÃO
// ========================================
async function main() {
  try {
    await setup();
    await runSocialTests();
    process.exit(0);
  } catch (e: any) {
    logger.error('Erro fatal nos testes sociais', { error: e.message });
    process.exit(1);
  }
}

main();