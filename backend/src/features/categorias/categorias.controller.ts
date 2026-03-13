import { Request, Response } from 'express';
import { tratarAssincrono } from '../../shared/utils/asyncHandler';
import categoriasService, { deixarDeSeguirCategoria, listarInteresses, seguirCategoria, buscarCategoriasEmAlta } from './categorias.service';
import { CategoriaCreateBody, CategoriaUpdateBody, ToggleInteresseSchema } from '../../shared/types/categoria.types';
import { AppError } from '../../shared/utils/AppError';

// Tipagem explícita para evitar erros de nomes de parâmetros na URL
type CategoriaIdParams = { id: string };
type EmptyBody = Record<string, never>;

const listar = tratarAssincrono(async (req: Request, res: Response) => {
    const data = await categoriasService.listar(req.requestId);
    res.status(200).json({ 
        status: 'success',
        message: "Categorias listadas com sucesso.",
        data,
        meta: null
    });
});

const criar = tratarAssincrono(async (req: Request<{}, {}, CategoriaCreateBody>, res: Response) => {
    // 🛡️ Extração limpa: O Middleware Zod já garantiu que 'nome' existe e é válido.
    const { nome } = req.body;
    const nova = await categoriasService.criar({ nome }, req.requestId);
    
    res.status(201).json({ 
        status: 'success',
        message: "Categoria criada com sucesso.", 
        data: nova,
        meta: null
    });
});

const atualizar = tratarAssincrono(async (req: Request<CategoriaIdParams, any, CategoriaUpdateBody>, res: Response) => {
    const id = Number(req.params.id);
    const { nome } = req.body;

    // 🛡️ Proteção contra IDs malformados ou ataques de estouro de inteiro
    if (isNaN(id) || !Number.isSafeInteger(id) || id <= 0) {
        throw AppError.badRequest("ID de categoria inválido.");
    }

    const editada = await categoriasService.atualizar(id, { nome }, req.requestId);
    
    res.status(200).json({ 
        status: 'success',
        message: "Categoria atualizada com sucesso.", 
        data: editada,
        meta: null
    });
});

const excluir = tratarAssincrono(async (req: Request<CategoriaIdParams, any, EmptyBody>, res: Response) => {
    const id = Number(req.params.id);

    if (isNaN(id) || !Number.isSafeInteger(id) || id <= 0) {
        throw AppError.badRequest("ID de categoria inválido.");
    }

    await categoriasService.excluir(id, req.requestId);
    
    res.status(200).json({
        status: 'success',
        message: "Categoria excluída com sucesso.",
        data: null,
        meta: null
    });
});

export default { listar, criar, atualizar, excluir };

// ====== Fusão de Interesses (Taxonomia) ======
export const listarInteressesCategoria = tratarAssincrono(async (req: Request, res: Response) => {
    const perfilId = req.perfil_id;
    if (!perfilId || !Number.isSafeInteger(perfilId)) {
        throw AppError.unauthorized("Usuário não autenticado.");
    }
    const interesses = await listarInteresses(perfilId, req.requestId);
    return res.status(200).json({
        status: 'success',
        message: "Interesses listados com sucesso.",
        data: interesses,
        meta: null
    });
});

export const seguirCategoriaController = tratarAssincrono(async (req: Request<CategoriaIdParams, any, EmptyBody>, res: Response) => {
    const perfilId = req.perfil_id;
    const categoriaId = Number(req.params.id);
    if (!perfilId || !Number.isSafeInteger(perfilId)) {
        throw AppError.unauthorized("Sessão inválida ou perfil não identificado.");
    }
    ToggleInteresseSchema.parse({ categoria_id: categoriaId });
    await seguirCategoria(perfilId, categoriaId, req.requestId);
    return res.status(201).json({ status: 'success', message: "Agora você segue esta categoria.", data: null, meta: null });
});

export const deixarDeSeguirCategoriaController = tratarAssincrono(async (req: Request<CategoriaIdParams, any, EmptyBody>, res: Response) => {
    const perfilId = req.perfil_id;
    const categoriaId = Number(req.params.id);
    if (!perfilId || !Number.isSafeInteger(perfilId)) {
        throw AppError.unauthorized("Sessão expirada. Faça login novamente.");
    }
    ToggleInteresseSchema.parse({ categoria_id: categoriaId });
    await deixarDeSeguirCategoria(perfilId, categoriaId, req.requestId);
    return res.status(200).json({ status: 'success', message: "Você deixou de seguir esta categoria.", data: null, meta: null });
});

export const getTrending = tratarAssincrono(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 5;
    const data = await buscarCategoriasEmAlta(limit, req.requestId);
    
    return res.status(200).json({
        status: 'success',
        message: "Trending tags recuperadas.",
        data,
        meta: null
    });
});
