import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';

const PORT = 3006; 
const SERVER_URL = `http://localhost:${PORT}`;

async function runTest() {
  console.log('🚀 Iniciando servidor para validação de Health Check...');
  
  const server = spawn('npx', ['tsx', 'src/server.ts'], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    shell: true,
    cwd: path.resolve(__dirname, '../')
  });

  let requestsExecuted = false;

  server.stdout.on('data', async (data) => {
    const output = data.toString();
    // console.log(output); 
    
    if (output.includes('Servidor rodando') && !requestsExecuted) {
      requestsExecuted = true;
      console.log('✅ Servidor online. Executando testes...');
      
      await new Promise(r => setTimeout(r, 2000)); // Aguarda DB conectar
      await executeRequests();
      
      console.log('🛑 Encerrando servidor...');
      spawn("taskkill", ["/pid", server.pid?.toString() || "", "/f", "/t"]);
      process.exit(0);
    }
  });

  server.stderr.on('data', (data) => {
    if (!data.toString().includes('ExperimentalWarning')) {
        console.error(`stderr: ${data}`);
    }
  });

  async function executeRequests() {
    try {
      console.log('\n🏥 Teste: GET /api/v1/saude');
      const response = await axios.get(`${SERVER_URL}/api/v1/saude`);
      
      console.log(`📥 Status: ${response.status}`);
      console.log(`📦 Body:`, JSON.stringify(response.data, null, 2));

      if (response.status === 200 && response.data.status === 'UP') {
          console.log('✅ SUCESSO: Health Check retornou UP.');
      } else if (response.status === 200 && response.data.status === 'DEGRADED') {
          console.log('⚠️ SUCESSO PARCIAL: Sistema rodando, mas possivelmente sem Email (Esperado em dev).');
      } else {
          console.log('❌ FALHA: Resposta inesperada.');
          process.exit(1);
      }

    } catch (err: any) {
      console.error('❌ Erro fatal no teste:', err.message);
      if (err.response) {
          console.log(err.response.data);
      }
    }
  }
}

runTest();
