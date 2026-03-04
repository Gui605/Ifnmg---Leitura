import { z } from 'zod';

export const LoginCredentialsSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});
export type LoginCredentials = z.infer<typeof LoginCredentialsSchema>;

export const AuthResponseSchema = z.object({
  token: z.string().min(1),
});
export type AuthResponse = z.infer<typeof AuthResponseSchema>;

export const RegisterPayloadSchema = z.object({
  nome_completo: z.string().min(2),
  nome_user: z.string().min(2),
  nome_campus: z.string().min(2),
  data_nascimento: z.string().min(8),
  email: z.string().email(),
  senha: z.string().min(8),
});
export type RegisterPayload = z.infer<typeof RegisterPayloadSchema>;

export const RegisterResponseSchema = z.object({
  status: z.number().int(),
  message: z.string(),
});
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
