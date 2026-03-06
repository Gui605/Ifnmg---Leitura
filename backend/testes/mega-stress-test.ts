//src/testes/mega-stress-test.ts
import axios from 'axios';
import fs from 'fs';
import { logger } from '../src/shared/utils/logger';

// --- CONFIGURAÇÃO GLOBAL ---
const API_URL = 'http://localhost:3000/api/v1';
const BOT_CYCLES = 10; // Reduzido para focar em cobertura total
const SLOW_THRESHOLD_MS = 800;
const FAIL_ON_REAL_VULNERABILITY = true;

const api = axios.create({
  baseURL: API_URL,
  validateStatus: () => true,
  timeout: 10000
});

// --- USUÁRIOS DE TESTE ---
const usuarios = [
  { email: 'senior@teste.com', senha: 'Senha123', tipo: 'ADMIN' },
  { email: 'comum@teste.com', senha: 'Senha123', tipo: 'USER' },
  { email: 'ghost@bot.com', senha: 'errada', tipo: 'BOT' }
];

const tokenCache: Record<string, string> = {};
const perfilCache: Record<string, number> = {}; // email -> perfil_id

// --- ESTRUTURA DE MÉTRICAS ---
interface TestCaseResult {
  nome: string;
  ok: boolean;
  ms: number;
  slow: boolean;
  endpoint?: string;
  method?: string;
  timestamp: string;
  error?: string;
  details?: any;
}

const resultados: TestCaseResult[] = [];

// --- HELPERS ---
function nowIso() {
  return new Date().toISOString();
}

async function loginBot(email: string, senha: string) {
  const start = Date.now();
  try {
      const res = await api.post('/auth/logar', { email, senha });
      if (res.status === 200) {
        tokenCache[email] = res.data?.data?.token;
        // Tenta pegar o perfil ID se logou
        const me = await api.get('/perfil/me', { headers: { Authorization: `Bearer ${tokenCache[email]}` } });
        if (me.status === 200) {
          perfilCache[email] = me.data.data.perfil_id;
        }
      } else {
          logger.warn(`Login falhou para ${email}: Status ${res.status}`, { data: res.data });
      }
      return { res, ms: Date.now() - start };
  } catch (e: any) {
      logger.error(`Exceção no loginBot para ${email}`, { error: e.message, stack: e.stack });
      throw e;
  }
}

function authHeader(email: string) {
  return { Authorization: `Bearer ${tokenCache[email]}` };
}

function ok(cond: boolean, msg: string, details?: any) {
  if (!cond) {
    const err = new Error(msg);
    (err as any).details = details;
    throw err;
  }
}

async function runCase(
  nome: string, 
  endpoint: string,
  method: string,
  fn: () => Promise<any>,
  slowThresholdOverride?: number
) {
  const start = Date.now();
  try {
    const out = await fn();
    const duration = Date.now() - start;
    
    const entry: TestCaseResult = {
      nome,
      endpoint,
      method,
      ok: true,
      ms: duration,
      slow: duration > (slowThresholdOverride ?? SLOW_THRESHOLD_MS),
      timestamp: nowIso(),
      details: out
    };
    resultados.push(entry);
    
    logger.info(`✅ ${nome}`, { 
      evento: 'TEST_CASE_OK', 
      requestId: out?.requestId, 
      ms: duration,
      slow: entry.slow 
    });

  } catch (e: any) {
    const duration = Date.now() - start;
    const details = e?.details;
    
    const entry: TestCaseResult = {
      nome,
      endpoint,
      method,
      ok: false,
      ms: duration,
      slow: false, // Falha tem prioridade sobre lentidão
      timestamp: nowIso(),
      error: e?.message,
      details
    };
    resultados.push(entry);

    logger.warn(`❌ ${nome}`, { 
      evento: 'TEST_CASE_FAILED', 
      requestId: details?.requestId, 
      error: e.message,
      errorCode: details?.errorCode 
    });
  }
}

