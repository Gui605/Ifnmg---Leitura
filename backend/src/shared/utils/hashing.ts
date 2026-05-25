import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

//Transforma a senha em texto simples em um hash seguro.
export async function gerarHashSenha(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

//Compara a senha enviada pelo usuário com o hash armazenado no banco.
export async function compararSenha(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}
