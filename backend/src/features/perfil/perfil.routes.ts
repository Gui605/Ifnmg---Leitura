//backend/src/features/perfil/perfil.routes.ts
import { Router } from 'express';
import perfilController from './perfil.controller';
import { middlewareAutenticacao } from '../../shared/middlewares/authMiddleware'; 
import { middlewareAutenticacaoOpcional } from '../../shared/middlewares/optionalAuthMiddleware';
import { validate } from '../../shared/middlewares/validate.middleware';
import { 
    PerfilPatchSchema, 
    SenhaPatchSchema, 
    DeletarContaSchema 
} from '../../shared/types/perfil.types';


const perfilRoutes = Router();

// Identidade: O Token JWT deve ser válido
perfilRoutes.use(middlewareAutenticacao); 

// Gestão de Informações Pessoais

//GET /me -> Recupera dados do perfil logado
perfilRoutes.get('/me', perfilController.getPerfilInfo);

// PATCH /me -> Atualização de dados básicos
perfilRoutes.patch(
    '/me', 
    validate({ body: PerfilPatchSchema }),
    perfilController.updatePerfil
);


// Operações de Segurança Crítica

// PATCH /seguranca/senha -> Troca de credenciais
perfilRoutes.patch(
    '/seguranca/senha', 
    validate({ body: SenhaPatchSchema }),
    perfilController.alterarSenha
);

// DELETE /seguranca/conta -> Encerramento de conta
// Exige a senha atual para confirmação.
perfilRoutes.get(
    '/seguranca/check-exclusao',
    perfilController.checkPendenciasExclusao
);

perfilRoutes.delete(
    '/seguranca/conta', 
   validate({ body: DeletarContaSchema }),
    perfilController.deletarPerfil
);

// Sistema de Seguidores

// POST /:id/seguir
// Validação de Contrato (Apenas campo 'id' é permitido)
perfilRoutes.post(
    '/:id/seguir',
    perfilController.toggleFollow
);

// GET /:id -> Busca perfil público de terceiros
// Validação de Contrato (Apenas campo 'id' é permitido)
perfilRoutes.get(
    '/:id',
    middlewareAutenticacaoOpcional,
    perfilController.getPerfilPublico
);

export default perfilRoutes;
