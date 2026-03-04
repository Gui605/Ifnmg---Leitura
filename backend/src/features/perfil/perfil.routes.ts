import { Router } from 'express';
import perfilController from './perfil.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware'; 
import { validate } from '../../shared/middlewares/validate.middleware';
import { 
    UpdatePerfilSchema, 
    SenhaPatchSchema, 
    DeletarContaSchema 
} from '../../shared/types/perfil.types';

/**
 * 💡 PADRÃO ENTERPRISE EVOLUÍDO:
 * Substituímos listas manuais de strings por Schemas de Validação (Zod).
 * Isso garante que o contrato da API seja a "Única Fonte de Verdade".
 */

const perfilRoutes = Router();

// 🛡️ Camada 1: Identidade (Token JWT deve ser válido)
perfilRoutes.use(middlewareAutenticacao); 

// --- 👤 Gestão de Informações Pessoais ---

/** * GET /me -> Recupera dados do perfil logado
 */
perfilRoutes.get('/me', perfilController.getPerfilInfo);

/** * PATCH /me -> Atualização de dados básicos
 * 🛡️ Camada 2: Validação de Contrato (Apenas campos permitidos pelo Zod)
 */
perfilRoutes.patch(
    '/me', 
    validate(UpdatePerfilSchema), 
    perfilController.updatePerfil
);


// --- 🔐 Operações de Segurança Crítica ---

/** * PATCH /seguranca/senha -> Troca de credenciais
 * 🛡️ Camada 2: O Zod valida força da senha e se a confirmação é idêntica.
 */
perfilRoutes.patch(
    '/seguranca/senha', 
    validate(SenhaPatchSchema),
    perfilController.alterarSenha
);

/** * DELETE /seguranca/conta -> Encerramento de conta
 * 🛡️ Camada 2: Exige apenas a senha atual para confirmação.
 */
perfilRoutes.delete(
    '/seguranca/conta', 
    validate(DeletarContaSchema),
    perfilController.deletarPerfil
);

export default perfilRoutes;