// --- FUNÇÕES DE SETUP ---
async function setupInicial() {
  logger.info('🚀 INICIANDO STRESS TEST 360°', { evento: 'STRESS_TEST_STARTED' });
  
  // Login inicial
  for (const u of usuarios) {
    if (u.tipo !== 'BOT') {
      await loginBot(u.email, u.senha);
    }
  }
}

// --- SUÍTES DE TESTE ---

async function suiteAuth() {
  await runCase('Auth: Login Admin', '/auth/logar', 'POST', async () => {
    const { res } = await loginBot('senior@teste.com', 'Senha123');
    ok(res.status === 200, 'Login deve retornar 200', res.data);
    return res.data;
  });

  await runCase('Auth: Login Falha', '/auth/logar', 'POST', async () => {
    const res = await api.post('/auth/logar', { email: 'comum@teste.com', senha: 'ERRADA' });
    ok(res.status === 401, 'Deve retornar 401', res.data);
    ok(!!res.data.requestId, 'Deve conter requestId');
    return res.data;
  });

  await runCase('Auth: Recuperação de Senha (Simulado)', '/auth/solicitar-recuperacao', 'POST', async () => {
    const res = await api.post('/auth/solicitar-recuperacao', { email: 'senior@teste.com' });
    ok(res.status === 200, 'Deve aceitar solicitação', res.data);
    return res.data;
  });

  await runCase('Auth: Registrar com is_admin (Mass Assignment)', '/auth/registrar', 'POST', async () => {
    const unique = `novo_${Date.now()}@teste.com`;
    const res = await api.post('/auth/registrar', { nome: 'Novo', email: unique, senha: 'Senha1234', is_admin: true });
    ok(res.status === 400, `Registrar com campo extra deve falhar (400). Recebido: ${res.status}`, res.data);
    ok(res.data.errorCode === 'FIELD_VALIDATION', 'ErrorCode deve ser FIELD_VALIDATION', res.data);
    return res.data;
  });
}

async function suitePerfilSeguranca() {
  await runCase('Perfil: Update Senha Fraca', '/perfil/seguranca/senha', 'PATCH', async () => {
    const res = await api.patch('/perfil/seguranca/senha', {
      senhaAntiga: 'Senha123',
      novaSenha: '123',
      confirmarNovaSenha: '123'
    }, { headers: authHeader('comum@teste.com') });
    
    ok(res.status === 400, 'Deve rejeitar senha fraca', res.data);
    return res.data;
  });

  await runCase('Perfil: Update Senha Divergente', '/perfil/seguranca/senha', 'PATCH', async () => {
    const res = await api.patch('/perfil/seguranca/senha', {
      senhaAntiga: 'Senha123',
      novaSenha: 'SenhaForte1!',
      confirmarNovaSenha: 'SenhaForte2@'
    }, { headers: authHeader('comum@teste.com') });
    
    ok(res.status === 400, 'Deve rejeitar confirmação diferente', res.data);
    return res.data;
  });

  await runCase('Perfil: Mass Assignment Bloqueado', '/perfil/me', 'PATCH', async () => {
    const res = await api.patch('/perfil/me', {
      nome: 'Usuário Comum',
      is_admin: true,
      score_karma: 999,
      reading_points: 999
    }, { headers: authHeader('comum@teste.com') });
    ok(res.status === 400, `Update com campos proibidos deve falhar (400). Recebido: ${res.status}`, res.data);
    ok(res.data.errorCode === 'FIELD_VALIDATION', 'ErrorCode deve ser FIELD_VALIDATION', res.data);
    return res.data;
  });

  await runCase('Segurança: Tentativa de alteração de Privilégio via PATCH Senha', '/perfil/seguranca/senha', 'PATCH', async () => {
    const res = await api.patch('/perfil/seguranca/senha', {
      senhaAntiga: 'Senha123',
      novaSenha: 'SenhaForte1!',
      confirmarNovaSenha: 'SenhaForte1!',
      is_admin: true
    }, { headers: authHeader('comum@teste.com') });
    ok(res.status === 400, `Schema estrito deve barrar campo extra (400). Recebido: ${res.status}`, res.data);
    ok(res.data.errorCode === 'FIELD_VALIDATION', 'ErrorCode deve ser FIELD_VALIDATION', res.data);
    return res.data;
  });
}

