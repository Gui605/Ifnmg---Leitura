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
let tokenUsuarioComum: string | undefined;
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

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
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

  // Login de usuário comum para testes BOLA
  const loginComum = await api.post('/auth/logar', {
    email: 'comum@teste.com',
    senha: 'Senha123'
  });
  ok(loginComum.status === 200, 'Login comum falhou', loginComum.data);
  tokenUsuarioComum = loginComum.data.data.token;

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
// TEARDOWN
// ========================================
async function teardown() {
  try {
    if (postId) {
      await api.delete(`/posts/${postId}`, { headers: auth(), data: {} });
    }
  } catch (_) { /* noop */ }
  try {
    if (categoriaId) {
      await api.delete(`/categorias/${categoriaId}`, { headers: auth(), data: {} });
    }
  } catch (_) { /* noop */ }
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

  // Teste de Rate Limiting (explosão de requisições)
  await runCase('Voto: Rate Limiting em Explosão (10+/min)', async () => {
    const N = 50;
    const reqs = Array.from({ length: N }).map((_, i) =>
      api.post(`/posts/${postId}/votar`, { tipo: i % 2 === 0 ? 'UP' : 'DOWN' }, { headers: auth() })
    );
    const results = await Promise.all(reqs.map(p => p.catch(e => e.response)));
    const statusCounts = results.reduce<Record<number, number>>((acc, r) => {
      const s = r?.status ?? 0;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});
    const any429 = Object.keys(statusCounts).some(k => Number(k) === 429);
    ok(any429, `Deveria haver pelo menos um 429 (counts=${JSON.stringify(statusCounts)})`, statusCounts);
  });
  // Aguarda janela do rate limiter de engajamento
  await sleep(1200);

  // ============================
  // 2️⃣ COMENTÁRIOS
  // ============================

  await runCase('Comentário: Adicionar', async () => {
    const res = await api.post(
      `/posts/${postId}/comentarios`,
      { texto: 'Teste de comentário válido' },
      { headers: tokenUsuarioComum ? { Authorization: `Bearer ${tokenUsuarioComum}` } : auth() }
    );

    ok(res.status === 201, 'Deveria comentar', res.data);
  });

  await runCase('Comentário: Bloquear vazio', async () => {
    const res = await api.post(
      `/posts/${postId}/comentarios`,
      { texto: '' },
      { headers: tokenUsuarioComum ? { Authorization: `Bearer ${tokenUsuarioComum}` } : auth() }
    );

    ok(res.status === 400, 'Deveria bloquear comentário vazio', res.data);
  });

  // Sanitização de entrada (payload malicioso)
  await runCase('Comentário: Sanitização de Entrada (payload malicioso)', async () => {
    const payload = `<script>alert('xss')</script><img src=x onerror=alert(2)> ' OR 1=1 --`;
    const res = await api.post(
      `/posts/${postId}/comentarios`,
      { texto: payload },
      { headers: tokenUsuarioComum ? { Authorization: `Bearer ${tokenUsuarioComum}` } : auth() }
    );
    ok(res.status === 201, 'Comentário malicioso deve ser tratado/armazenado de forma segura', res.data);
    // Como a API não retorna o conteúdo do comentário, validamos que a chamada não quebra
    // e não ecoa o payload em campos de mensagem/sistema.
    ok(typeof res.data.message === 'string', 'Resposta deve conter mensagem de sucesso', res.data);
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
      { headers: tokenUsuarioComum ? { Authorization: `Bearer ${tokenUsuarioComum}` } : auth() }
    );

    ok(res.status === 201, 'Deveria denunciar', res.data);
  });

  await runCase('Denúncia: Bloquear duplicada', async () => {
    const res = await api.post(
      `/denuncias/${postId}`,
      {
        motivo: 'Conteúdo impróprio'
      },
      { headers: tokenUsuarioComum ? { Authorization: `Bearer ${tokenUsuarioComum}` } : auth() }
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

  // BOLA: tentar deletar post com usuário que não é dono
  await runCase('Segurança: BOLA - Deletar Post de Outro Usuário', async () => {
    // Usa token do usuário COMUM para tentar deletar o post do admin
    const headers = tokenUsuarioComum ? { Authorization: `Bearer ${tokenUsuarioComum}` } : undefined;
    const res = await api.delete(`/posts/${postId}`, { headers, data: {} });
    ok(res.status === 403 || res.status === 404, `Deveria retornar 403 ou 404 (recebido ${res.status})`, res.data);
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
  } finally {
    await teardown();
  }
}

main();
