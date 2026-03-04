"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarHashSenha = gerarHashSenha;
exports.compararSenha = compararSenha;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
/** * 💡 PADRÃO SÊNIOR:
 * O custo do salt (SALT_ROUNDS) define a resistência contra ataques de força bruta.
 * 10 é o valor ideal para a maioria das aplicações web atuais.
 */
const SALT_ROUNDS = 10;
/**
 * Transforma a senha em texto simples em um hash seguro.
 */
async function gerarHashSenha(password) {
    return await bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
/**
 * Compara a senha enviada pelo usuário com o hash armazenado no banco.
 */
async function compararSenha(password, hash) {
    return await bcryptjs_1.default.compare(password, hash);
}