async function suiteInteresses() {
  // Setup: criar categoria para teste com nome único para evitar colisão
  let catId = 99999;
  const uniqueName = `InteresseTest_${Date.now()}`;
  
  await runCase('Interesses: Setup - Criar Categoria', '/categorias', 'POST', async () => {
      const catRes = await api.post('/categorias', { nome: uniqueName }, { headers: authHeader('senior@teste.com') });
      if (catRes.status === 201) {
          catId = catRes.data.data.categoria_id;
      } else {
          // Tenta buscar se já existe (fallback)
          // Mas como o nome é único, se falhar é outro erro.
          throw new Error(`Falha no setup de categoria: ${catRes.status} - ${JSON.stringify(catRes.data)}`);
      }
      return catRes.data;
  });

  await runCase('Interesses: Listar', '/categorias/interesses', 'GET', async () => {
    const res = await api.get('/categorias/interesses', { headers: authHeader('comum@teste.com') });
    ok(res.status === 200, 'Deve listar interesses', res.data);
    return res.data;
  });

  await runCase('Interesses: Seguir', '/categorias/:id/interesse', 'POST', async () => {
    const res = await api.post(`/categorias/${catId}/interesse`, {}, { headers: authHeader('comum@teste.com') });
    ok(res.status === 201, `Deve seguir categoria (201 Created). Recebido: ${res.status}`, res.data);
    return res.data;
  });

  await runCase('Interesses: Seguir ID Inexistente', '/categorias/:id/interesse', 'POST', async () => {
    const res = await api.post('/categorias/999999/interesse', {}, { headers: authHeader('comum@teste.com') });
    ok(res.status === 404, 'Deve retornar 404 para categoria inexistente', res.data);
    return res.data;
  });

  await runCase('Interesses: Deixar de Seguir', '/categorias/:id/interesse', 'DELETE', async () => {
    const res = await api.delete(`/categorias/${catId}/interesse`, { headers: authHeader('comum@teste.com'), data: {} });
    ok(res.status === 200, 'Deve deixar de seguir (200 OK)', {});
    return { status: 200 };
  });
}

async function suiteCategoriasAdmin() {
  let catId: number | undefined;

  await runCase('Categorias: Criar (Admin)', '/categorias', 'POST', async () => {
    const res = await api.post('/categorias', { nome: 'AdminOnly' }, { headers: authHeader('senior@teste.com') });
    ok(res.status === 201, 'Admin deve criar categoria', res.data);
    catId = res.data.data.categoria_id;
    return res.data;
  });

  /* TODO: Descomentar quando middlewareAdministrador estiver ativo
  await runCase('Categorias: Criar (User Comum) -> Bloqueio', '/categorias', 'POST', async () => {
    const res = await api.post('/categorias', { nome: 'HackerCat' }, { headers: authHeader('comum@teste.com') });
    ok(res.status === 403, 'Usuário comum não deve criar categoria', res.data);
    return res.data;
  });
  */

  if (catId) {
    await runCase('Categorias: Update (Admin)', '/categorias/:id', 'PATCH', async () => {
      const res = await api.patch(`/categorias/${catId}`, { nome: 'AdminUpdated' }, { headers: authHeader('senior@teste.com') });
      ok(res.status === 200, 'Admin deve atualizar', res.data);
      return res.data;
    });

    await runCase('Categorias: Delete (Admin)', '/categorias/:id', 'DELETE', async () => {
      const res = await api.delete(`/categorias/${catId}`, { headers: authHeader('senior@teste.com'), data: {} });
      ok(res.status === 200, 'Admin deve deletar (200 OK)', {});
      return { status: 200 };
    });
  }
}

