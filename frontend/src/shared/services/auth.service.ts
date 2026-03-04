import { apiClient } from '../utils/apiClient';
import {
  LoginCredentials,
  AuthResponse,
  RegisterPayload,
  RegisterResponse,
  AuthResponseSchema,
  RegisterResponseSchema
} from '../types/auth.types';

export async function fazerLogin(credenciais: LoginCredentials): Promise<AuthResponse> {
  return apiClient.post('/auth/logar', { email: credenciais.email, senha: credenciais.senha }, AuthResponseSchema, undefined, (raw) => ({
    token: raw?.data?.token ?? raw?.token
  })) as Promise<AuthResponse>;
}

export async function registrarUsuario(body: RegisterPayload): Promise<RegisterResponse> {
  const payload = { 
    nome_completo: body.nome_completo,
    nome_user: body.nome_user,
    nome_campus: body.nome_campus,
    data_nascimento: body.data_nascimento,
    email: body.email, 
    senha: body.senha 
  };
  return apiClient.post('/auth/registrar', payload, RegisterResponseSchema, undefined, (raw, resp) => ({
    status: resp.status,
    message: raw?.message || 'Cadastro realizado! Verifique seu e-mail institucional para ativar a conta.'
  })) as Promise<RegisterResponse>;
}

export async function solicitarRecuperacao(email: string): Promise<{ status: number; message: string }> {
  return apiClient.post('/auth/solicitar-recuperacao', { email }, RegisterResponseSchema, undefined, (raw, resp) => ({
    status: resp.status,
    message: raw?.message || 'Se este e-mail estiver cadastrado, um link de recuperação será enviado.'
  })) as Promise<RegisterResponse>;
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<{ status: number; message: string }> {
  return apiClient.post('/auth/redefinir-senha', { token, novaSenha }, RegisterResponseSchema, undefined, (raw, resp) => ({
    status: resp.status,
    message: raw?.message || 'Senha alterada com sucesso.'
  })) as Promise<RegisterResponse>;
}
