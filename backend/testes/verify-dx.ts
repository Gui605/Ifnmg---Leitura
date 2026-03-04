import { spawn } from 'child_process';
import axios from 'axios';
import path from 'path';

const PORT = 3005; // Porta diferente para evitar conflitos
const SERVER_URL = `http://localhost:${PORT}`;

async function runTest() {
  console.log('🚀 Iniciando servidor para validação de DX...');
  
  // Inicia o servidor em processo filho
  const server = spawn('npx', ['tsx', 'src/server.ts'], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test' },
    shell: true,
    cwd: path.resolve(__dirname, '../')
  });

  let requestsExecuted = false;

  server.stdout.on('data', async (data) => {
    const output = data.toString();
    // console.log(output); // Uncomment for debug
    
    if (output.includes('Servidor rodando') && !requestsExecuted) {
      requestsExecuted = true;
      console.log('✅ Servidor online. Executando testes...');
      
      // Aguarda um pouco para garantir inicialização
      await new Promise(r => setTimeout(r, 1000));
      await executeRequests();
      
      console.log('🛑 Encerrando servidor...');
      // No Windows, matar via tree-kill ou taskkill é mais garantido, mas tentaremos .kill()
      spawn("taskkill", ["/pid", server.pid?.toString() || "", "/f", "/t"]);
      process.exit(0);
    }
  });

  server.stderr.on('data', (data) => {
    // Ignora warnings de deps experimentais
    if (!data.toString().includes('ExperimentalWarning')) {
        console.error(`stderr: ${data}`);
    }
  });

  async function executeRequests() {
    try {
      // --- TESTE 1: JSON Malformado ---
      console.log('\n🧪 Teste 1: Enviando JSON com vírgula extra (Malformado)...');
      try {
        // Envia string bruta com erro de sintaxe
        await axios.post(`${SERVER_URL}/api/v1/auth/login`, '{"email": "teste@teste.com", "senha": "123",}', {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error: any) {
        if (error.response) {
            const { status, data } = error.response;
            console.log(`📥 Resposta: Status ${status}`);
            console.log(`📦 Payload:`, JSON.stringify(data, null, 2));
            
            if (status === 400 && data.errorCode === 'INVALID_JSON_FORMAT') {
                console.log('✅ SUCESSO: Erro capturado e formatado corretamente.');
            } else {
                console.log('❌ FALHA: Resposta inesperada.');
                process.exit(1);
            }
        } else {
            console.error('❌ Erro de conexão:', error.message);
        }
      }

    } catch (err) {
      console.error('❌ Erro fatal no teste:', err);
    }
  }
}

runTest();