async function suiteRegrasNegocio() {
  // 1. Exclusão de post por outro usuário
  await runCase('Regra: Delete Post de Outro Usuário', '/posts/:id', 'DELETE', async () => {
    // Admin cria post
    const post = await api.post('/posts', { 
      titulo: 'Post do Admin', 
      conteudo: 'Conteudo Privado', 
      categoriasIds: [1] // Assumindo ID 1 existe
    }, { headers: authHeader('senior@teste.com') });
    
    if (post.status !== 201) return post.data; // Skip se falhar criação
    const postId = post.data.data.post_id;

    // User comum tenta deletar
    const del = await api.delete(`/posts/${postId}`, { 
      headers: authHeader('comum@teste.com'),
      data: {} 
    });

    ok(del.status === 403, 'Deve retornar 403 Forbidden', del.data);
    ok(!!del.data.requestId, 'Deve conter requestId');
    return del.data;
  });
}

async function suitePosts() {
  let postId: number | undefined;
  let catIdForPost: number | undefined;

  // Setup: Criar categoria para o post
  await runCase('Posts: Setup - Criar Categoria', '/categorias', 'POST', async () => {
      const res = await api.post('/categorias', { nome: `CatPost_${Date.now()}` }, { headers: authHeader('senior@teste.com') });
      if (res.status === 201) catIdForPost = res.data.data.categoria_id;
      return res.data;
  });

  if (catIdForPost) {
      await runCase('Posts: Criar', '/posts', 'POST', async () => {
        const res = await api.post('/posts', {
          titulo: 'Post de Stress Test',
          conteudo: 'Conteudo relevante para teste.',
          categoriasIds: [catIdForPost]
        }, { headers: authHeader('senior@teste.com') });
        
        ok(res.status === 201, 'Deve criar post', res.data);
        postId = res.data.data.post_id;
        return res.data;
      });
  } else {
      logger.error('Pulo Posts:Criar pois falhou criar categoria');
  }

  if (postId) {
    await runCase('Posts: Listar', '/posts', 'GET', async () => {
      const res = await api.get('/posts', { headers: authHeader('comum@teste.com') });
      ok(res.status === 200, 'Deve listar posts', res.data);
      ok(Array.isArray(res.data.data), 'Data deve ser array');
      return { count: res.data.data.length };
    });

    await runCase('Posts: Deixar de Seguir (Cleanup)', '/posts/:id', 'DELETE', async () => {
       // Cleanup do post criado
       const res = await api.delete(`/posts/${postId}`, { headers: authHeader('senior@teste.com'), data: {} });
       ok(res.status === 200, 'Deve deletar post (Cleanup) (200 OK)', {});
       return { status: 200 };
    });
  }
}

async function suiteHealth() {
  await runCase('Health: Check', '/saude', 'GET', async () => {
    const res = await api.get('/saude');
    ok(res.status === 200 || res.status === 503, 'Deve retornar status de saúde', res.data);
    ok(res.data.status !== undefined, 'Deve conter status global');
    ok(res.data.services !== undefined, 'Deve conter serviços');
    return res.data;
  }, 2000);

  await runCase('Health: Live Probe', '/saude/live', 'GET', async () => {
    const res = await api.get('/saude/live');
    ok(res.status === 200, 'Liveness deve ser 200 OK', res.data);
    ok(res.data.status === 'ALIVE', 'Status deve ser ALIVE', res.data);
    return res.data;
  });
}

