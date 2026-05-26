# 📚 Documentação de Integração API - Frontend

## 🎯 Visão Geral

Esta documentação fornece um guia completo para integração do Frontend com a API REST do sistema IFNMG Leitura. A API foi construída seguindo padrões enterprise com foco em segurança, validação rigorosa e excelente experiência do desenvolvedor (DX).

## 🔐 Autenticação

A API utiliza **JWT (JSON Web Token)** para autenticação. O token deve ser enviado no header `Authorization` com o prefixo `Bearer`.

```http
Authorization: Bearer <seu_token_jwt>
```

### ⚠️ Importante: Formato de Variáveis
- **Snake Case**: Todas as variáveis de requisição/resposta usam snake_case (ex: `user_id`, `is_admin`)
- **Headers**: Sempre use o formato correto especificado
- **JSON**: Sempre envie `Content-Type: application/json`

---

## 📋 Grupos de Endpoints

### 1. 🔐 Autenticação

#### POST /api/v1/auth/registrar
**Descrição**: Registro de novos usuários

**Parâmetros (Body)**:
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "senha": "Senha123"
}
```

**Validações**:
- `nome`: 2-100 caracteres, obrigatório
- `email`: Formato válido de email, será convertido para lowercase
- `senha`: Mínimo 8 caracteres, deve conter pelo menos 1 letra maiúscula e 1 número

**Resposta de Sucesso (202)**:
```json
{
  "status": "success",
  "message": "Recebemos sua solicitação. Se os dados informados forem válidos e a conta ainda não estiver ativa, um link de confirmação será enviado em instantes. Caso não receba, verifique sua caixa de spam ou tente realizar o processo novamente garantindo que o e-mail foi digitado corretamente."
}
```

**Headers Necessários**: Nenhum

---

#### POST /api/v1/auth/logar
**Descrição**: Login de usuários

**Parâmetros (Body)**:
```json
{
  "email": "joao@example.com",
  "senha": "Senha123"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Login realizado com sucesso.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Headers Necessários**: Nenhum

---

#### GET /api/v1/auth/confirmar?token={token}
**Descrição**: Confirmação de email

**Parâmetros (Query)**:
- `token`: String de 64 caracteres hexadecimais

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Email confirmado com sucesso!"
}
```

**Headers Necessários**: Nenhum

---

#### POST /api/v1/auth/solicitar-recuperacao
**Descrição**: Solicitação de recuperação de senha

**Parâmetros (Body)**:
```json
{
  "email": "joao@example.com"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Se este e-mail estiver cadastrado, um link de recuperação será enviado."
}
```

**Headers Necessários**: Nenhum

---

#### POST /api/v1/auth/redefinir-senha
**Descrição**: Redefinição de senha

**Parâmetros (Body)**:
```json
{
  "token": "a1b2c3d4e5f6...",
  "novaSenha": "NovaSenha123",
  "confirmarNovaSenha": "NovaSenha123"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Senha alterada com sucesso! Você já pode fazer login."
}
```

**Headers Necessários**: Nenhum

---

#### POST /api/v1/auth/logout-all
**Descrição**: Logout global (revoga todas as sessões)

**Situação de Negócio**: Este endpoint invalida **todos os tokens JWT** ativos do usuário, forçando logout em todos os dispositivos.

**Parâmetros**: Nenhum (usa o token do header)

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Logout realizado em todas as sessões."
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

### 2. 👤 Perfil

#### GET /api/v1/perfil/me
**Descrição**: Recupera dados do perfil logado

**Resposta de Sucesso (200)**:
```json
{
  "usuario_id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "is_admin": false,
  "token_version": 1,
  "cadastro_confirmado": true,
  "data_criacao": "2024-01-15T10:30:00.000Z"
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### PATCH /api/v1/perfil/me
**Descrição**: Atualização de dados básicos do perfil

**Parâmetros (Body)**:
```json
{
  "nome": "João da Silva Santos"
}
```

**Validações**:
- `nome`: 2-100 caracteres, opcional

**Resposta de Sucesso (200)**:
```json
{
  "usuario_id": 1,
  "nome": "João da Silva Santos",
  "email": "joao@example.com",
  "is_admin": false,
  "token_version": 1,
  "cadastro_confirmado": true,
  "data_criacao": "2024-01-15T10:30:00.000Z"
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### PATCH /api/v1/perfil/seguranca/senha
**Descrição**: Troca de senha

**Parâmetros (Body)**:
```json
{
  "senhaAntiga": "SenhaAntiga123",
  "novaSenha": "NovaSenha123",
  "confirmarNovaSenha": "NovaSenha123"
}
```

**Validações**:
- `senhaAntiga`: Obrigatória
- `novaSenha`: Mínimo 8 caracteres, 1 maiúscula, 1 número
- `confirmarNovaSenha`: Deve ser idêntica à nova senha

**Resposta de Sucesso (200)**:
```json
{
  "usuario_id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "is_admin": false,
  "token_version": 2,
  "cadastro_confirmado": true,
  "data_criacao": "2024-01-15T10:30:00.000Z"
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### DELETE /api/v1/perfil/seguranca/conta
**Descrição**: Deleção de conta

**Parâmetros (Body)**:
```json
{
  "senhaAtual": "SenhaAtual123"
}
```

**Situação de Negócio**: A conta é marcada como deletada. Posts do usuário são anonimizados (autor aparece como "Usuário Excluído").

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Conta deletada com sucesso."
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

### 3. 📂 Categorias

#### GET /api/v1/categorias
**Descrição**: Listagem pública de categorias

**Resposta de Sucesso (200)**:
```json
[
  {
    "categoria_id": 1,
    "nome": "Tecnologia"
  },
  {
    "categoria_id": 2,
    "nome": "Literatura"
  }
]
```

**Headers Necessários**: Nenhum

---

#### POST /api/v1/categorias
**Descrição**: Criação de categoria (Admin)

**Parâmetros (Body)**:
```json
{
  "nome": "Nova Categoria"
}
```

**Validações**:
- `nome`: 2-50 caracteres, obrigatório

**Resposta de Sucesso (201)**:
```json
{
  "categoria_id": 3,
  "nome": "Nova Categoria"
}
```

**Headers Necessários**: `Authorization: Bearer <token>` (requer privilégios de admin)

---

#### PATCH /api/v1/categorias/:id
**Descrição**: Edição de categoria (Admin)

**Parâmetros (URL)**:
- `id`: ID numérico da categoria

**Parâmetros (Body)**:
```json
{
  "nome": "Categoria Editada"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "categoria_id": 3,
  "nome": "Categoria Editada"
}
```

**Headers Necessários**: `Authorization: Bearer <token>` (requer privilégios de admin)

---

#### DELETE /api/v1/categorias/:id
**Descrição**: Deleção de categoria (Admin)

**Parâmetros (URL)**:
- `id`: ID numérico da categoria

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Categoria deletada com sucesso."
}
```

**Headers Necessários**: `Authorization: Bearer <token>` (requer privilégios de admin)

---

### 4. ❤️ Interesses

#### GET /api/v1/interesses
**Descrição**: Listar categorias que o usuário segue

**Resposta de Sucesso (200)**:
```json
[
  {
    "categoria_id": 1,
    "nome": "Tecnologia",
    "data_seguimento": "2024-01-20T15:30:00.000Z"
  }
]
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### POST /api/v1/interesses/:categoriaId
**Descrição**: Seguir uma categoria

**Parâmetros (URL)**:
- `categoriaId`: ID numérico da categoria

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Categoria seguida com sucesso."
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### DELETE /api/v1/interesses/:categoriaId
**Descrição**: Deixar de seguir uma categoria

**Parâmetros (URL)**:
- `categoriaId`: ID numérico da categoria

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Deixou de seguir a categoria."
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

### 5. 📝 Posts

#### GET /api/v1/posts
**Descrição**: Listagem de posts (pública com auth opcional)

**Parâmetros (Query)**:
- `page`: Número da página (padrão: 1)
- `limit`: Posts por página (padrão: 10, máximo: 50)
- `categoria`: Filtrar por ID de categoria (opcional)
- `ordenarPor`: `score` ou `data` (opcional)

**Resposta de Sucesso (200)**:
```json
{
  "posts": [
    {
      "post_id": 1,
      "titulo": "Meu Primeiro Post",
      "conteudo": "Conteúdo do post...",
      "data_criacao": "2024-01-20T15:30:00.000Z",
      "autor_id": 1,
      "autor": {
        "nome": "João Silva"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

**Headers Necessários**: Opcional - `Authorization: Bearer <token>` (para funcionalidades adicionais)

---

#### POST /api/v1/posts
**Descrição**: Criação de post

**Parâmetros (Body)**:
```json
{
  "titulo": "Título do Post",
  "conteudo": "Conteúdo do post com no mínimo 10 caracteres...",
  "categoriasIds": [1, 2]
}
```

**Validações**:
- `titulo`: 5-150 caracteres
- `conteudo`: 10-10.000 caracteres
- `categoriasIds`: Array com 1-5 números positivos

**Resposta de Sucesso (201)**:
```json
{
  "post_id": 2,
  "titulo": "Título do Post",
  "conteudo": "Conteúdo do post...",
  "data_criacao": "2024-01-20T15:30:00.000Z",
  "autor_id": 1,
  "autor": {
    "nome": "João Silva"
  }
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### POST /api/v1/posts/:id/votar
**Descrição**: Votar em um post (UP ou DOWN). Upsert idempotente por perfil.

**Parâmetros (URL)**:
- `id`: ID numérico do post

**Parâmetros (Body)**:
```json
{ "tipo": "UP" }
```
ou
```json
{ "tipo": "DOWN" }
```

**Resposta de Sucesso (200)**:
```json
{ "status": "success", "message": "Voto registrado." }
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### POST /api/v1/posts/:id/comentarios
**Descrição**: Publicar comentário em um post.

**Parâmetros (URL)**:
- `id`: ID numérico do post

**Parâmetros (Body)**:
```json
{ "texto": "Comentário do usuário" }
```

**Resposta de Sucesso (201)**:
```json
{ "status": "success", "message": "Comentário publicado." }
```

**Headers Necessários**: `Authorization: Bearer <token)`

---

#### DELETE /api/v1/posts/:id
**Descrição**: Deleção de post (apenas o autor pode deletar)

**Parâmetros (URL)**:
- `id`: ID numérico do post

**Resposta de Sucesso (200)**:
```json
{
  "status": "success",
  "message": "Post deletado com sucesso."
}
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

### 6. 🏥 Health

#### GET /api/v1/saude
**Descrição**: Status geral do sistema

**Resposta de Sucesso (200)**:
```json
{
  "status": "UP",
  "timestamp": "2024-01-20T15:30:00.000Z",
  "uptime": "0h 5m 30s",
  "requestId": "abc123-def456-ghi789",
  "services": {
    "database": "UP",
    "email": "UP"
  }
}
```

**Headers Necessários**: Nenhum

---

### 7. 🚩 Denúncias

#### POST /api/v1/denuncias/:postId
**Descrição**: Registrar denúncia de conteúdo com snapshot no momento do envio.

**Parâmetros (URL)**:
- `postId`: ID numérico do post

**Parâmetros (Body)**:
```json
{ "denuncia_tipo": 1, "descricao": "opcional" }
```

**Resposta de Sucesso (201)**:
```json
{ "status": "success", "message": "Denúncia registrada." }
```

**Headers Necessários**: `Authorization: Bearer <token>`

---

#### GET /api/v1/saude/live
**Descrição**: Liveness probe (verificação ultra-leve)

**Resposta de Sucesso (200)**:
```json
{
  "status": "UP"
}
```

**Headers Necessários**: Nenhum

---

## 🚨 Tratamento de Erros

### Estrutura de Erro Padrão
Todos os erros seguem o mesmo formato:

```json
{
  "timestamp": "2024-01-20T15:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "FIELD_VALIDATION",
  "message": "Falha na validação dos campos fornecidos.",
  "path": "/api/v1/auth/logar",
  "requestId": "abc123-def456-ghi789",
  "details": [
    {
      "field": "email",
      "rule": "type",
      "expected": "string",
      "received": "number"
    }
  ]
}
```

### Códigos de Erro (ErrorCodes)

| ErrorCode | Status HTTP | Descrição |
|-----------|-------------|-----------|
| `INVALID_CREDENTIALS` | 401 | Email ou senha incorretos |
| `TOKEN_EXPIRED` | 401 | Token JWT expirado |
| `TOKEN_INVALID` | 401 | Token JWT inválido |
| `FORBIDDEN` | 403 | Acesso negado (sem permissão) |
| `UNAUTHENTICATED` | 401 | Token ausente ou inválido |
| `USER_NOT_FOUND` | 404 | Usuário não encontrado |
| `EMAIL_ALREADY_EXISTS` | 409 | Email já cadastrado |
| `FIELD_VALIDATION` | 400 | Validação de campos falhou |
| `BAD_REQUEST` | 400 | Requisição malformada |
| `INVALID_JSON_FORMAT` | 400 | JSON malformado (vírgulas extras, chaves faltando) |
| `EMPTY_PAYLOAD` | 400 | Body vazio quando deveria ter conteúdo |
| `INVALID_CONTENT_TYPE` | 415 | Content-Type incorreto |
| `INVALID_JSON_STRUCTURE` | 400 | Estrutura JSON muito complexa (profundidade > 7) |
| `RATE_LIMIT_EXCEEDED` | 429 | Limite de requisições excedido |
| `RESOURCE_NOT_FOUND` | 404 | Recurso não encontrado |
| `INTERNAL_ERROR` | 500 | Erro interno do servidor |
| `EMAIL_SERVICE_UNAVAILABLE` | 503 | Serviço de email indisponível |
| `DATABASE_CONNECTION_FAILED` | 503 | Falha de conexão com banco de dados |

---

## 🛡️ Rate Limiting (Limitação de Taxa)

A API implementa rate limiting para proteger contra abusos:

### Limites por Endpoint

| Endpoint | Limite | Janela | Descrição |
|----------|--------|---------|-----------|
| `/auth/registrar` | 5 req | 15 min | Previne criação massiva de contas |
| `/auth/logar` | 10 req | 5 min | Protege contra brute force |
| `/auth/solicitar-recuperacao` | 5 req | 15 min | Evita spam de recuperação |
| `/saude` | 30 req | 1 min | Monitoramento de saúde |
| Outros endpoints | Sem limite específico | - | Limitação global aplicada |

### Headers de Rate Limit
O frontend pode monitorar os limites através dos headers:
- `RateLimit-Limit`: Limite máximo de requisições
- `RateLimit-Remaining`: Requisições restantes na janela atual
- `RateLimit-Reset`: Timestamp quando o limite será resetado

### Resposta de Rate Limit Excedido (429)
```json
{
  "timestamp": "2024-01-20T15:30:00.000Z",
  "status": 429,
  "error": "Too Many Requests",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "message": "Muitas tentativas detectadas. Por segurança, aguarde 15 minutos antes de tentar novamente.",
  "path": "/api/v1/auth/logar",
  "requestId": "abc123-def456-ghi789"
}
```

---

## 🔍 Validações e Segurança

### 🛡️ Mass Assignment Protection
Todos os endpoints usam `.strict()` no Zod, impedindo o envio de campos não autorizados:

```json
// ❌ ERRO - Campo não autorizado
{
  "email": "joao@example.com",
  "senha": "Senha123",
  "is_admin": true  // ❌ Campo bloqueado!
}

// ✅ SUCESSO - Apenas campos permitidos
{
  "email": "joao@example.com",
  "senha": "Senha123"
}
```

### 🔒 JSON Malformado (DX)
A API detecta e fornece feedback claro sobre JSON malformado:

**Exemplo de Erro**:
```json
{
  "timestamp": "2024-01-20T15:30:00.000Z",
  "status": 400,
  "error": "Bad Request",
  "errorCode": "INVALID_JSON_FORMAT",
  "message": "O corpo da requisição (JSON) está malformado. Verifique vírgulas extras, chaves ou aspas faltando.",
  "path": "/api/v1/auth/logar",
  "requestId": "abc123-def456-ghi789"
}
```

### 📏 Payload Bomb Protection
A API rejeita payloads com estrutura excessivamente complexa (profundidade > 7 níveis) para prevenir ataques de negação de serviço.

---

## 💡 Boas Práticas para o Frontend

### 1. Tratamento de Erros
Sempre verifique o campo `errorCode` para tomar ações específicas:

```javascript
if (response.errorCode === 'TOKEN_EXPIRED') {
  // Redirecionar para login
  navigateToLogin();
} else if (response.errorCode === 'FIELD_VALIDATION') {
  // Mostrar erros específicos dos campos
  showFieldErrors(response.details);
}
```

### 2. Rate Limiting
Monitore os headers de rate limit e implemente backoff exponencial quando necessário.

### 3. Validação Client-Side
Sempre valide os dados no cliente antes de enviar, mas não confie apenas nisso - a API sempre revalidará.

### 4. Token Management
- Armazene tokens de forma segura (localStorage/sessionStorage)
- Implemente refresh token logic quando o `TOKEN_EXPIRED` for retornado
- Limpe tokens ao receber `UNAUTHENTICATED`

### 5. Formato de Dados
- Sempre use snake_case para variáveis
- Envie Content-Type: application/json
- Valide formato de emails antes do envio
- Use UTF-8 para caracteres especiais

---

## 📞 Suporte

Para dúvidas sobre a integração, utilize o `requestId` retornado em cada resposta para rastreamento de problemas.

**Base URL**: `http://localhost:3000/api/v1`

---

*Documentação gerada automaticamente baseada na análise do código-fonte da API.*
