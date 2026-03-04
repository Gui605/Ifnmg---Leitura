"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seguirCategoria = seguirCategoria;
exports.deixarDeSeguirCategoria = deixarDeSeguirCategoria;
exports.listarInteresses = listarInteresses;
const prisma_client_1 = __importDefault(require("../../shared/prisma/prisma.client"));
const AppError_1 = require("../../shared/utils/AppError");
async function listar(requestId) {
    const data = await prisma_client_1.default.categorias.findMany({
        orderBy: { nome: 'asc' }
    });
    return data;
}
// buscarPorId será implementado em painel admin
async function buscarPorId(id, requestId) {
    if (!id || isNaN(id))
        throw AppError_1.AppError.badRequest('ID inválido.');
    const categoria = await prisma_client_1.default.categorias.findUnique({
        where: { categoria_id: id }
    });
    if (!categoria)
        throw AppError_1.AppError.notFound('Categoria não encontrada.');
    return categoria;
}
async function criar(data, requestId) {
    const nomeLimpo = data.nome?.trim();
    if (!nomeLimpo)
        throw AppError_1.AppError.badRequest('O nome da categoria é obrigatório.');
    // 🛡️ SOLUÇÃO UNIVERSAL: Busca o registro e compara no JavaScript
    // Isso funciona em SQLite, MySQL e Postgres sem erro de 'mode'
    const existe = await prisma_client_1.default.categorias.findFirst({
        where: { nome: nomeLimpo } // Busca exata primeiro (mais rápido)
    });
    // Se não achou exato, fazemos uma busca de segurança para evitar "TI" e "ti"
    if (!existe) {
        const todas = await prisma_client_1.default.categorias.findMany({ select: { nome: true } });
        const alvo = nomeLimpo.toLowerCase();
        const duplicadoCase = todas.some(({ nome }) => nome.toLowerCase() === alvo);
        if (duplicadoCase)
            throw AppError_1.AppError.conflict('Já existe uma categoria com este nome (mesmo que com letras maiúsculas/minúsculas diferentes).');
    }
    else {
        throw AppError_1.AppError.conflict('Já existe uma categoria cadastrada com este nome.');
    }
    const created = await prisma_client_1.default.categorias.create({
        data: { nome: nomeLimpo }
    });
    return created;
}
async function atualizar(id, data, requestId) {
    if (!id || isNaN(id))
        throw AppError_1.AppError.badRequest('ID inválido.');
    const nomeLimpo = data.nome?.trim();
    if (!nomeLimpo)
        throw AppError_1.AppError.badRequest('O novo nome é obrigatório.');
    if (nomeLimpo.toLowerCase() === 'geral') {
        throw AppError_1.AppError.badRequest('O nome "Geral" é reservado para o sistema.');
    }
    const categoria = await prisma_client_1.default.categorias.findUnique({ where: { categoria_id: id } });
    if (!categoria)
        throw AppError_1.AppError.notFound('Categoria não encontrada.');
    // Verifica duplicidade manual (Universal)
    const todasExcetoEsta = await prisma_client_1.default.categorias.findMany({
        where: { NOT: { categoria_id: id } },
        select: { nome: true }
    });
    const novoNome = nomeLimpo.toLowerCase();
    const duplicada = todasExcetoEsta.some(({ nome }) => nome.toLowerCase() === novoNome);
    if (duplicada)
        throw AppError_1.AppError.conflict('Já existe outra categoria com este nome.');
    const updated = await prisma_client_1.default.categorias.update({
        where: { categoria_id: id },
        data: { nome: nomeLimpo }
    });
    return updated;
}
async function excluir(id, requestId) {
    if (!id || isNaN(id))
        throw AppError_1.AppError.badRequest('ID inválido.');
    const vinculacoes = await prisma_client_1.default.postsCategorias.count({
        where: { categoria_id: id }
    });
    if (vinculacoes > 0) {
        throw AppError_1.AppError.conflict(`Não é possível excluir: existem ${vinculacoes} publicações vinculadas a esta categoria.`);
    }
    const deleted = await prisma_client_1.default.categorias.delete({
        where: { categoria_id: id }
    });
    return deleted;
}
exports.default = { listar, criar, atualizar, excluir };
// ====== Fusão de Interesses (Taxonomia) ======
async function seguirCategoria(perfilId, categoriaId, requestId) {
    const categoriaExiste = await prisma_client_1.default.categorias.findUnique({
        where: { categoria_id: categoriaId },
        select: { categoria_id: true }
    });
    if (!categoriaExiste) {
        throw AppError_1.AppError.notFound('A categoria que você tenta seguir não existe ou foi removida.');
    }
    await prisma_client_1.default.interesses.upsert({
        where: {
            perfil_id_categoria_id: {
                perfil_id: perfilId,
                categoria_id: categoriaId
            }
        },
        update: {},
        create: {
            perfil_id: perfilId,
            categoria_id: categoriaId
        }
    });
}
async function deixarDeSeguirCategoria(perfilId, categoriaId, requestId) {
    try {
        await prisma_client_1.default.interesses.delete({
            where: {
                perfil_id_categoria_id: {
                    perfil_id: perfilId,
                    categoria_id: categoriaId
                }
            }
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            throw AppError_1.AppError.notFound('Você não segue esta categoria ou ela já foi removida.');
        }
        throw error;
    }
}
async function listarInteresses(perfilId, requestId) {
    const interesses = await prisma_client_1.default.interesses.findMany({
        where: { perfil_id: perfilId },
        include: {
            categoria: {
                select: {
                    categoria_id: true,
                    nome: true
                }
            }
        },
        orderBy: {
            categoria: {
                nome: 'asc'
            }
        }
    });
    const out = interesses.map(item => ({
        perfil_id: item.perfil_id,
        categoria_id: item.categoria_id,
        categoria: {
            categoria_id: item.categoria.categoria_id,
            nome: item.categoria.nome
        }
    }));
    return out;
}