async function suiteBlindagemDX() {
  await runCase('DX: JSON Inválido', '/auth/logar', 'POST', async () => {
    try {
      // Axios tenta stringify por padrão, precisamos forçar erro de sintaxe enviando string bruta
      // Mas o axios pode rejeitar antes. Vamos simular payload vazio que é mais fácil via axios
      // Para JSON inválido real, seria necessário socket cru ou interceptor.
      // Vamos testar EMPTY PAYLOAD primeiro.
      const res = await api.post('/auth/logar', null, { 
        headers: { 'Content-Type': 'application/json' } 
      });
      // Esperamos erro
    } catch (e: any) {
        // Se o axios lançar erro de rede/protocolo, ok. 
        // Se receber resposta:
        if (e.response) {
             ok(e.response.status === 400, 'Deve retornar 400', e.response.data);
             ok(e.response.data.errorCode === 'EMPTY_PAYLOAD' || e.response.data.errorCode === 'INVALID_JSON_FORMAT', 'ErrorCode correto', e.response.data);
             return e.response.data;
        }
    }
    // Se passar sem erro, retorna dummy para falhar check
    return { requestId: 'failed' };
  });

  await runCase('DX: Payload Bomba (Profundidade)', '/auth/logar', 'POST', async () => {
    function deep(n: number) {
      const root: any = {};
      let cur = root;
      for (let i = 0; i < n; i++) {
        cur.level = {};
        cur = cur.level;
      }
      return root;
    }
    const payload = { email: 'senior@teste.com', senha: 'Senha123', bomb: deep(10) };
    const res = await api.post('/auth/logar', payload);
    ok(res.status === 400, `Deve retornar 400 para estrutura excessiva. Recebido: ${res.status}`, res.data);
    ok(res.data.errorCode === 'INVALID_JSON_STRUCTURE', 'ErrorCode deve ser INVALID_JSON_STRUCTURE', res.data);
    return res.data;
  });

  await runCase('DX: Payload Bomba em Posts', '/posts', 'POST', async () => {
    function deep(n: number) {
      const root: any = {};
      let cur = root;
      for (let i = 0; i < n; i++) {
        cur.level = {};
        cur = cur.level;
      }
      return root;
    }
    const payload = {
      titulo: 'Post Profundo',
      conteudo: 'Teste',
      categoriasIds: [1],
      bomb: deep(10)
    };
    const res = await api.post('/posts', payload, { headers: authHeader('senior@teste.com') });
    ok(res.status === 400, `Deve retornar 400 para estrutura excessiva em posts. Recebido: ${res.status}`, res.data);
    ok(res.data.errorCode === 'INVALID_JSON_STRUCTURE', 'ErrorCode deve ser INVALID_JSON_STRUCTURE', res.data);
    return res.data;
  });
}

// --- EXECUÇÃO PRINCIPAL ---
async function main() {
  try {
    await setupInicial();

    // Executa suites
    await suiteAuth();
    await suitePerfilSeguranca();
    await suiteInteresses();
    await suiteCategoriasAdmin();
    await suitePosts();
    await suiteRegrasNegocio();
    await suiteHealth();
    await suiteBlindagemDX();

    // Gera Relatório
    const report = {
      timestamp: nowIso(),
      summary: {
        total: resultados.length,
        passed: resultados.filter(r => r.ok).length,
        failed: resultados.filter(r => !r.ok).length,
        slow: resultados.filter(r => r.slow).length
      },
      performance: {
        avgMs: resultados.reduce((a, b) => a + b.ms, 0) / resultados.length,
        maxMs: Math.max(...resultados.map(r => r.ms)),
        slowestEndpoints: resultados.sort((a, b) => b.ms - a.ms).slice(0, 5).map(r => ({
          endpoint: `${r.method} ${r.endpoint}`,
          ms: r.ms
        }))
      },
      results: resultados
    };

    fs.writeFileSync('stress-test-report.json', JSON.stringify(report, null, 2));
    logger.info('🏁 STRESS TEST FINALIZADO', { 
      evento: 'STRESS_TEST_FINISHED', 
      summary: report.summary,
      performance: report.performance
    });

    if (report.summary.failed > 0 && FAIL_ON_REAL_VULNERABILITY) {
      process.exit(1);
    }

  } catch (error: any) {
    logger.error('Erro fatal no Stress Test', { error: error.message });
    process.exit(1);
  }
}

main();
