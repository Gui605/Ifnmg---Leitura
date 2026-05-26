//teste0/PROJECT_MEMORY.md
Para garantir que essas regras façam parte da "Bíblia" do seu projeto e sejam consultadas automaticamente pelo Trae em toda nova funcionalidade, inseri a seção **"FRONTEND-BACKEND CONTRACT RULES (GOLDEN RULES)"** logo após a seção de regras imutáveis, mantendo a integridade total do restante do arquivo.

Aqui está o conteúdo completo e atualizado. Você pode copiar este bloco inteiro e substituir o conteúdo do seu `PROJECT_MEMORY.md`.

---

```markdown
# FORENSIC SCAN PROTOCOL & ARCHITECTURAL CONSOLIDATION (v4.0 — GOVERNED & IMMUTABLE)

- Mandatory Document: PROJECT_MEMORY.md
- Role: Staff+ Principal Software Architect & Security Engineer (OWASP ASVS, Forensic Code Auditing)
- Mission: Consolidate the absolute Source of Truth for the IFNMG Leitura system.
- Prohibited scopes: node_modules, dist, build, .next, .git, package-lock.json

---

# 🔒 ARCHITECTURAL GOVERNANCE LAYER (NEW — NON-DESTRUCTIVE ADDITION)

This section formalizes continuous evolution without losing context.

---

### [2026-04-23] — Busca Unificada Consumida no Frontend
Type: UI | UX | Search | Fullstack
Files affected:
- frontend/src/shared/services/post.service.ts
- frontend/src/features/explorar/ExplorarPage.tsx
- frontend/src/features/explorar/FiltrosTopo.tsx
- frontend/src/features/explorar/CardTrabalho.tsx

Contract affected?
- [x] Yes (Consumes /pesquisa endpoint with type filtering)

Impact verified?
- [x] UI/UX (Tabs for type filtering and improved cards)
- [x] Search (Integrated Posts and Obras results)
- [x] Integrity (Build successful)
- [x] Visual (Type badges and thumbnails)
- [x] Debugging (Added tracing for search request lifecycle)
- [x] API Contract (Standardized backend output and envelope integrity)

O que foi feito:
- **Navegação por Abas**: Adicionada funcionalidade de filtragem por tipo (Tudo, Artigos, Obras) no topo da página de Explorar.
- **Card Polimórfico**: O `CardTrabalho` agora adapta seu layout baseado no tipo de resultado, exibindo capas para obras e resumos truncados para posts.
- **Integração de Metadados**: Exibição dinâmica de curso e autor vindo do backend unificado.
- **Normalização de Busca**: Sincronização dos parâmetros de busca (`termo`, `tipo`, `status`) entre frontend e backend.
- **Diagnóstico de Fluxo**: Implementada instrumentação de log para identificar gargalos na saída de requisições de busca.
- **Paridade de Schema**: Corrigida a discrepância de nomes de campos (id vs post_id) e estruturas de autor entre o serviço de pesquisa do backend e o schema Zod do frontend.
- **Estabilização de Resposta**: Adicionado campo `message` obrigatório e corrigida a leitura de query params em rotas de listagem/busca.

---

### [2026-04-23] — Refatoração de Status e Herança de Metadados
Type: Refactor | Bugfix | Fullstack
Files affected:
- backend/src/shared/types/post.types.ts
- backend/src/features/posts/posts.service.ts
- frontend/src/features/posts/EscreverPost.tsx

Contract affected?
- [x] Yes (PostCreateSchema now uses .refine() for conditional mandatory fields)

Impact verified?
- [x] Backend (Fixed chapter creation failure)
- [x] Frontend (Fixed build failure in EscreverPost.tsx)
- [x] Logic (Inheritance of idioma/status/categories from Obra)
- [x] UX (Simplified post creation without redundant status field)
- [x] Integrity (Build successful for both layers)

O que foi feito:
- **Flexibilização de Schema**: O `PostCreateSchema` agora permite que `idioma` e `status` sejam omitidos se `obra_id` estiver presente, validando a obrigatoriedade apenas para posts independentes.
- **Herança Automática**: Refatorado o `posts.service.ts` para que capítulos de obras herdem automaticamente o idioma e o status da obra pai no momento da criação.
- **Limpeza de UI**: Removido o seletor de status da página de escrita de posts, centralizando a gestão de status no modelo `Obras`.

---

### [2026-04-23] — Motor de Busca Unificada e Persistência de Metadados
Type: Feature | Search | Backend | Fullstack
Files affected:
- backend/src/shared/types/post.types.ts
- backend/src/shared/types/obra.types.ts
- backend/src/features/obras/obras.service.ts
- backend/src/features/posts/posts.service.ts
- backend/src/features/posts/posts.controller.ts
- backend/src/features/posts/posts.routes.ts

Contract affected?
- [x] Yes (Added idioma and status to creation endpoints, new /pesquisa route)

Impact verified?
- [x] Backend (npm run build successful)
- [x] Persistence (Idioma and Status now stored for both Posts and Obras)
- [x] Unified Search (Parallel queries for Obras and Posts)
- [x] Course Display (Added autor.curso to search results)

O que foi feito:
- **Busca Unificada**: Criado o método `pesquisarUnificado` no `posts.service.ts` que realiza consultas paralelas no Prisma e mapeia os resultados para uma interface comum.
- **Persistência de Metadados**: Sincronizados controllers e services para garantir que `idioma` e `status` sejam gravados no banco de dados.
- **Endpoint Enterprise**: Criada a rota `GET /api/v1/posts/pesquisa` com retorno padronizado `{ status, data, meta: { total } }`.
- **Higiene de Build**: Resolvidos erros de tipagem no `Promise.resolve` para garantir compilação limpa do projeto.

---

### [2026-04-23] — Paridade de Esquema e Formulários (Obras e Posts)
Type: Schema | Database | Frontend | Fullstack
Files affected:
- backend/prisma/schema.prisma
- backend/prisma/seed.ts
- frontend/src/shared/types/obra.types.ts
- frontend/src/shared/types/post.types.ts
- frontend/src/features/obras/CriarObra.tsx
- frontend/src/features/posts/EscreverPost.tsx

Contract affected?
- [x] Yes (Added idioma and status to Obras/Posts creation schemas)

Impact verified?
- [x] Database (Migration add_idioma_e_status_nas_obras executed)
- [x] UI/UX (Selectors for language and status in creation forms)
- [x] Consistency (Full parity between Posts and Obras for unified search)
- [x] Validation (Mandatory fields with toast notifications)

O que foi feito:
- **Paridade de Dados**: Implementada paridade estrutural entre `Posts` e `Obras` em toda a stack (Banco, Tipos e UI).
- **Formulários Hardened**: Adicionados campos de `Idioma` e `Status` nos fluxos de criação, utilizando ícones `Languages` e `Activity` da Lucide.
- **Validação**: Integrada validação Zod e lógica de UI para impedir envios sem o campo de idioma selecionado.

---

### [2026-03-30] — Identidade Visual Dinâmica no Header
Type: UI | UX | Frontend
Files affected:
- frontend/src/shared/components/Header.tsx

Contract affected?
- [x] No

Impact verified?
- [x] UI/UX (Dynamic visual identity based on route)
- [x] Consistency (Pure white logo on auth pages)
- [x] Build success (Frontend 0 errors confirmed)

O que foi feito:
- **Identidade Visual Dinâmica**: Refatorado o `Header.tsx` para usar o hook `useLocation`. Implementada lógica condicional que altera a cor da Logo (`BookOpen`) e do nome do sistema (`PAPIRUS`) para branco puro quando o usuário acessa rotas de autenticação (`/entrada`).
- **Suavidade**: Adicionadas classes de transição (`transition-colors`, `duration-300`) para garantir uma experiência de navegação fluida entre páginas com diferentes esquemas de cores.

---

### [2026-03-30] — Padronização de Navegação e Header Global
Type: Refactor | UI/UX | Frontend
Files affected:
- frontend/src/features/obras/MinhasObrasPage.tsx
- frontend/src/features/obras/CriarObra.tsx
- frontend/src/features/obras/ObraDetalhesPage.tsx
- frontend/src/features/obras/EscritaCapitulo.tsx
- frontend/src/features/auth/Login.tsx
- frontend/src/features/auth/Redefinir.tsx

Contract affected?
- [x] No

Impact verified?
- [x] UI/UX (Global consistency across all pages)
- [x] Navigation (Centralized back logic and profile access)
- [x] Build success (Frontend & Backend 0 errors confirmed)

O que foi feito:
- **Header Global**: Todas as páginas agora utilizam o componente `Header.tsx`. Cabeçalhos locais e botões de volta manuais foram removidos.
- **Integração de Ações**: Botões contextuais como "Criar Nova Obra" foram movidos para a prop `actions` do Header.
- **Contexto Literário**: No fluxo de escrita, o Header exibe o título da obra vinculada como metadado.
- **Autenticação**: Páginas de Login e Redefinir agora compartilham a identidade visual da Logo (Papirus) através do Header, com navegação de volta oculta (`hideBack`).

---

### [2026-03-30] — Fix Navegação e Otimização de Leitura
Type: Bugfix | Frontend | Backend
Files affected:
- frontend/src/features/posts/PostDetalhesPage.tsx
- backend/src/features/posts/posts.service.ts

Contract affected?
- [x] No

Impact verified?
- [x] UX (Smooth chapter navigation)
- [x] Performance (Fetch guard per ID)
- [x] Traceability (Navigation debug logs)
- [x] Build success (Frontend & Backend 0 errors)

O que foi feito:
- **Fix Navegação**: Corrigido bug no `PostDetalhesPage.tsx` onde a mudança de ID na URL não disparava um novo fetch de dados. A lógica de `useRef` foi aprimorada para comparar o ID atual com o último buscado, garantindo atualização de conteúdo ao navegar entre capítulos.
- **Traceability**: Adicionados logs `[DEBUG]` no backend para monitorar a busca de `anterior_id` e `proximo_id`, facilitando a identificação de posts sem ordenação correta.

---

### [2026-03-30] — Correção de Lógica e Polimento de Leitura
Type: Bugfix | UI/UX | Backend | Fullstack
Files affected:
- backend/src/features/posts/comentarios.service.ts
- backend/src/shared/types/post.types.ts
- backend/src/features/posts/posts.service.ts
- frontend/src/features/posts/PostDetalhesPage.tsx
- frontend/src/features/posts/FeedbackBox.tsx

Contract affected?
- [x] Yes (PostCommentSchema now includes is_spoiler and nullable parent_id)

Impact verified?
- [x] UI/UX (Break-words support for long texts)
- [x] Performance (Deduplicated view counting)
- [x] Engagement (FeedbackBox interaction lock)
- [x] Build success (Frontend & Backend 0 errors confirmed)

O que foi feito:
- **Deduplicação de Views**: Corrigida falha de contagem dupla de visualizações no `PostDetalhesPage.tsx` utilizando `useRef` para blindar o `useEffect` contra renderizações duplas do `React.StrictMode`.
- **Trava de Engajamento**: No `FeedbackBox.tsx`, adicionado estado de carregamento (`isUpdating`) que desabilita interações durante o processamento da API, prevenindo spam e cliques simultâneos.
- **Resiliência Literária**: Adicionadas classes `break-words` e `overflow-wrap-anywhere` no corpo do texto para garantir que palavras longas ou links não quebrem o layout da "Folha de Papel".
- **Fix Comentários**: Sincronizada a lógica do `comentarios.service.ts` com o novo campo `is_spoiler` do Prisma e adicionados logs de rastreabilidade no backend.
- **Robustez Zod**: Atualizado `PostCommentSchema` para refletir as mudanças do banco de dados.

---

### [2026-03-30] — Efeito "Folha de Papel" e Padronização de Navegação
Type: UI | UX | Refactor | Frontend
Files affected:
- frontend/src/features/posts/PostDetalhesPage.tsx
- frontend/src/features/posts/FeedbackBox.tsx
- frontend/src/shared/components/Header.tsx
- frontend/src/features/feed/Feed.tsx

Contract affected?
- [x] No

Impact verified?
- [x] UI/UX (Paper effect for focused reading)
- [x] Navigation (Dynamic Header with hideBack prop)
- [x] Consistency (Standardized Header positioning)
- [x] Build success (Frontend 0 errors)

O que foi feito:
- **PostDetalhesPage (Folha de Papel)**: Conteúdo do post envolto em container `max-w-4xl` com `shadow-2xl` e fundo levemente contrastante, simulando uma folha física. Título e navegação agora rolam junto com o texto.
- **FeedbackBox (Minimalismo)**: Redimensionado para uma barra fina e elegante integrada ao rodapé da folha, com ícones de `18px` e bordas arredondadas (pills).
- **Header (Arquitetura)**: Refatorado para manter o ícone do Campus fixo à esquerda e o botão Voltar à sua direita. Adicionada prop `hideBack` (usada no Feed) para ocultar o retorno em páginas raiz.
- **Legibilidade**: Implementada `font-serif` com `leading-[1.8]` e alinhamento justificado no corpo do texto literário.

---

### [2026-03-30] — Refinamento Visual e Conectividade de Leitura
Type: UI | UX | Refactor | Fullstack
Files affected:
- frontend/src/features/posts/FeedbackBox.tsx
- frontend/src/features/posts/PostDetalhesPage.tsx
- frontend/src/features/feed/PostCard.tsx

Contract affected?
- [x] No

Impact verified?
- [x] UI/UX (Proportional reading elements)
- [x] Connectivity (Post title and chapter links in feed)
- [x] Typography (Serif for reading body)
- [x] Build success (Frontend 0 errors)

O que foi feito:
- **FeedbackBox (Redimensionamento)**: Quadro de reações reduzido para `max-w-xl` com ícones menores (24px) e tipografia em caixa alta com `tracking-widest` para um visual institucional.
- **Navegação de Capítulos**: Botões Anterior/Próximo redimensionados e reestilizados para não competirem com o título, alinhados à margem `max-w-3xl` do texto.
- **Conectividade no Feed**: Títulos e breadcrumbs de capítulos no `PostCard` agora são links funcionais para a página de leitura com efeitos de hover.
- **Legibilidade**: Reforçada a distinção tipográfica entre interface (Sans) e conteúdo literário (Serif) na página de leitura.

---

### [2026-03-30] — Otimização de Performance e Resiliência (P2028 Fix)
Type: Bugfix | Architecture | Backend
Files affected:
- backend/src/features/perfil/perfil.service.ts
- backend/src/features/obras/obras.service.ts
- backend/src/features/posts/posts.service.ts
- backend/src/shared/prisma/prisma.client.ts
- backend/src/shared/middlewares/errorHandler.middleware.ts

Contract affected?
- [x] No (Internal performance and resilience hardening)

Impact verified?
- [x] Backend (Fixed P2028 Interactive Transaction Timeout)
- [x] Logic (XP decoupling from obra creation)
- [x] Debugging (Stack trace enabled for DEV)
- [x] Build success (npm run build)

O que foi feito:
- **Crash Protection**: Adicionado `try/catch` isolado em volta do motor de gamificação. Falhas em XP/Títulos não bloqueiam a ação principal do usuário (ex: criar obra/capítulo).
- **Desacoplamento de XP**: Transferida a carga de gamificação da criação de obra para a criação de capítulos, reduzindo a latência da transação de obra para <50ms.
- **Processamento Assíncrono**: O disparo de XP em posts agora ocorre fora da transação do banco, prevenindo bloqueios por contenção.
- **Hardening do Prisma**: Aumentado o timeout das transações interativas para 10s no `prisma.client.ts` para lidar com picos de tráfego.
- **Debug DEV**: `errorHandler.middleware.ts` agora exibe `error.stack` no terminal e no JSON de resposta (se `NODE_ENV !== production`).

---

### [2026-03-30] — Experiência de Leitura e Engajamento Social (Webtoon Style)
Type: Feature | UI/UX | Security | Fullstack
Files affected:
- backend/prisma/schema.prisma
- backend/src/features/posts/posts.service.ts
- backend/src/features/posts/posts.controller.ts
- backend/src/features/posts/posts.routes.ts
- frontend/src/features/obras/ObraDetalhesPage.tsx (NEW)
- frontend/src/features/posts/PostDetalhesPage.tsx (NEW)
- frontend/src/features/posts/FeedbackBox.tsx (NEW)
- frontend/src/features/posts/ComentarioInput.tsx (NEW)
- frontend/src/shared/services/post.service.ts
- frontend/src/shared/types/post.types.ts
- frontend/src/App.tsx

Contract affected?
- [x] Yes (New enriched post details contract with reactions and navigation)

Impact verified?
- [x] UI/UX (Modern reading interface with playlist chapters)
- [x] Social (5 reaction types with toggle behavior)
- [x] Security (Spoiler tags in comments with click-to-reveal)
- [x] Build success (Frontend & Backend 0 errors)

O que foi feito:
- **ObraDetalhesPage**: Criada página de visão geral estilo "Webtoon" com grid 12-cols, hero blur, e sidebar de estatísticas (Visualizações, Favoritos, Capítulos).
- **PostDetalhesPage**: Implementada interface de leitura focada em tipografia (`prose-invert`) com navegação inteligente (anterior/próximo) para capítulos.
- **Quadro de Reações**: Criado `FeedbackBox.tsx` com 5 tipos de reações (LIKE, LOVE, FIRE, SAD, BORED) e contagem em tempo real.
- **Comentários Hardened**: Adicionado suporte a `is_spoiler` no Prisma e UI. Comentários de spoiler são borrados e exigem clique para visualização.
- **Navegação de Capítulos**: O backend agora calcula os IDs dos capítulos vizinhos baseados na `ordem` e os envia no contrato de detalhes do post.
- **Contador de Views**: Incremento automático de `visualizacoes` no banco ao carregar o post/capítulo.

---

### [2026-03-30] — Painel "Minhas Obras" e Fluxo de Escrita de Capítulos
Type: Feature | Architecture | Fullstack
Files affected:
- backend/prisma/schema.prisma
- backend/src/features/obras/obras.service.ts
- backend/src/features/posts/posts.service.ts
- backend/src/shared/types/obra.types.ts
- backend/src/shared/types/post.types.ts
- frontend/src/features/obras/MinhasObrasPage.tsx (NEW)
- frontend/src/features/obras/CriarObra.tsx (NEW)
- frontend/src/features/obras/EscritaCapitulo.tsx (NEW)
- frontend/src/shared/services/obra.service.ts (NEW)
- frontend/src/shared/types/obra.types.ts (NEW)
- frontend/src/shared/types/post.types.ts
- frontend/src/features/feed/PostCard.tsx
- frontend/src/App.tsx

Contract affected?
- [x] Yes (New ObrasCategorias pivot and category inheritance in chapters)

Impact verified?
- [x] Architecture (Fixed categories for works, inherited by chapters)
- [x] UX (Library-style panel for works management)
- [x] Integrity (Automatic chapter ordering and metadata inheritance)
- [x] Build success (Frontend & Backend 0 errors)

O que foi feito:
- **Evolução do Schema**: Criado o modelo `ObrasCategorias` e adicionado o campo `imagem_capa` ao modelo `Obras`.
- **Painel de Gestão**: Implementada a página `MinhasObrasPage.tsx` com layout de biblioteca para visualização e gestão de projetos literários.
- **Herança Automática**: Refatorada a criação de posts no backend para que capítulos herdarem automaticamente as categorias da obra pai.
- **Fluxo de Escrita Especializado**: Criado o componente `EscritaCapitulo.tsx` que foca apenas no conteúdo, omitindo seletores redundantes e exibindo o contexto da obra pai.
- **Breadcrumbs no Feed**: O `PostCard.tsx` agora exibe o caminho hierárquico `📚 [Obra] > Capítulo [N]` para posts vinculados.
- **Sincronia Técnica**: Atualizados serviços e tipos em ambas as camadas para suportar o novo ecossistema de obras.

---

### [2026-03-30] — Direito ao Esquecimento (LGPD) e Anonimização Atômica
Type: Security | Privacy | Fullstack
Files affected:
- backend/src/features/perfil/perfil.service.ts
- backend/src/features/perfil/seguranca.service.ts
- backend/src/features/perfil/perfil.controller.ts
- backend/src/features/perfil/perfil.routes.ts
- frontend/src/shared/services/perfil.service.ts
- frontend/src/features/configuracoes/SubSeccionPrivacidade.tsx

Contract affected?
- [x] Yes (New pre-flight check endpoint: /seguranca/check-exclusao)

Impact verified?
- [x] Security (Block admin deletion, force password re-auth)
- [x] Privacy (Email anonymization, clear public profile fields)
- [x] Integrity (Atomic transaction for communities/profiles/users)
- [x] Build success (Frontend & Backend 0 errors)

O que foi feito:
- **Pre-flight Check**: Implementado endpoint que verifica se o usuário é dono de comunidades ativas ou administrador antes de permitir a exclusão.
- **Anonimização LGPD**: Refatorada a exclusão de conta para manter dados de auditoria interna (nome completo, data nascimento) enquanto remove toda a identidade pública (bio, curso, avatar) e libera o e-mail real.
- **Limpeza de Comunidades**: Comunidades onde o usuário era o único membro são removidas automaticamente em cascata.
- **Modal Dinâmico**: Frontend atualizado para exibir avisos contextuais baseados nas pendências do usuário, bloqueando a ação caso necessário.
- **Global Logout**: Forçado logout em todos os dispositivos imediatamente após a anonimização.

---

### [2026-03-30] — Comentários com Trava de Profundidade e Null-Safety de Autoria
Type: Feature | Security | Refactor | Fullstack
Files affected:
- backend/src/features/posts/comentarios.service.ts (NEW)
- backend/src/features/posts/posts.controller.ts
- backend/src/features/posts/posts.routes.ts
- backend/src/features/posts/posts.service.ts
- backend/src/features/perfil/perfil.routes.ts
- backend/src/shared/types/post.types.ts
- frontend/src/shared/types/post.types.ts
- frontend/src/features/feed/PostCard.tsx
- frontend/src/features/explorar/CardTrabalho.tsx

Contract affected?
- [x] Yes (New AutorDisplay structure for Null-Safety)

Impact verified?
- [x] UX (Anti-Inception: Max 2 levels for comments)
- [x] Integrity (Null-Safety for deleted users using snapshots)
- [x] Social (Public profile with is_following status)
- [x] Build success (Frontend & Backend 0 errors)

O que foi feito:
- **Arquitetura de Comentários**: Criado `comentarios.service.ts` com suporte a árvore de comentários (Post -> Comentário -> Resposta) e trava de profundidade rígida de 2 níveis.
- **Null-Safety de Autoria**: Implementada a estrutura `AutorDisplay` que utiliza snapshots de banco (`autor_nome_user`, `nome_campus`) quando o autor original é deletado, garantindo que o conteúdo permaneça legível.
- **Perfil Público Híbrido**: O endpoint `GET /perfil/:id` agora utiliza `middlewareAutenticacaoOpcional` para retornar o status `is_following` caso o visitante esteja logado.
- **Sincronia Fullstack**: Tipagens sincronizadas em ambas as camadas e UI do `PostCard` e `CardTrabalho` atualizadas para suportar o novo modelo de autoria.
- **Segurança Atômica**: Deleção de comentários agora utiliza `$transaction` para manter a integridade dos contadores de posts.

---

### [2026-03-30] — Diferenciação de Logout Local vs Global (Segurança de Sessão)
Type: Security | UI/UX | Frontend
Files affected:
- frontend/src/shared/services/auth.service.ts
- frontend/src/shared/utils/authContext.tsx
- frontend/src/shared/components/Header.tsx
- frontend/src/features/configuracoes/SubSeccionSeguranca.tsx

Contract affected?
- [x] No (Internal logic refactor)

Impact verified?
- [x] Security (Ability to invalidate all sessions via token_version increment)
- [x] UX (Local logout for shared devices vs Global logout for account security)
- [x] Build success (Both Frontend and Backend build with 0 errors)

O que foi feito:
- **Refatoração do AuthService**: Introduzida a função `logoutLocal()` (limpa storage) e mantida `fazerLogout()` (chamada ao backend).
- **Logout Local no Header**: O botão de "Sair" no Header agora realiza apenas o logout local, permitindo que o usuário saia do navegador atual sem afetar outras sessões (ex: celular).
- **Logout Global em Segurança**: O botão "Sair de todos os dispositivos" em `SubSeccionSeguranca.tsx` agora chama o backend para invalidar globalmente o `token_version`.
- **AuthContext Evoluído**: A função `logout` no contexto agora aceita um parâmetro `global: boolean`, gerenciando mensagens de feedback e redirecionamentos apropriados.
- **Observabilidade**: Adicionado feedback visual via toast diferenciando os tipos de logout.

---

### [2026-03-30] — Sincronização de Endpoints e Higiene Arquitetural (Fase 1 Finalizada)
Type: Architecture | Refactor | Fullstack
Files affected:
- frontend/src/shared/services/auth.service.ts
- frontend/src/shared/services/perfil.service.ts
- backend/src/features/perfil/perfil.routes.ts
- backend/src/shared/middlewares/validate.middleware.ts

Contract affected?
- [x] Yes (Endpoint Logout sync: /auth/logout-all)

Impact verified?
- [x] Backend (DELETE /seguranca/conta path semantic integrity)
- [x] Frontend (Logout and Delete Account calls synchronized)
- [x] Security (Zod strict validation enforced in middleware)
- [x] Build success (Both Frontend and Backend build with 0 errors)

O que foi feito:
- **Sincronização de Logout**: Atualizada a função `fazerLogout` no frontend para apontar para `/auth/logout-all`, garantindo que todas as sessões sejam invalidadas no servidor.
- **Higiene de Rotas de Perfil**: Validado o path `DELETE /seguranca/conta` no backend e sincronizada a chamada `deleteMinhaConta` no frontend.
- **Robustez de Contratos**: Refatoradas as chamadas de API no frontend para usar `z.any()` em endpoints que retornam void ou payloads dinâmicos, evitando quebras de contrato silenciosas.
- **Validação de Mass Assignment**: Confirmada a execução de `parseAsync` no `validate.middleware.ts`, garantindo que schemas com `.strict()` bloqueiem campos proibidos (ex: `is_admin`) antes de atingirem os controllers.
- **Conclusão da Fase 1**: Toda a base de autenticação, perfil e gamificação está agora sincronizada, tipada e blindada.

---

### [2026-03-30] — Hardening de Identidade e Blindagem de Registro (Backend)
Type: Security | Architecture | Refactor | Backend
Files affected:
- backend/src/shared/types/express.d.ts
- backend/src/shared/types/auth.types.ts
- backend/src/features/auth/auth.service.ts
- backend/src/shared/middlewares/authMiddleware.ts
- backend/src/shared/middlewares/optionalAuthMiddleware.ts
- backend/src/shared/middlewares/adminMiddleware.ts
- backend/src/features/perfil/perfil.controller.ts
- backend/src/features/auth/auth.controller.ts
- backend/src/features/posts/posts.controller.ts
- backend/src/features/obras/obras.controller.ts
- backend/src/features/denuncias/denuncias.controller.ts
- backend/src/features/categorias/categorias.controller.ts

Contract affected?
- [x] No (Internal hardening only)

Impact verified?
- [x] Security (Strict Mass Assignment protection on Registration)
- [x] Architecture (Unified req.user identity object)
- [x] Type Safety (Mandatory fields in Express Request)
- [x] Build success (npm run build)

O que foi feito:
- **Refatoração Global de Tipagem**: O `express.d.ts` foi atualizado para tornar o objeto `user` (tipo `AuthUser`) obrigatório, removendo campos redundantes (`usuario_id`, `perfil_id`, `is_admin`) fora do objeto.
- **Blindagem de Registro (Hardened)**: O `auth.service.ts` agora força explicitamente `is_admin: false` na criação de usuários, servindo como uma segunda camada de defesa contra injeção de privilégios.
- **Middleware de Identidade**: `authMiddleware.ts` e `optionalAuthMiddleware.ts` foram atualizados para injetar o objeto `user` completo, garantindo que as rotas autenticadas tenham acesso seguro e tipado aos metadados.
- **Padronização de Controllers**: Todos os controllers foram migrados para utilizar o novo padrão `req.user.perfil_id` (e similares), eliminando verificações de nulidade redundantes em rotas protegidas.
- **Integridade de Build**: Validada a remoção de todos os "atalhos" legados de tipagem, resultando em um build limpo e robusto.

---

### [2026-03-29] — Gamificação V2: UI & Obras Support (Frontend)
Type: Feature | UI | UX | Frontend
Files affected:
- frontend/src/shared/components/ProgressBarXP.tsx
- frontend/src/features/feed/PostCard.tsx
- frontend/src/features/feed/Feed.tsx
- frontend/src/features/perfil/PerfilSidebar.tsx
- frontend/src/features/perfil/PerfilConquistas.tsx
- frontend/src/shared/types/perfil.types.ts
- frontend/src/shared/types/post.types.ts

Contract affected?
- [x] No (UI implementation of existing backend logic)

Impact verified?
- [x] UI/UX (New ProgressBarXP with geometric logic)
- [x] Consistency (Unified level/XP calculation across Feed and Profile)
- [x] Feature (Obras/Chapters badges in PostCard)
- [x] Build success (npm run build)

O que foi feito:
- **Centralização de Lógica de Nível**: Atualizado o componente `ProgressBarXP.tsx` para utilizar a fórmula geométrica do backend `Nivel * 100 * (1.5 ^ Nivel)`.
- **Patentes Dinâmicas**: Implementada função `getPatentePorNivel` para fornecer títulos automáticos (Calouro, Explorador, etc.) quando o usuário não possui um título ativo.
- **Integração no Feed e Perfil**: Sincronizados os painéis de gamificação na Sidebar do Feed e do Perfil para refletir o XP total e o progresso real.
- **Suporte a Obras no Feed**: O `PostCard.tsx` agora renderiza badges de "Capítulo" e selos de "Obra Finalizada" baseados nos novos campos `obra_id`, `ordem` e `status`.
- **Sincronia de Tipos**: Atualizados os arquivos de tipagem no frontend para incluir os novos campos de XP por categoria e metadados de obras.

---

### [2026-03-29] — Gamificação V2: XP Orgânico e Especialização (IFNMG)
Type: Refactor | Feature | Backend
Files affected:
- backend/src/shared/utils/gamificacao.config.ts
- backend/src/features/perfil/perfil.service.ts
- backend/src/features/posts/posts.service.ts
- backend/prisma/schema.prisma

Contract affected?
- [x] Yes (Added XP category fields to Perfis)

Impact verified?
- [x] Backend (Daily limits, decay logic, category-based titles)
- [x] Schema (Validity restored with Titulos/Conquistas models)
- [x] Logic (No XP for commenters/reactors)

O que foi feito:
- **Refatoração do Motor de Gamificação**: Implementado o sistema de XP orgânico em `gamificacao.config.ts` com categorias (Escrita, Curadoria, Social) e curva geométrica de nível (`Nivel * 100 * (1.5 ^ Nivel)`).
- **Lógica de Decaimento Temporal**: Interações em posts antigos (0-48h: 100%, 48-168h: 50%, >168h: 10%) agora garantem menos XP, combatendo spam e recompensando o engajamento fresco.
- **Limites Diários e Anti-Spam**: Implementado hard cap de 3000 XP/dia em `perfil.service.ts` para evitar saltos artificiais de nível por posts virais.
- **Especialização de Títulos**: XP agora é rastreado por categoria (`xp_escrita`, `xp_curadoria`, `xp_social`) no banco de dados, permitindo títulos que exigem expertise específica (ex: "Escritor Experiente").
- **Regra de Espontaneidade**: Removido o ganho de XP para quem comenta ou reage (Ação espontânea), focando a recompensa exclusivamente no autor que RECEBE o engajamento (Karma).
- **Correção de Schema**: Restaurada a integridade do `schema.prisma` adicionando os modelos ausentes `Titulos`, `PerfisTitulos`, `Conquistas` e `PerfisConquistas`.
- **Validação de Conteúdo**: XP por postagens agora exige comprimento mínimo (Post Avulso: 100 caracteres, Capítulo de Obra: 300 caracteres).

---

### [2026-03-29] — Centralização de Constantes de Unidades (Campus)
Type: Refactor | Architectural | Fullstack
Files affected:
- backend/src/shared/constants/unidades.ts
- backend/src/shared/types/auth.types.ts
- frontend/src/shared/utils/unidades.ts
- frontend/src/features/auth/Login.tsx

Contract affected?
- [x] Yes (Backend now strictly validates `nome_campus` against the official list)

Impact verified?
- [x] Backend (Zod Enum validation for `RegistrarSchema`)
- [x] Frontend (Refactored Login.tsx to use shared constants)
- [x] Maintainability (Single source of truth for campus list)
- [x] Build success (Both projects build without errors)

O que foi feito:
- **Centralização no Backend**: Criado `unidades.ts` com `LISTA_CAMPUS` em `backend/src/shared/constants/`. O `RegistrarSchema` foi atualizado para usar `z.enum(LISTA_CAMPUS)`, garantindo validação rigorosa no servidor.
- **Centralização no Frontend**: Criado `unidades.ts` em `frontend/src/shared/utils/`.
- **Refatoração do Login**: Removida a lista local de campi do `Login.tsx` em favor da constante compartilhada.
- **Consistência de Tipos**: Utilizado `as const` para garantir tipagem literal em ambos os projetos.

---

### [2026-03-29] — Autocomplete de Campus e Sincronia de Cadastro
Type: UI | UX | Fullstack
Files affected:
- frontend/src/features/auth/Login.tsx
- frontend/src/shared/types/auth.types.ts
- frontend/src/shared/services/auth.service.ts

Contract affected?
- [x] No (Frontend updated to match existing backend contract)

Impact verified?
- [x] UI/UX (Autocomplete for Campus with official IFNMG list)
- [x] Data Integrity (Date conversion to ISO YYYY-MM-DD)
- [x] Validation (Strict campus selection check)
- [x] Build success (npm run build)

O que foi feito:
- **Autocomplete de Campus**: Implementado seletor inteligente no `Login.tsx` com a lista oficial de campi do IFNMG. Inclui filtragem dinâmica, estados de busca e fechamento automático.
- **Sincronia de Contratos**: Validado `RegisterPayloadSchema` e mapeamento de campos no `registrarUsuario` para garantir compatibilidade total com o backend.
- **Normalização de Dados**: Adicionada conversão automática da data de nascimento da máscara `DD/MM/YYYY` para o padrão ISO `YYYY-MM-DD` antes do envio.
- **Validação Rigorosa**: O botão de cadastro agora exige que o campus selecionado conste exatamente na lista oficial.

---

### [2026-03-29] — Ajustes Finos: Sequenciamento e Gatilhos de Mérito
Type: Bugfix | Optimization | Backend
Files affected:
- backend/src/features/posts/posts.service.ts
- backend/src/features/perfil/perfil.service.ts

Contract affected?
- [x] No

Impact verified?
- [x] Logic (Fixed chapter duplication using MAX(ordem))
- [x] Performance (Fixed title merit trigger with floor range check)
- [x] Maintainability (Isolated authorship validation with TODO for Co-authorship)
- [x] Build success (npm run build)

O que foi feito:
- **Correção de Sequenciamento**: Substituído `.count()` por busca do maior valor de `ordem` atual no `posts.service.ts`, evitando duplicidade de capítulos se itens intermediários forem deletados.
- **Gatilho de Títulos Robusto**: Implementada lógica de "transição de faixa" no `perfil.service.ts` (`Math.floor(xpAntigo / 100) < Math.floor(xpNovo / 100)`). Isso garante que marcos de títulos não sejam pulados se o ganho de XP ultrapassar a dezena exata.
- **Flexibilização de Autoria**: Adicionado comentário TODO sobre futura co-autoria em `posts.service.ts` e isolada a lógica de validação `isAutor` para facilitar refatorações.

---

### [2026-03-29] — Módulo de Obras e Capítulos Sequenciais
Type: Feature | Backend
Files affected:
- backend/src/features/obras/obras.service.ts
- backend/src/features/obras/obras.controller.ts
- backend/src/features/obras/obras.routes.ts
- backend/src/features/posts/posts.service.ts
- backend/src/shared/types/obra.types.ts
- backend/prisma/schema.prisma

Contract affected?
- [x] Yes (Added /api/v1/obras and sequential ordering for posts)

Impact verified?
- [x] Backend (CRUD Obras, XP for creation, auto-incrementing chapter order)
- [x] Security (Author validation for adding chapters)
- [x] Performance (Conditional title merit checks)
- [x] Schema (Fixed validation errors in ComunidadeBans and Denuncias)

O que foi feito:
- **CRUD de Obras**: Implementado módulo completo para gestão de projetos literários/acadêmicos.
- **Lógica de Capítulos**: Refatorado `posts.service.ts` para suportar capítulos sequenciais (`ordem`) vinculados a obras, com validação de autoria.
- **Gamificação Integrada**: Adicionado ganho de 50 XP para criação de obra (`OBRA_CRIAR`) e validação de 40 XP para capítulos (`OBRA_CAPITULO` >= 300 chars).
- **Otimização de Performance**: `atribuirTitulosPorMerito` agora só é disparado em ações de escrita ou em marcos de 100 XP social.
- **Saneamento do Schema**: Corrigidos erros de validação do Prisma (relações bidirecionais ausentes e uso indevido de `SetNull` em campos obrigatórios).

---

## CHANGE HISTORY (IMMUTABLE LOG)

### [2026-03-25] — Correção de Z-Index e Integração do ScrollToTop
Type: UI | UX | Bugfix | Frontend
Files affected:
- frontend/src/shared/components/ScrollToTop.tsx
- frontend/src/App.tsx

Contract affected?
- [x] No

Impact verified?
- [x] UI/UX (Floating button / Z-Index fix)
- [x] Global Visibility (App.tsx integration)
- [x] Build success (npm run build)

O que foi feito:
- **Refinamento de Z-Index**: Elevado o `z-index` do botão `ScrollToTop` para `99` para garantir que ele flutue sobre o conteúdo das páginas, mantendo-se abaixo de modais e menus dropdown.
- **Validação de Integração**: Confirmado que o componente está renderizado na raiz do `App.tsx`, fora de containers com `overflow-hidden`, garantindo visibilidade global.
- **Verificação de Listener**: Validado que o listener de scroll está atracado ao `window`, capturando corretamente a rolagem do `document.documentElement` em todas as rotas (Feed, Perfil, Explorar).
- **Consistência de Animação**: Mantido o uso de `AnimatePresence` dentro do componente para transições suaves de entrada e saída.

### [2026-03-25] — Botão Flutuante "Voltar ao Topo"
Type: UI | UX | Frontend
Files affected:
- frontend/src/shared/components/ScrollToTop.tsx
- frontend/src/App.tsx

Contract affected?
- [x] No

Impact verified?
- [x] UI/UX (Floating button / Smooth scroll)
- [x] Responsiveness (Desktop/Mobile positions)
- [x] Cleanliness (Event listener cleanup)

O que foi feito:
- **Componente ScrollToTop**: Implementado botão flutuante posicionado no canto superior direito para facilitar a navegação em longas rolagens.
- **Lógica de Visibilidade**: O botão aparece apenas após 400px de rolagem vertical, utilizando `window.scrollY`.
- **Animações**: Integrado `framer-motion` para transições suaves de escala e opacidade.
- **Integração Global**: Adicionado ao `App.tsx` para garantir disponibilidade em todas as rotas do sistema.
- **Responsividade**: Posições ajustadas para Desktop (`top: 6rem`) e Mobile (`top: 5rem`) para evitar sobreposições.

### [2026-03-25] — Sistema de Denúncias Responsivo (Modal/Bottom Sheet)
Type: Feature | UX | Backend | Frontend
Files affected:
- frontend/src/shared/types/denuncia.types.ts
- frontend/src/shared/services/denuncia.service.ts
- frontend/src/features/denuncias/ModalDenuncia.tsx
- frontend/src/features/feed/PostActions.tsx

Contract affected?
- [x] Yes (Implemented POST /denuncias/:postId on frontend)

Impact verified?
- [x] Backend (Service snapshot logic)
- [x] Frontend (Responsive Modal/Bottom Sheet)
- [x] Build success (npm run build)
- [x] UX (Framer-motion animations / Mobile touch-ready)

O que foi feito:
- **Camada de Serviço (Frontend)**: Criados os tipos e o serviço de denúncia, conectando o frontend ao endpoint `/denuncias/:postId` do backend.
- **Componente Responsivo**: Desenvolvido o `ModalDenuncia.tsx` que se adapta automaticamente:
    - **Desktop**: Modal centralizado com backdrop blur.
    - **Mobile**: Bottom Sheet (abre de baixo para cima) otimizado para toque (botões de 44px+).
- **Animações Fluidas**: Integrado `framer-motion` para transições suaves e `AnimatePresence` para gerenciamento de montagem/desmontagem.
- **Integração no Feed**: O botão "Denunciar" na `PostActions.tsx` agora abre o novo modal, substituindo o alerta genérico anterior por um fluxo completo de seleção de motivo e descrição.
- **Segurança de Dados**: O backend já realiza snapshots dos posts denunciados, garantindo a preservação das evidências mesmo se o autor editar ou deletar o post original.

### [2026-03-25] — Refinamento de Listagem de Posts e Perfil Dinâmico
Type: Feature | Refactor | Backend | Frontend
Files affected:
- backend/src/features/posts/posts.service.ts
- frontend/src/shared/services/post.service.ts
- frontend/src/features/perfil/PerfilTabs.tsx

Contract affected?
- [x] No (Refinement of existing `autorId` filtering)

Impact verified?
- [x] Backend (Service query logic)
- [x] Frontend (PerfilTabs re-fetching and UI states)
- [x] Build success (npm run build)

O que foi feito:
- **Refinamento de Query (Backend)**: Validada a aplicação condicional do filtro `autor_id` no método `listar` do `posts.service.ts`, garantindo que o Prisma filtre corretamente as publicações por acadêmico.
- **Sincronia de Serviço (Frontend)**: Confirmada a passagem do parâmetro `autorId` na query string através da função `getPostsByUserId` no `post.service.ts`, agora integrada ao novo padrão de objeto de filtros.
- **Integração de UI (Perfil)**: Aprimorado o componente `PerfilTabs.tsx` para garantir o carregamento dinâmico baseado no `userId` das props. Refinados os estados de loading e empty states para diferenciar visualizações do próprio perfil vs perfis de terceiros.
- **Qualidade de Código**: Removidos filtros redundantes no frontend, priorizando a filtragem em nível de banco de dados para escalabilidade e performance.

### [2026-03-25] — Restauração de Dados e Refinamento de Tipagem Social
Type: Bugfix | Architecture | Backend
Files affected:
- backend/src/shared/types/auth.types.ts
- backend/src/shared/types/post.types.ts
- backend/src/features/auth/auth.controller.ts
- backend/src/features/auth/auth.service.ts
- backend/src/features/posts/posts.service.ts

Contract affected?
- [x] Yes (Restored `data_nascimento`, added `PostResponse` logic)

Impact verified?
- [x] Backend (Zod Validation Sync)
- [x] Build success (npm run build)
- [x] Data Policy (Restored mandatory field `data_nascimento`)

O que foi feito:
- **Restauração de Campo Crítico**: Reintroduzido o campo `data_nascimento` no `RegistrarSchema` e em todo o fluxo de criação de usuário (Controller/Service), garantindo conformidade com o `schema.prisma`.
- **Hardening de Admin**: Verificado que o campo `is_admin` está ausente nos schemas de registro e edição, impedindo escalação de privilégios via API.
- **Tipagem de Autoria (PostResponse)**: Criado o schema `PostResponseSchema` que reflete a nulidade do `autor_id` (SetNull) e utiliza snapshots obrigatórios (`autor_nome_user`, `nome_campus`) para exibição.
- **Hierarquia de Comentários**: Refinado o `PostCommentSchema` para suportar `parent_id` opcional e adicionado TODO técnico em `posts.service.ts` para travar respostas em 3º nível.

### [2026-03-25] — Sincronização de DTOs e Tipagem Arquitetural (Plano Prisma)
Type: Architecture | Refactor | Backend
Files affected:
- backend/src/shared/types/auth.types.ts
- backend/src/shared/types/post.types.ts
- backend/src/shared/types/comunidade.types.ts (NEW)
- backend/src/shared/types/denuncia.types.ts
- backend/src/shared/types/express.d.ts
- backend/src/features/auth/auth.controller.ts
- backend/src/features/auth/auth.service.ts
- backend/src/shared/utils/jwtUtils.ts

Contract affected?
- [x] Yes (Added `perfil_id`, `is_admin`, `nome_completo`, `nome_campus` to core flows)

Impact verified?
- [x] Backend (Zod Validation Sync)
- [x] Build success (npm run build)
- [x] Security (Strict schemas / JWT metadata)

O que foi feito:
- **Sincronização de Autenticação**: Atualizado `RegistrarSchema` com novos campos obrigatórios (`nome_completo`, `nome_campus`). Removido `data_nascimento` (descontinuado).
- **Hardening de JWT**: Refatorado `TokenPayloadSchema` para incluir explicitamente `perfil_id` e `is_admin`, além de suporte a metadados JWT (`iat`, `exp`).
- **Expansão de Posts**: Adicionado suporte a `status` (ANDAMENTO/CONCLUIDO), `obra_id` e `comunidade_id` no `PostCreateSchema`.
- **Hierarquia de Conteúdo**: Implementado suporte a `parent_id` em comentários e novo schema para `Reacoes` (LIKE, LOVE, FIRE, SAD).
- **Módulo de Comunidades**: Criado `comunidade.types.ts` com schemas completos para criação, configuração e gestão de membros (Roles).
- **Integridade de Denúncias**: Atualizado `denuncia.types.ts` para refletir `SetNull` (IDs opcionais no snapshot) e obrigatoriedade do `conteudo_snapshot`.
- **Extensão do Express**: Atualizado `express.d.ts` para incluir o objeto `user: AuthUser` tipado no `Request`, facilitando o acesso a metadados de segurança nos controllers.

### [2026-03-25] — Gamificação Atômica e Sincronia de Reatividade Instantânea
Type: Feature | Refactor | Security | Backend | Frontend
Files affected:
- backend/src/features/perfil/perfil.service.ts
- backend/src/features/posts/posts.service.ts
- backend/src/features/posts/posts.controller.ts
- backend/src/shared/utils/gamificacao.config.ts
- frontend/src/shared/utils/apiClient.ts
- frontend/src/shared/utils/authContext.tsx
- frontend/src/features/feed/PostActions.tsx
- frontend/src/features/feed/Feed.tsx
- frontend/src/shared/components/Header.tsx

Contract affected?
- [x] Yes (Added `perfil_atualizado` to social action responses)

Impact verified?
- [x] Backend (Atomic transactions / Progressive Level formula)
- [x] Frontend (Global event sync / Optimistic UI for votes)
- [x] Build success (npm run build)

O que foi feito:
- **Atomicidade de Gamificação (Backend)**: Refatorado o `processarGanhoXP` para utilizar uma única transação do Prisma, garantindo que o incremento de XP e a atualização de Nível ocorram de forma atômica, eliminando race conditions.
- **Fórmula de Nível Progressiva**: Implementada a fórmula `floor(sqrt(XP / 100))`, tornando a progressão mais desafiadora e justa à medida que o nível aumenta.
- **Economia de XP em Votos**: Adicionado ganho de XP em votos (+2 para quem vota, +10 para o autor se for UP). Implementada idempotência para garantir XP apenas no primeiro voto.
- **Enriquecimento de Resposta (Backend)**: Controllers de Post, Voto e Comentário agora retornam o objeto `perfil_atualizado`, permitindo reatividade imediata no frontend.
- **Sincronia de Estado Global (Frontend)**: O `apiClient.ts` intercepta o `perfil_atualizado` e dispara um evento global capturado pelo `AuthContext`, que atualiza o estado e o `localStorage` instantaneamente.
- **Reatividade Visual**: Sidebar, Header e GamificationPanel agora utilizam o estado global do `AuthContext`, refletindo ganhos de XP e Level Up no exato momento da ação social.
- **Optimistic UI para Votos**: Implementada atualização imediata do contador de votos na UI com rollback automático em caso de falha.

### [2026-03-25] — Filtragem de Posts por Autor e Sincronização de UI
Type: Feature | Refactor | Backend | Frontend
Files affected:
- backend/src/features/posts/posts.service.ts
- backend/src/features/posts/posts.controller.ts
- backend/src/shared/types/post.types.ts
- frontend/src/shared/services/post.service.ts
- frontend/src/features/perfil/PerfilTabs.tsx
- frontend/src/features/feed/Feed.tsx

Contract affected?
- [x] Yes (New query param `autorId` in `/posts`)

Impact verified?
- [x] Backend (Service/Controller logic for autor filtering)
- [x] Frontend (PerfilTabs dynamic loading / Feed service sync)
- [x] Build success (npm run build)

O que foi feito:
- **Filtragem por Autor (Backend)**: Expandida a rota de listagem de posts para aceitar o parâmetro `autorId`. O `posts.service.ts` agora integra esse filtro na cláusula `where` do Prisma, permitindo recuperar publicações de um acadêmico específico.
- **Refatoração de Serviço (Frontend)**: Atualizada a função `getPosts` no `post.service.ts` para aceitar um objeto de filtros (page, categoriaId, autorId), utilizando `URLSearchParams` para maior robustez.
- **Integração no Perfil**: O componente `PerfilTabs.tsx` agora carrega dinamicamente os posts do autor visualizado, eliminando filtros manuais no frontend e melhorando a performance via paginação real do banco.
- **Sincronia de Tipagem**: Corrigidos os pontos de chamada no `Feed.tsx` para se adequarem à nova assinatura do serviço `getPosts`, garantindo a integridade do build de produção.

### [2026-03-25] — Otimização de Performance, Privacidade e Optimistic UI
Type: Optimization | UI/UX | Security | Backend | Frontend
Files affected:
- backend/src/features/perfil/perfil.service.ts
- frontend/src/features/perfil/PerfilPage.tsx
- frontend/src/features/configuracoes/SubSeccionPerfil.tsx

Contract affected?
- [x] No (Semantic refinement only)

Impact verified?
- [x] Backend (Privacy by Design / Parallel Queries)
- [x] Frontend (Optimistic UI / Session Sync)
- [x] Build success (npm run build)

O que foi feito:
- **Privacidade por Design (Backend)**: Refatorado o `buscarPerfilCompleto` para omitir completamente o objeto `usuario` em visualizações de perfis de terceiros, reduzindo payload e protegendo dados sensíveis (e-mail, etc.).
- **Otimização de Query (Backend)**: Garantida a execução em paralelo de todas as contagens (posts, curtidas, seguidores) via `Promise.all`, reduzindo o TTFB (Time to First Byte) da API de perfil.
- **Optimistic UI (Frontend)**: Implementada atualização imediata do estado de seguimento e contadores na `PerfilPage.tsx`. O usuário vê a mudança instantaneamente, com rollback automático em caso de falha na API.
- **Sincronia de Sessão (Frontend)**: Integrada a atualização do `AuthContext` ao salvar alterações em `SubSeccionPerfil.tsx`. Mudanças no perfil (nome, bio) agora refletem globalmente (Header, Sidebar) sem necessidade de refresh.

### [2026-03-25] — Perfil Público, Estado de Seguimento Real e Privacidade
Type: Feature | Security | Backend | Frontend
Files affected:
- backend/src/features/perfil/perfil.service.ts
- backend/src/features/perfil/perfil.controller.ts
- backend/src/features/perfil/perfil.routes.ts
- frontend/src/shared/types/perfil.types.ts
- frontend/src/features/perfil/PerfilPage.tsx

Contract affected?
- [x] Yes (New endpoint GET /perfil/:id, new field is_following)

Impact verified?
- [x] Backend (Unitary logic for privacy/follow)
- [x] Frontend (UI sync with real data)
- [x] Build success (npm run build)
- [x] Privacy (Email redaction on public profiles)

O que foi feito:
- **Busca de Perfil Público**: Implementada rota `GET /perfil/:id` no backend para visualização de perfis de terceiros.
- **Estado de Seguimento Real**: Adicionado campo `is_following` calculado dinamicamente no backend com base no `visitanteId` (token JWT).
- **Privacidade por Design**: O e-mail do usuário agora é omitido automaticamente no serviço quando o perfil buscado não pertence ao requisitante.
- **Sincronia de UI**: Refatorada a `PerfilPage.tsx` para utilizar `is_following` real, removendo hacks baseados em `is_admin` e vinculando o botão de seguir ao estado real do banco de dados.
- **Roteamento Inteligente**: Detecção automática de "perfil próprio" na URL para decidir entre chamar `/me` ou `/:id`.

### [2026-03-25] — Notificações de Level Up e Humanização de Erros
Type: UI | Refactor | UX | Frontend
Files affected:
- frontend/src/shared/utils/Notificacao.ts
- frontend/src/shared/utils/authContext.tsx
- frontend/src/shared/utils/apiClient.ts

Contract affected?
- [x] No

Impact verified?
- [x] Frontend (UI/UX)
- [x] Build success (npm run build)
- [x] RPG Acadêmico (Dynamic Level Up)
- [x] Error Dictionary (Sync with Backend)

O que foi feito:
- **Level Up Modal**: Implementado método `Notificacao.modal.levelUp` com estética vibrante, timer de 5s e suporte a exibição de nova patente (título).
- **Monitor de Evolução**: Adicionado `useEffect` no `AuthContext` com `useRef` para detectar subida de nível em tempo real após qualquer interação (votos, posts, etc.) sem refresh.
- **Dicionário de Erros Humanizados**: Sincronização total com `ErrorCodes` do backend e mapeamento de mensagens amigáveis em português para falhas de autenticação, permissão e rate limiting.
- **Refinamento de UX**: Toasts de erro agora utilizam mensagens humanizadas, melhorando a comunicação de falhas para o usuário final.

### [2026-03-25] — Sincronização de Rotas e Refatoração de Contratos de API
Type: Refactor | Architecture | Security | Frontend
Files affected:
- frontend/src/shared/services/auth.service.ts
- frontend/src/shared/services/perfil.service.ts
- frontend/src/shared/utils/apiClient.ts
- frontend/src/shared/utils/Notificacao.ts
- frontend/src/features/configuracoes/SubSeccionPerfil.tsx
- frontend/src/features/configuracoes/SubSeccionPrivacidade.tsx

Contract affected?
- [x] Yes (Endpoint sync: /logout-all, /perfil/me, /perfil/seguranca/conta)

Impact verified?
- [x] Frontend (UI/UX)
- [x] Build success (npm run build)
- [x] Security (Password confirmation on delete)
- [x] API Contract (Standard envelope support in DELETE)

O que foi feito:
- **Sincronização de Endpoints**: Correção de disparidade entre Frontend e Backend. Logout agora aponta para `/auth/logout-all`, perfil para `/perfil/me` e exclusão de conta para `/perfil/seguranca/conta`.
- **Hardening de Deleção**: Implementação de fluxo de confirmação de senha obrigatória via modal antes de permitir a exclusão da conta em `SubSeccionPrivacidade.tsx`.
- **Refatoração do apiClient**: Evolução do wrapper `apiClient.delete` para suportar envio de payload no corpo da requisição (config.data), alinhando-se aos requisitos de segurança do backend.
- **Correção de Tipagem de Perfil**: Ajuste do service `updateMeuPerfil` para utilizar a chave `nome` em conformidade com o `PerfilPatchSchema` do backend, resolvendo erros de build.
- **Utilitário de Entrada**: Adição do método `Notificacao.modal.input` para capturar dados sensíveis (senhas) de forma padronizada.

### [2026-03-19] — Refinamento de Rigor (Explorar) e Arquitetura de Configurações
Type: UI | Refactor | Architecture | Frontend
Files affected:
- frontend/src/features/explorar/FiltrosSide.tsx
- frontend/src/features/explorar/ExplorarPage.tsx
- frontend/src/features/explorar/ListaResultados.tsx
- frontend/src/features/explorar/FiltrosTopo.tsx
- frontend/src/features/configuracoes/ConfigPage.tsx (Nested Routing)

Contract affected?
- [x] No (Frontend evolution only)

Impact verified?
- [x] Frontend (UI/UX)
- [x] Build success (npm run build)
- [x] Layout Híbrido (Mobile-First)
- [x] Scroll Independente (Aside)

O que foi feito:
- **Refatoração "AO3 Style" (Explorar)**: Migração para um bloco único de filtros coeso com checkboxes e grids de status, atingindo paridade total com o protótipo `copia.md`.
- **Arquitetura de Scroll**: Implementação de rolagem independente na coluna lateral (`aside`), removendo scrolls internos e garantindo que o bloco de Ajuda acompanhe a navegação.
- **Header de Resultados**: Inclusão de seletor de ordenação e contador dinâmico no topo da lista de resultados, melhorando a hierarquia visual.
- **Navegação Declarativa**: Adição de botão "Voltar" na pesquisa avançada utilizando `navigate(-1)` para manter a integridade do histórico do usuário.
- **Configurações via Sub-Rotas**: Reestruturação do módulo de configurações para usar rotas aninhadas, permitindo escalabilidade e isolamento de formulários.

### [2026-03-17] — Integração de Gamificação, Header Global e Refatoração de Rotas
Type: UI | Refactor | Architecture | Security | Frontend
Files affected:
- frontend/src/shared/components/Header.tsx (New)
- frontend/src/features/perfil/PerfilPage.tsx
- frontend/src/features/perfil/PerfilTabs.tsx
- frontend/src/features/perfil/PerfilSidebar.tsx
- frontend/src/features/perfil/PerfilConquistas.tsx
- frontend/src/features/auth/Login.tsx
- frontend/src/App.tsx
- frontend/src/shared/utils/authContext.tsx
- frontend/src/shared/utils/apiClient.ts

Contract affected?
- [x] Yes (Logout endpoint sync, token_version logic)

Impact verified?
- [x] Frontend (UI/UX)
- [x] Build success (npm run build)
- [x] Routing (Entry paths)
- [x] Security (Session invalidation)

O que foi feito:
- **Header Global ("Camaleão")**: Extração da lógica de cabeçalho do Feed para um componente global e stateless, altamente configurável via props.
- **Sincronia de RPG Acadêmico**: Integração completa do Perfil com o backend, substituindo mocks por dados reais de XP, Nível e Títulos.
- **Segurança de Sessão**: Implementação do logout assíncrono que invalida o `token_version` no backend e limpa o estado global do frontend, prevenindo vazamento visual de dados.
- **Arquitetura de Rotas**: Reestruturação das rotas de entrada para `/entrada` e `/entrada/cadastro`, melhorando a semântica do portal.
- **Isolamento de Dados**: Refatoração da listagem de posts no perfil para garantir que posts favoritados sejam privados e que a navegação não entre em loops.
- **Design System ("Fine UI")**: Normalização visual com tipografia Lexend e ícones Lucide de peso 1.5.

### [2026-03-15] — Funcionalidade de Visibilidade na Prévia e Preparação para Produção
Type: UI | Refactor | Frontend
Files affected:
- frontend/src/features/posts/PreviewCard.tsx

Contract affected?
- [x] No

Impact verified?
- [x] Frontend (UI toggle)
- [x] Build success (npm run build)

O que foi feito:
- **Estado de Visibilidade**: Implementado toggle `mostrarPrevia` usando `useState` e ícones `Eye`/`EyeOff`.
- **Renderização Condicional**: A prévia do post agora pode ser ocultada, exibindo um placeholder amigável em seu lugar.
- **Animações**: Adicionadas classes Tailwind para animação de entrada suave (`animate-in fade-in zoom-in-95`).
- **Verificação de Build**: Executado `npm run build` no frontend com sucesso, garantindo integridade para produção.

### [2026-03-09] — Auditoria de Código Morto, Refatoração de Erros e Design System
Type: Refactor | Architecture | Backend | Frontend | Security | Design System
Files affected:
- backend/src/shared/types/*.types.ts (Cleanup)
- backend/src/features/auth/auth.service.ts (Error refactor)
- backend/src/shared/utils/AppError.ts (New factory methods)
- backend/src/errors/ErrorCodes.ts (Sync with Frontend)
- backend/src/shared/middlewares/errorHandler.middleware.ts (setResponse helper)
- frontend/src/shared/styles/themes.css (Design Tokens)
- frontend/src/shared/types/errors.ts (Sync with Backend)
- frontend/src/shared/utils/apiClient.ts (New error codes support)
- frontend/src/features/auth/Login.tsx (Consolidação de Erros via Switch)

Contract affected?
- [x] No (Semantic evolution only)

Impact verified?
- [x] Backend (Cleanup & Error handling)
- [x] Frontend (Design Tokens & API Sync)
- [x] Build success (npm run build)
- [x] Tests (Mega Stress 100% success)
- [x] Error Codes (Global Sync)

O que foi feito:
- **Cleanup de Código Morto**: Removidas funções e tipos órfãos, validado com testes de estresse.
- **Refatoração de Erros**: Implementado "All-or-Nothing" nos services, eliminando 200/202 para erros de negócio e unificando o dicionário de erros global.
- **Design System**: Lançada a base visual do frontend com suporte nativo a temas (Light/Dark) e variáveis CSS de identidade.
- **Observabilidade**: Adicionados logs de rastreamento para depuração de CORS/Auth e endpoint de diagnóstico público.
- **Frontend Refactoring**: Refatorado `Login.tsx` para usar `switch(err.errorCode)`, eliminando parsing de strings e melhorando a UX com feedbacks precisos.
- **UX & Notificações**: Refatorado `Notificacao.ts` para suportar `SweetAlertResult` e ações reais. Implementado botão "Abrir Gmail" para facilitar o acesso à caixa de entrada após cadastro/aviso de conta pendente.
- **Feature Feed**: Implementada arquitetura modular para o Feed (`src/features/feed/`) seguindo o design system "EscrevAí". Integrado ao Dashboard central.

### [2026-03-08] — Refatoração da Tela de Login (UI/UX "EscrevAí")
Type: Refactor | UI/UX | Frontend
Files affected:
- frontend/src/features/auth/Login.tsx
- frontend/src/shared/components/ThemeToggle.tsx
- frontend/src/index.css
- frontend/src/App.tsx
- frontend/src/shared/utils/authContext.tsx

Contract affected?
- [x] No

Impact verified?
- [x] Frontend (Login UI/UX)
- [x] Build success (npm run build)
- [x] Design System (ThemeToggle, CSS variables)
- [x] Auth Context (no-op, path fixes)

O que foi feito:
- **Refatoração Completa do Login.tsx**: O JSX foi reescrito para um layout moderno e responsivo, com cabeçalho, rodapé e card central, alinhado à identidade "EscrevAí".
- **UX Aprimorada**:
  - **Progressive Disclosure**: Campo "Confirmar Senha" condicional à força da senha.
  - **Máscara de Data**: Uso de `react-input-mask` para o formato `DD/MM/YYYY`.
  - **Funcionalidades Adicionais**: Implementado "Lembrar de mim" (localStorage) e "Termos de Uso" (obrigatório no cadastro).
- **Componentes e Estilos**:
  - `ThemeToggle.tsx` refatorado para remover posicionamento fixo e adicionar efeitos visuais dinâmicos.
  - `index.css` ajustado para ocultar o ícone nativo do seletor de data.
- **Correção de Build**: Resolvidos múltiplos erros de `casing` em importações (`TS1149`/`TS1261`) que impediam o build do frontend.

All structural changes MUST be registered here.

Template:

### [YYYY-MM-DD] — Short Description
Type: Schema | Endpoint | UI | Middleware | Security | Design System | Refactor 
Files affected:
- backend/...
- frontend/...

Contract affected?
- [ ] No
- [ ] Yes → Update Endpoint Contract Grid

Impact verified?
- [ ] Backend
- [ ] Frontend
- [ ] Zod Schemas
- [ ] Prisma Schema
- [ ] Error Envelope
- [ ] Tests
- [ ] Seed
- [ ] Design Tokens
- [ ] Auth Context

---

### [2026-03-03] — Implementação de Tratamento Global de Sessão e Limpeza de Serviços
Type: Refactor | Auth | Middleware
Files affected:
- frontend/src/shared/utils/axios.ts
- frontend/src/shared/utils/authContext.tsx
- frontend/src/features/auth/Login.tsx
- frontend/src/features/auth/Redefinir.tsx
- frontend/src/features/dashboard/Dashboard.tsx

Contract affected?
- [x] No
- [ ] Yes → Update Endpoint Contract Grid

Impact verified?
- [ ] Backend
- [x] Frontend
- [ ] Zod Schemas
- [ ] Prisma Schema
- [ ] Error Envelope
- [ ] Tests
- [ ] Seed
- [ ] Design Tokens
- [x] Auth Context

O que foi feito:
- Centralização de logout em caso de 401/403 no interceptor com disparo de broadcastUnauthorized.
- AuthContext.logout limpa sessão, exibe toast amarelo e redireciona para /login.
- Login/Redefinir: remoção de estados de erro redundantes e abandono de window.alert; delegação de erros ao interceptor; sucesso via SweetAlert/Toast.
- Dashboard: uso de serviços apiClient, adição de loading/erro; sem fallback de dados locais.

Verificação:
- Em qualquer 401/403/TOKEN_EXPIRED, o interceptor dispara toast amarelo e o roteamento envia ao /login via ProtectedRoute após logout.

---
### [2026-03-06] — Padronização de Envelope Global, Unificação de Rede e Notificações
Type: Refactor | Architecture | Security | Frontend
Files affected:
- backend/src/features/*/controller.ts
- backend/src/shared/utils/serviceEmail.ts
- backend/src/server.ts
- frontend/src/shared/utils/apiClient.ts
- frontend/src/shared/utils/Notificacao.ts
- frontend/src/shared/utils/axios.ts, alerta.ts, toast.ts (DELETED)

Contract affected?
- [x] Yes → DELETE status updated to 200 OK + Envelope

Impact verified?
- [x] Backend (Controllers refactored)
- [x] Frontend (apiClient unified)
- [x] Frontend (Notificacao system migrated)
- [x] Zod Schemas
- [x] Error Envelope (Success standard)
- [x] SMTP Health Check (Async cache)
- [x] Build success (npm run build)

---
### [2026-03-06] — Reorganização de Segurança: Guards e Barrel Exports
Type: Refactor | Architecture | Security
Files affected:
- frontend/src/shared/guards/ProtectedRoute.tsx
- frontend/src/shared/guards/PublicOnlyRoute.tsx
- frontend/src/shared/guards/index.ts
- frontend/src/shared/utils/authContext.tsx
- frontend/src/App.tsx

O que foi feito:
- Criação da camada de Guards em `src/shared/guards`.
- Implementação de `PublicOnlyRoute` para redirecionar usuários logados tentando acessar `/login`.
- Extração de `AuthLoadingScreen` para o `authContext` para eliminar duplicação de UI de carregamento.
- Unificação das exportações de segurança via Barrel File (`index.ts`).
- Deleção do arquivo legado `src/shared/utils/ProtectedRoute.tsx`.

---
### [2026-03-06] — Refatoração do Dashboard: Layout Holy Grail e Mobile-First
Type: Refactor | UX | UI | Frontend
Files affected:
- frontend/src/features/dashboard/Dashboard.tsx

O que foi feito:
- Substituição do layout estático por um sistema de 3 colunas dinâmico (Holy Grail).
- Implementação de estados de visibilidade para as colunas laterais no Desktop.
- Adição de Menu Hamburger (Drawer) para acesso à navegação no Mobile.
- Integração do `ThemeToggle` e controles de layout no Header.
- Refatoração dos componentes internos (`Sidebar`, `Feed`, `GamificationPanel`) para um design moderno com `lucide-react`.
- Tratamento robusto de erros de API com mensagens contextuais.

---
### [2026-03-06] — Refatoração de Tratamento de Erros no Login
Type: Refactor | UX | Frontend
Files affected:
- frontend/src/features/auth/Login.tsx
- frontend/src/shared/utils/apiClient.ts

O que foi feito:
- Implementação de `try/catch` explícito no `enviarFormulario` do Login.
- Diferenciação entre erros 401 (Credenciais Inválidas) via Toast e erros de sistema via Modal.
- Ajuste do `apiClient` para não disparar notificações globais durante tentativas de login, permitindo controle local.
- Unificação do lançamento de exceções via `AppError`.

---
### [2026-03-06] — Hardening de Autenticação: Validação Proativa de JWT
Type: Security | Architecture | Frontend
Files affected:
- frontend/src/shared/utils/authContext.tsx
- frontend/src/App.tsx

Contract affected?
- [ ] No
- [x] Yes → Token payload validation (exp) enforced on client-side init

Impact verified?
- [x] Frontend (Auth flow)
- [x] LocalStorage cleanup (Proactive)
- [x] Race Condition eliminated
- [x] Build success (npm run build)

O que foi feito:
- Refatoração do `AuthProvider` para validar a claim `exp` do JWT durante a inicialização síncrona do estado.
- Implementação de `parseJwt` para inspeção de payload.
- Adição de margem de segurança (10s) na validação de expiração.
- Travamento de renderização no `App.tsx` enquanto a sessão está sendo validada (`loading`).

---
## GLOBAL IMPACT MATRIX (MANDATORY BEFORE ANY CHANGE)
### [2026-03-03] — Implementação de Navegação Imperativa pós-Login
- Tipo: Refactor | UX | Auth
- Arquivos afetados: frontend/src/features/auth/Login.tsx
- Contrato alterado: Não. Apenas o fluxo de UX foi aprimorado com navegação declarativa pós-autenticação.
- Impacto verificado: Frontend (Login flow).
Verificação:
- Uso de replace: true no navigate('/dashboard', { replace: true }) para evitar retorno ao /login após autenticar.

---
## GLOBAL IMPACT MATRIX (MANDATORY BEFORE ANY CHANGE)
### [2026-03-03] — Engajamento: Votos, Comentários, Denúncias e Log de Atividade
Type: Endpoint | Service | Security | Refactor
Files affected:
- backend/src/features/posts/posts.service.ts
- backend/src/features/posts/posts.controller.ts
- backend/src/features/posts/posts.routes.ts
- backend/src/shared/types/post.types.ts
- backend/src/features/denuncias/denuncias.service.ts
- backend/src/features/denuncias/denuncias.controller.ts
- backend/src/features/denuncias/denuncias.routes.ts
- backend/src/shared/types/denuncia.types.ts
- backend/src/shared/utils/logService.ts
- backend/src/features/auth/auth.service.ts
- backend/src/server.ts
- DOCUMENTACAO_API_FRONTEND.md

Contract affected?
- [x] Yes → Update Endpoint Contract Grid

Impact verified?
- [x] Backend
- [x] Frontend
- [x] Zod Schemas
- [ ] Prisma Schema
- [x] Error Envelope
- [x] Tests
- [ ] Seed
- [ ] Design Tokens
- [ ] Auth Context

O que foi feito:
- Votos: POST /posts/:id/votar com upsert e sincronização de contadores.
- Comentários: POST /posts/:id/comentarios com atualização de total.
- Listagem de posts: filtros estendidos com ordenarPor no contrato de query.
- Denúncias: POST /denuncias/:postId com snapshot transacional do post.
- Log de Atividade: serviço único e injeções em login/logout, votos, comentários e denúncias.

Verificação:
- Todas as novas rotas passam por authMiddleware e validate(ZodSchema).
- Build do backend sem erros após alterações.
- Documentação do frontend atualizada com novas rotas.


## GLOBAL IMPACT MATRIX (MANDATORY BEFORE ANY CHANGE)

Whenever modifying ANY field, route, schema, or UI element:

IMPACT MATRIX — TEMPLATE

1. Prisma schema impacted?
2. Migration required?
3. Zod schema updated?
4. Controller updated?
5. Service updated?
6. Repository queries impacted?
7. Tests updated?
8. Frontend types updated?
9. Form validation updated?
10. SweetAlert decision logic impacted?
11. Endpoint Contract Grid updated?
12. PROJECT_MEMORY updated?

Change MUST NOT proceed without this matrix.

---

### [2026-03-03] — Correção de Engajamento e Contadores Materializados
- Tipo: Bugfix | Service | Controller
- Arquivos afetados: backend/src/features/posts/posts.service.ts, backend/src/features/posts/posts.controller.ts
- O que foi feito: Implementação de transações atômicas para votos (upsert + recálculo) e comentários (criação + incremento) retornando o objeto Post completo com autor após as ações. Corrige falha de testes que acessavam total_upvotes em respostas incompletas.

Verificação:
- Os métodos votarPost/comentarPost retornam o postAtualizado (include autor.nome_user). Os controllers enviam res.status(...).json({ status, message, data: postAtualizado }), alinhado ao contrato Prisma e ao envelope imutável de sucesso.

---
# 🛑 ARCHITECTURAL RULES (IMMUTABLE)

1. Never modify frontend contract without backend contract update.
2. Never modify Prisma schema without updating:
   - Zod
   - Service logic
   - Tests
   - Seed
3. Never alter success/error envelope structure.
4. Never bypass middleware chain.
5. Never inject UI colors outside Design System tokens.
6. Never alter token_version semantics without synchronizing:
   - auth.service.ts
   - authMiddleware.ts
   - optionalAuthMiddleware.ts
   - TokenPayloadSchema

---

# 🧭 FRONTEND-BACKEND CONTRACT RULES (GOLDEN RULES)

Any new development MUST adhere to the following architectural constraints:

1. **API Communication**: Strictly forbidden to use `fetch` or `axios` directly in components. Always use the `apiClient` wrapper for network requests to ensure centralized handling.
2. **Success Envelope**: ALL success responses MUST follow the template: `{ status: "success", message: string, data: any | null, meta: any | null }`.
3. **HTTP 204 Deprecation**: Status 204 is forbidden. All deletions and actions without return data MUST use HTTP 200 (or 201 for creation) with the standardized envelope (`data: null` if empty).
4. **Typing & Contracts**: Never define manual interfaces for backend-sourced data. Use centralized `Zod Schemas` in `frontend/src/shared/types/` and export types via `z.infer`.
3. **Type Structure**:
   - Domain/Contract types (API DTOs) -> `shared/types/`.
   - UI State types (form state, local view state) -> Co-located within the component file.
   - `models.ts` is strictly prohibited.
4. **Contract Validation**: Every API response MUST be validated within the `apiClient` using `.safeParse()` against the corresponding Zod Schema.
5. **Error Handling**: On contract validation failure, throw `AppError.internal` to notify integration failures. Do not allow corrupt data to leak into the UI layer.

---

## DESIGN SYSTEM CHANGE PROTOCOL

If palette is changed:
- Only modify:
  - index.css
  - tailwind.config.ts
  - themeHandler.tsx

Never change .tsx inline colors.

Must update:
- Light mode variables
- Dark mode variables
- SweetAlert references

---

# EVERYTHING BELOW REMAINS EXACTLY AS PROVIDED
# (NO CONTENT REMOVED — ONLY VERSION TAG UPDATED)

[All original forensic documentation continues unchanged below]

---

## Mandatory Order

1) Analyze ALL tests first.  
2) Build the OWASP Defense Matrix.  
3) Map Active Protections.  
4) Complete Backend Forensic Mapping.  
5) Complete Frontend Mapping.  
6) Build Global Dependency Map.  
7) Build Impact Matrix.  
8) Generate the Consolidated Document.

---

## Stage 1 — Tests & OWASP Matrix

Per test file documentation:
- mega-stress-test.ts
  - File: [mega-stress-test.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/testes/mega-stress-test.ts)
  - Suite: Auth, Profile/Security, Interests, Categories(Admin), Posts, Business Rules, Health, DX Shield
  - Objective: Measure resilience, detect real functional and security failures, and flag slow endpoints (>800ms).
  - Simulated Attack: Mass Assignment (is_admin), Privilege Escalation via extra fields, Unauthorized Delete (403), Weak Passwords, Structural Bomb (deep JSON), Empty Payload.
  - Protected Layer: Validation (Zod), Authentication (JWT), Optional Auth, Depth Limiter, Error Handler.
  - Validated Functions: login, registrar, perfil update/senha, categorias CRUD, posts CRUD, interests follow/unfollow, health checks.
- verify-dx.ts
  - File: [verify-dx.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/testes/verify-dx.ts)
  - Suite: DX validation
  - Objective: Assert 400 on invalid/empty JSON with proper ErrorCodes (INVALID_JSON_FORMAT/EMPTY_PAYLOAD).
  - Simulated Attack: Malformed JSON / Empty body.
  - Protected Layer: Global Error Handler, body parser integration.
  - Validated Function: tratadorDeErros + JSON parsing pipeline.
- verify-health.ts
  - File: [verify-health.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/testes/verify-health.ts)
  - Suite: Health/Liveness
  - Objective: Ensure /saude and /saude/live reflect UP/DEGRADED/DOWN properly.
  - Simulated Attack: N/A (infra diagnosis).
  - Protected Layer: rate limiter for health, controller logic.
  - Validated Function: health.controller.checkHealth/checkLiveness.
 - social-features-test.ts
  - File: [social-features-test.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/testes/social-features-test.ts)
  - Suite: Social Features — Votos, Comentários, Denúncias
  - Objective: Validar fluxo de engajamento (votar/comentar/denunciar), atualização de contadores, bloqueio de duplicatas e não reflexão de payload malicioso nas mensagens do sistema.
  - Simulated Attack: XSS payload (comentários) — garante que a API não reflita HTML/JS em mensagens de resposta.
  - Protected Layer: authMiddleware, validate (Zod), sanitize (limpezaDeEntrada), limitadorEngajamento, errorHandler; auditoria via logService.
  - Validated Functions: posts votar/comentar; denuncias criar.

OWASP Defense Matrix:

| Threat | Test File | Layer | Function | Middleware | Risk if Modified |
| :--- | :--- | :--- | :--- | :--- | :--- |
| SQL Injection | — | Repository (Prisma) | N/A | N/A | ⚠️ AREA WITHOUT TEST COVERAGE |
| NoSQL Injection | — | N/A (SQL stack) | N/A | N/A | N/A |
| XSS (client-side) | — | Presentation | Client rendering/escaping | — | ⚠️ AREA WITHOUT TEST COVERAGE |
| XSS (server-side reflection) | social-features-test.ts | Controller | posts.comment → non-reflecting messages | validate.middleware → sanitize | Covered (messages not reflective) |
| CSRF | — | Middleware | N/A (token-based API) | — | ⚠️ AREA WITHOUT TEST COVERAGE |
| IDOR | mega-stress-test.ts | Controller/Service | posts delete by non-owner → 403 | authMiddleware | High if disabled (improper deletions) |
| Broken Access Control | mega-stress-test.ts | Controller/Service | “Regra: Delete Post de Outro Usuário” → 403 | authMiddleware | Critical if modified |
| Broken Authentication | mega-stress-test.ts | Auth Service | login fail → 401 | validate + limitadorLogin | High if 401 is altered |
| Mass Assignment | mega-stress-test.ts | Controllers/Services | registrar (is_admin) → 400 FIELD_VALIDATION; perfil PATCH extras → 400 | validate.middleware (Zod strict/strip) | Critical if schema relaxes |
| Privilege Escalation | mega-stress-test.ts | Controller | senha PATCH with is_admin → 400 | validate.middleware | Critical if extra fields allowed |
| Rate Limiting | — | Middleware | limitadorLogin/limitadorAcoesAuth/limitadorSaude | rateLimiter.ts | ⚠️ AREA WITHOUT TEST COVERAGE |
| Schema Validation | mega-stress-test.ts | Middleware | multiple 400 FIELD_VALIDATION | validate.middleware | High if schemas altered |
| Sanitization/Structural Limits | mega-stress-test.ts, verify-dx.ts | Middleware | INVALID_JSON_STRUCTURE / INVALID_JSON_FORMAT / EMPTY_PAYLOAD | jsonDepthMiddleware, errorHandler | High if limits removed |

Notes:
- The stress test flags slow endpoints (>800ms) which indirectly captures hashing performance changes.
- Admin-only category creation by regular user is commented (TODO) in tests; Access Control for that path is enforced in routes but not currently tested.

---

## Stage 2 — Backend Forensics

Routes Mapping (ROUTE → CONTROLLER → SERVICE → REPOSITORY → prisma.client.ts):
- auth.routes.ts
  - POST /auth/registrar → auth.controller.registrar → auth.service.registrar → Prisma → [prisma.client.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/prisma/prisma.client.ts)
  - GET /auth/confirmar → auth.controller.confirmarEmail → auth.service.confirmarEmail → Prisma → prisma.client.ts
  - POST /auth/logar → auth.controller.logar → auth.service.logar → Prisma → prisma.client.ts
  - POST /auth/solicitar-recuperacao → auth.controller.solicitarRecuperacao → recuperacao.service.solicitar → Prisma → prisma.client.ts
  - POST /auth/redefinir-senha → auth.controller.redefinirSenha → recuperacao.service.redefinir → Prisma → prisma.client.ts
  - POST /auth/logout-all → auth.controller.logoutAll → auth.service.logoutAll → Prisma → prisma.client.ts
- perfil.routes.ts
  - GET /perfil/me → perfil.controller.getPerfilInfo → perfil.service.buscarPerfilCompleto → Prisma → prisma.client.ts
  - PATCH /perfil/me → perfil.controller.updatePerfil → perfil.service.atualizarPerfil → Prisma → prisma.client.ts
  - PATCH /perfil/seguranca/senha → perfil.controller.alterarSenha → seguranca.service.alterarSenha → Prisma → prisma.client.ts
  - DELETE /perfil/seguranca/conta → perfil.controller.deletarPerfil → seguranca.service.deletarConta → Prisma → prisma.client.ts
- posts.routes.ts
  - GET /posts → posts.controller.listarPosts → posts.service.listar → Prisma → prisma.client.ts
  - POST /posts → posts.controller.criarPost → posts.service.criar → Prisma → prisma.client.ts
  - DELETE /posts/:id → posts.controller.deletarPost → posts.service.deletar → Prisma → prisma.client.ts
- categorias.routes.ts
  - GET /categorias → categorias.controller.listar → categorias.service.listar → Prisma → prisma.client.ts
  - POST /categorias → categorias.controller.criar → categorias.service.criar → Prisma → prisma.client.ts
  - PATCH /categorias/:id → categorias.controller.atualizar → categorias.service.atualizar → Prisma → prisma.client.ts
  - DELETE /categorias/:id → categorias.controller.excluir → categorias.service.excluir → Prisma → prisma.client.ts
- denuncias.routes.ts
  - POST /denuncias/:postId → denuncias.controller.criar → denuncias.service.registrarDenuncia → Prisma → prisma.client.ts
- health.routes.ts
  - GET /saude → health.controller.checkHealth → Prisma (db probe) + serviceEmail.diagnosticarSMTP → prisma.client.ts
  - GET /saude/live → health.controller.checkLiveness → N/A → N/A

Active Protections (Behavior Map):
- validate.middleware.ts
  - File & Function: [validate.middleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/validate.middleware.ts#L1-L41) validate()
  - Dependencies: zod, sanitize.ts
  - Perfect Use Scenario: Body/Query/Params shaped to schema via objeto { body, query, params }; 200/201/204 as per route.
  - Error Reaction: ZodError → 400 FIELD_VALIDATION with details (errorHandler formats).
  - Impact if Removed: Contract enforcement disappears; Mass Assignment and type coercion bypassed.
- jsonDepth.middleware.ts
  - File & Function: [jsonDepth.middleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/jsonDepth.middleware.ts#L1-L60) jsonDepthMiddleware(maxDepth)
  - Dependencies: AppError, ErrorCodes
  - Perfect Use Scenario: Global guard with maxDepth=7 before routes; blocks JSON Bomb.
  - Error Reaction: Depth > max → 400 INVALID_JSON_STRUCTURE; parse fail → 400 INVALID_JSON_FORMAT.
  - Impact if Removed: Opens DoS via deeply nested payloads.
- security.middleware.ts
  - File & Function: [security.middleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/security.middleware.ts#L1-L32) enforceSecurity
  - Dependencies: AppError, ErrorCodes
  - Perfect Use Scenario: In produção, exige HTTPS e valida Host contra API_URL; fora de prod, no-op.
  - Error Reaction: 403 FORBIDDEN para HTTP/host inválido; 500 INTERNAL_ERROR para API_URL inválida.
  - Impact if Removed: Risco de downgrades TLS e host header attacks em produção.
- authMiddleware.ts
  - File & Function: [authMiddleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/authMiddleware.ts#L1-L39) middlewareAutenticacao
  - Dependencies: jwtUtils.verificarToken, prisma.client.ts
  - Perfect Use Scenario: Authorization: Bearer <jwt>; token decodes; token_version matches DB; 200/202 in controlled routes.
  - Error Reaction: Missing/malformed token → 401 UNAUTHENTICATED; TokenExpiredError → 401 TOKEN_EXPIRED; JsonWebTokenError → 401 TOKEN_INVALID; Mismatch token_version → 401 UNAUTHENTICATED (“Sessão revogada.”).
  - Impact if Removed: All protected endpoints become publicly writable/readable; critical.
- optionalAuthMiddleware.ts
  - File & Function: [optionalAuthMiddleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/optionalAuthMiddleware.ts#L1-L49) middlewareAutenticacaoOpcional
  - Dependencies: jwtUtils.verificarToken, prisma.client.ts
  - Perfect Use Scenario: Public routes read identity if present; else continue anonymous.
  - Error Reaction: On invalid/expired token, silently clears identity and continues as anonymous.
  - Impact if Removed: Public routes lose identity context (e.g., personalized listings).
- rateLimiter.ts
  - File & Function: [rateLimiter.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/rateLimiter.ts#L1-L96) createRateLimiter(), limitadores
  - Dependencies: express-rate-limit, AppError, ErrorCodes
  - Perfect Use Scenario: limitadorRegistro/limitadorLogin/limitadorSaude/limitadorEngajamento/limitadorLeitura aplicados por rota.
  - Error Reaction: On exceed → 429 RATE_LIMIT_EXCEEDED.
  - Impact if Removed: Exposição a brute force, scrapers, abusos de leitura/engajamento.
- sanitize.ts
  - File & Function: [sanitize.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/utils/sanitize.ts#L1-L90) limpezaDeEntrada and helpers
  - Dependencies: AppError, ErrorCodes, logger
  - Perfect Use Scenario: Applied before Zod; strings escaped; control chars stripped.
  - Error Reaction: Null byte → 400 BAD_REQUEST; logs SECURITY_SANITIZE_ALERT.
  - Impact if Removed: Increased risk of injection at presentation layers and unexpected control chars.
- hashing.ts
  - File & Function: [hashing.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/utils/hashing.ts#L1-L21) gerarHashSenha, compararSenha
  - Dependencies: bcryptjs
  - Perfect Use Scenario: gerarHashSenha at registration/reset; compararSenha at login; success 200.
  - Error Reaction: Operational errors bubble to error handler; latency increases reflected in stress test slow flags.
  - Impact if Removed: Passwords stored in plaintext or unverifiable; catastrophic.
- limpezaContas.ts
  - File & Function: [limpezaContas.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/agendador/limpezaContas.ts) limparContasExpiradas
  - Dependencies: prisma.client.ts, logger, ErrorCodes
  - Perfect Use Scenario: Deletes unconfirmed expired accounts; logs metrics.
  - Error Reaction: On delete failure logs CLEANUP_JOB_FAILED per user; on global failure logs and continues.
  - Impact if Removed: Orphaned accounts accumulate; potential data hygiene and security policy drift.

Hidden Dependency Chain — token_version:
- Schema: [schema.prisma](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/schema.prisma)
- Token payload: [auth.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/auth.types.ts)
- Issuance/LogoutAll: [auth.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.service.ts)
- Validation: [authMiddleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/authMiddleware.ts), [optionalAuthMiddleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/optionalAuthMiddleware.ts)

---

## Stage 3 — Frontend & UX Logic

Separation by type:
- UI (.tsx): features, shared/components
- Logic (.ts): shared/utils, hooks
- Services: shared/services
- Contexts: shared/utils/authContext.tsx
- Types: shared/types

Flow Mapping (Component → Hook/Context → Service → Backend Route):
- Login.tsx → useTema/useAuth → auth.service.(fazerLogin|registrarUsuario) → POST /auth/logar | POST /auth/registrar
- Other pages (profile, posts, interests) follow analogous pattern via their services and protected routes.

Parity Validation (types):
- ErrorCodes parity confirmed: [backend ErrorCodes](file:///c:/Users/Guilherme/Documents/teste0/backend/src/errors/ErrorCodes.ts) ↔ [frontend ErrorCodes](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/types/errors.ts)
- Token/DTO parity: frontend consumes token as opaque string; backend TokenPayload includes token_version; no mismatch detected in current interfaces.

Surgical Details:
- Login.tsx — Password strength gating for “Confirm Password”:
  - Strength rules derived in-state: length ≥ 8, one uppercase, one digit.
  - Visibility trigger: field appears only when not login and senhaForteNow is true [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx#L200-L235) (approximate range covering the conditional block).
- SweetAlert2 Decision Tree:
  - 202 (Registration): success alert with “Open Gmail” path; confirmation opens Gmail; form resets [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx#L44-L74) [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx#L150-L175).
  - 400/409 (Email exists): warning with “Fazer Login” or “Recuperar Senha”; cancel opens /redefinir-senha [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx#L76-L99) [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx#L150-L175).
- Theme Injection into Alerts:
  - Theme context computes dark/light and sets :root classes [themeHandler.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/utils/themeHandler.tsx).
  - Alerts reference CSS variables for background/foreground colors at call sites [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx#L60-L74).

---

## DESIGN SYSTEM CONTRACT

Source of truth: [index.css](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/index.css), [tailwind.config.ts](file:///c:/Users/Guilherme/Documents/teste0/frontend/tailwind.config.ts), [themeHandler.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/utils/themeHandler.tsx)

- Primary colors (light mode :root):
  - --color-if-green: #2f9e41
  - --color-if-red: #cd191e
  - --color-if-black: #000000
  - --accent-primary: #f59e0b
- Surfaces and text (light):
  - --bg-primary: #f7f8fa
  - --bg-card: #ffffff
  - --text-primary: #111827
  - --text-secondary: #6b7280
  - --input-bg: #f5f5f5
  - --border-color: #cecece
  - --shadow-elevation-1: 0 1px 2px rgba(0,0,0,0.06)
  - --overlay-bg: rgba(0,0,0,0.2)
  - color-scheme: light
- Surfaces and text (dark-mode class):
  - --bg-primary: #28292a
  - --bg-card: #3c3c3c
  - --text-primary: #f3f4f6
  - --text-secondary: #d4d4d4
  - --input-bg: #323232
  - --border-color: #4b4b4b
  - --shadow-elevation-1: 0 1px 2px rgba(0,0,0,0.4)
  - --accent-primary: #f59e0b
  - --overlay-bg: rgba(0,0,0,0.3)
  - color-scheme: dark
- Tailwind integration:
  - darkMode configured for class strategy with '.dark-mode'.
  - Base, components, utilities imported from Tailwind; custom variables drive component colors.
- Interaction rules:
  - Inputs/textarea/select: transition-colors 300ms; focus-visible outline 3px var(--color-if-green); focus border-color var(--color-if-green).
  - .card: transition-all 300ms; uses bg-card, border-color, shadow-elevation-1; lighter border in light-mode.
  - Buttons:
    - .btn-entrar uses border-color/text-primary with transitions on background, color, shadow.
    - .btn-sucesso uses --color-if-green; .btn-erro uses --color-if-red.
  - Validation states:
    - .input-sucesso → border-color: --color-if-green
    - .input-erro → border-color: --color-if-red
- Theme initialization and switching logic:
  - Preference key: 'theme-preference' in localStorage.
  - Modes: 'light' | 'dark' | 'system'; system observes '(prefers-color-scheme: dark)'.
  - applyThemeClass toggles documentElement classes 'dark-mode' or 'light-mode' and sets CSS color-scheme.
  - On load: inicializarTema applies effective mode and adds 'theme-ready' to prevent FOUC.
  - Live updates: listens for system theme changes and storage events to re-apply classes.
  - Programmatic API: setTema(mode), getTema(), alternarTema() exposed by ThemeContext.

---

## ENDPOINT CONTRACT GRID
| Route | Method | Success Body (2xx) | Error Reactions (Codes & Logic) | Mandatory Fields |
|-------|--------|--------------------|----------------------------------|------------------|
| /api/v1/auth/registrar | POST | 202 Accepted → { status: "success", message } | 400 FIELD_VALIDATION (Zod strict), 409 EMAIL_ALREADY_EXISTS (Prisma P2002), 429 RATE_LIMIT_EXCEEDED | nome_completo, nome_user, nome_campus, data_nascimento, email, senha |

Immutable Data Contracts — Identity Separation:
- usuarios: nome_completo (VarChar 150), data_nascimento (DateTime), nome_campus (VarChar 100)
- perfis: nome_user (VarChar 100, unique)

Database Integrity Matrix — Migration:
- 2026-02-23 add_separa_nomeEninck
  - perfis.nome → perfis.nome_user (rename, preserves unique constraint)
  - usuarios add: nome_completo, data_nascimento, nome_campus (nullable to preserve backward compat)

Nominal Impact Matrix — Cross-Layer Updates:
- Backend
  - Schema: prisma/schema.prisma (usuarios/perfis)
  - Zod: shared/types/auth.types.ts (RegistrarSchema requires 6 fields)
  - Services: features/auth/auth.service.ts (transaction persists usuarios + perfis)
  - Controllers: features/auth/auth.controller.ts (destructure new fields)
  - Domain: features/posts/posts.service.ts (select autor.nome_user → DTO autor.nome)
  - Perfil: features/perfil/perfil.service.ts (update nome_user), features/perfil/seguranca.service.ts (anon user lookup by nome_user)
- Frontend
  - Types: frontend/src/shared/types/auth.types.ts (RegisterPayload)
  - Service: frontend/src/shared/services/auth.service.ts (registrarUsuario payload)
  - UI: frontend/src/features/auth/Login.tsx (form fields and validation)

OWASP Matrix Validation:
- Mass Assignment Protection intact via Zod .strict() on RegistrarSchema
- Controller whitelisting preserved; extra fields produce 400 FIELD_VALIDATION

Source files: backend controllers/routes under backend/src/features; request/response schemas under backend/src/shared/types; error envelope at [errorHandler.middleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/errorHandler.middleware.ts)

- Auth
  - Route: /api/v1/auth/registrar
    - Method: POST
    - Success Body (202): { status: "success", message, meta: null }
    - Error Reactions: 400 FIELD_VALIDATION (RegistrarSchema), 429 RATE_LIMIT_EXCEEDED (limitadorAcoesAuth), 415 INVALID_CONTENT_TYPE, 400 INVALID_JSON_FORMAT / EMPTY_PAYLOAD; Note: Duplicates are handled as 202 (privacy); global P2002 maps to 409 EMAIL_ALREADY_EXISTS in other modules.
    - Mandatory Fields: nome, email, senha ([auth.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/auth.types.ts))
    - Refs: [auth.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.routes.ts), [auth.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.controller.ts), [auth.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.service.ts)
  - Route: /api/v1/auth/logar
    - Method: POST
    - Success Body (200): { status: "success", message, data: { token }, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED (credenciais inválidas), 403 FORBIDDEN (conta não confirmada), 410 TOKEN_EXPIRED (reenvio de verificação), 429 RATE_LIMIT_EXCEEDED (limitadorLogin), 400 FIELD_VALIDATION, 415 INVALID_CONTENT_TYPE, 400 INVALID_JSON_FORMAT / EMPTY_PAYLOAD
    - Mandatory Fields: email, senha ([auth.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/auth.types.ts))
    - Refs: [auth.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.routes.ts), [auth.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.controller.ts), [auth.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.service.ts)
  - Route: /api/v1/auth/confirmar
    - Method: GET
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 400 BAD_REQUEST (token inválido), 410 TOKEN_EXPIRED (expirado)
    - Mandatory Fields: token (query, 64 chars)
    - Refs: [auth.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.controller.ts)
  - Route: /api/v1/auth/solicitar-recuperacao
    - Method: POST
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 400 FIELD_VALIDATION, 429 RATE_LIMIT_EXCEEDED, 415 INVALID_CONTENT_TYPE, 400 INVALID_JSON_FORMAT / EMPTY_PAYLOAD
    - Mandatory Fields: email
    - Refs: [auth.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.routes.ts), [recuperacao.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/recuperacao.service.ts)
  - Route: /api/v1/auth/redefinir-senha
    - Method: POST
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 400 TOKEN_INVALID, 410 TOKEN_EXPIRED, 400 FIELD_VALIDATION, 415 INVALID_CONTENT_TYPE, 400 INVALID_JSON_FORMAT / EMPTY_PAYLOAD
    - Mandatory Fields: token, novaSenha (+ confirmar)
    - Refs: [auth.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.routes.ts), [recuperacao.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/recuperacao.service.ts)
  - Route: /api/v1/auth/logout-all
    - Method: POST (JWT)
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED / TOKEN_EXPIRED / TOKEN_INVALID
    - Mandatory Fields: Authorization: Bearer <jwt>
    - Refs: [auth.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.routes.ts), [auth.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.controller.ts)

- Perfil
  - Route: /api/v1/perfil/me
    - Method: GET (JWT)
    - Success Body (200): { status: "success", message, data: Perfil, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED, 404 RESOURCE_NOT_FOUND
    - Mandatory Fields: Authorization header
    - Refs: [perfil.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.routes.ts), [perfil.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.controller.ts), [perfil.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.service.ts)
  - Route: /api/v1/perfil/me
    - Method: PATCH (JWT)
    - Success Body (200): { status: "success", message, data: PerfilAtualizado, meta: null }
    - Error Reactions: 400 FIELD_VALIDATION, 401 UNAUTHENTICATED
    - Mandatory Fields: nome? (2–100), Authorization header
    - Refs: [perfil.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.routes.ts), [perfil.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.controller.ts), [perfil.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/perfil.types.ts)
  - Route: /api/v1/perfil/seguranca/senha
    - Method: PATCH (JWT)
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 400 FIELD_VALIDATION, 401 UNAUTHENTICATED (senhaAntiga incorreta), 400 BAD_REQUEST (políticas)
    - Mandatory Fields: senhaAntiga, novaSenha, confirmarNovaSenha
    - Refs: [perfil.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.routes.ts), [seguranca.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/seguranca.service.ts)
  - Route: /api/v1/perfil/seguranca/conta
    - Method: DELETE (JWT)
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED, 400 BAD_REQUEST (senha incorreta), 404 RESOURCE_NOT_FOUND
    - Mandatory Fields: senhaAtual
    - Refs: [perfil.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.routes.ts), [seguranca.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/seguranca.service.ts)

- Posts
  - Route: /api/v1/posts
    - Method: GET (JWT opcional)
    - Success Body (200): { status: "success", message, data: Post[], meta: { total, page, limit, totalPages } }
    - Error Reactions: 400 FIELD_VALIDATION (query), DX shielding
    - Mandatory Fields: page?, limit?, categoria? (query)
    - Refs: [posts.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.routes.ts), [posts.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.controller.ts)
  - Route: /api/v1/posts
    - Method: POST (JWT)
    - Success Body (201): { status: "success", message, data: Post, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED, 400 FIELD_VALIDATION, 404 RESOURCE_NOT_FOUND (categorias), DX shielding
    - Mandatory Fields: titulo, conteudo, categoriasIds:number[] (1–5)
    - Refs: [posts.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.routes.ts), [posts.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.controller.ts), [post.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/post.types.ts)
  - Route: /api/v1/posts/:id
    - Method: DELETE (JWT)
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED, 400 BAD_REQUEST (id), 404 RESOURCE_NOT_FOUND
    - Mandatory Fields: id (params)
    - Refs: [posts.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.routes.ts), [posts.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.controller.ts)

- Categorias
  - Route: /api/v1/categorias
    - Method: GET
    - Success Body (200): { status: "success", message, data: Categoria[], meta? }
    - Error Reactions: — (pública), DX shielding
    - Mandatory Fields: —
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts)
  - Route: /api/v1/categorias
    - Method: POST (JWT)
    - Success Body (201): { status: "success", message, data: Categoria, meta? }
    - Error Reactions: 401 UNAUTHENTICATED, 400 FIELD_VALIDATION, 409 EMAIL_ALREADY_EXISTS (nome duplicado)
    - Mandatory Fields: nome
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts), [categorias.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.service.ts)
  - Route: /api/v1/categorias/:id
    - Method: PATCH (JWT)
    - Success Body (200): { status: "success", message, data: Categoria, meta? }
    - Error Reactions: 401 UNAUTHENTICATED, 400 BAD_REQUEST (id inválido/nome reservado), 404 RESOURCE_NOT_FOUND, 409 EMAIL_ALREADY_EXISTS (duplicado)
    - Mandatory Fields: id (params), nome
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts), [categorias.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.service.ts)
  - Route: /api/v1/categorias/:id
    - Method: DELETE (JWT)
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED, 400 BAD_REQUEST (id), 409 EMAIL_ALREADY_EXISTS (vínculos), 404 RESOURCE_NOT_FOUND
    - Mandatory Fields: id (params)
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts), [categorias.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.service.ts)
  - Route: /api/v1/categorias/interesses
    - Method: GET (JWT)
    - Success Body (200): { status: "success", message, data: Interesse[], meta? }
    - Error Reactions: 401 UNAUTHENTICATED
    - Mandatory Fields: Authorization header
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts)
  - Route: /api/v1/categorias/:id/interesse
    - Method: POST (JWT)
    - Success Body (201): { status: "success", message, data?, meta? }
    - Error Reactions: 401 UNAUTHENTICATED, 404 RESOURCE_NOT_FOUND (categoria), 400 FIELD_VALIDATION (params)
    - Mandatory Fields: id (params)
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts)
  - Route: /api/v1/categorias/:id/interesse
    - Method: DELETE (JWT)
    - Success Body (200): { status: "success", message, data: null, meta: null }
    - Error Reactions: 401 UNAUTHENTICATED, 400 FIELD_VALIDATION (params)
    - Mandatory Fields: id (params)
    - Refs: [categorias.routes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.routes.ts), [categorias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/categorias/categorias.controller.ts)

---

## GLOBAL ERROR ENVELOPE (IMMUTABLE CONTRACT)

- Standard Envelope:
  - { timestamp, status, error, errorCode, message, path, requestId }
  - Source: [errorHandler.middleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/errorHandler.middleware.ts)
- Zod Validation (400 FIELD_VALIDATION):
  - Adds details: Array<{ field, rule, expected?, received? }>
  - rule mapping: type, min_length/max_length, min/max (array/number), refine, or original code
  - received extracted from req.body or req.query safely
- JWT and Prisma mappings:
  - Prisma P2002 → 409 EMAIL_ALREADY_EXISTS
  - Prisma P2025 → 404 RESOURCE_NOT_FOUND
  - JsonWebTokenError → 401 UNAUTHENTICATED
  - TokenExpiredError → 401 TOKEN_EXPIRED
- DX Shielding:
  - INVALID_JSON_FORMAT (400) — JSON SyntaxError
  - EMPTY_PAYLOAD (400) — empty body detected
  - INVALID_CONTENT_TYPE (415) — unsupported content type/charset

---

## Cross-Layer Verification

- Token Path Parity:
  - Frontend reads token from data.data.token (fallback data.token)
  - Source: [auth.service.ts](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/services/auth.service.ts)
- SweetAlert2 Decisions:
  - Registration: 202 → Gmail prompt; 400/409 → “Fazer Login/Recuperar Senha”
  - Logic keyed by HTTP status; errorCode is carried but not inspected in Login.tsx
  - Sources: [Login.tsx](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/features/auth/Login.tsx), [auth.service.ts](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/services/auth.service.ts)

---

## Stage 4 — Global Impact Map

Backend → Frontend (schema.prisma changes likely to impact):
- Users/Profiles fields → frontend services reading/me types and profile views.
- Posts/Categories relations → posts service and views (list, create).
- Auth token semantics (token_version) → authContext/session management unaffected unless token structure changes client-visible shape.

Core Functions (Coupling):
| Function | No. of Imports | Dependent Files (Nominal List) | Risk Level |
| :--- | :--- | :--- | :--- |
| prisma.client.ts | 12 | c:\Users\Guilherme\Documents\teste0\backend\src\shared\agendador\limpezaContas.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\categorias\categorias.service.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\auth\auth.service.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\perfil\seguranca.service.ts; c:\Users\Guilherme\Documents\teste0\backend\prisma\seed.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\posts\posts.service.ts; c:\Users\Guilherme\Documents\teste0\backend\src\shared\middlewares\authMiddleware.ts; c:\Users\Guilherme\Documents\teste0\backend\src\shared\middlewares\optionalAuthMiddleware.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\health\health.controller.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\perfil\perfil.service.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\auth\recuperacao.service.ts; c:\Users\Guilherme\Documents\teste0\backend\src\features\interesses\interesses.service.ts | Critical |

Impact of token_version changes:
- Definition: [schema.prisma](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/schema.prisma)
- Token payload: [auth.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/auth.types.ts)
- Issuance/LogoutAll: [auth.service.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.service.ts)
- Middleware verification: [authMiddleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/authMiddleware.ts), [optionalAuthMiddleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/optionalAuthMiddleware.ts)
- Any semantic change requires synchronized updates to TokenPayloadSchema, issuance, and verification logic.

---

## Database Integrity Matrix

Analyzed individually per migration (Prisma MySQL):

- 20251206144217_teste0 — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251206144217_teste0/migration.sql)
  - Structural change: Creates Perfis and Usuarios tables; unique constraints on nome (Perfis) and email/perfil_id (Usuarios); adds FK Usuarios.perfil_id → Perfis.perfil_id (RESTRICT on delete).
  - Security impact: Unique email prevents duplicate account collisions. RESTRICT initially prevents orphaned users on profile delete.
  - Referential integrity: Introduces 1–1 Usuarios ↔ Perfis via unique perfil_id.
  - Cascade rule impact: Initial RESTRICT later revised to CASCADE in 20251208104943; see below.
  - Risk if reverted: Rolling back would drop base auth entities and remove uniqueness guarantees.

- 20251212113051_create_posts_table — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251212113051_create_posts_table/migration.sql)
  - Structural change: Creates Posts (post_id, titulo, conteudo, data_criacao, autor_id).
  - Security impact: No direct; enables content layer tied to Perfis.
  - Referential integrity: FK Posts.autor_id → Perfis.perfil_id with ON DELETE SET NULL.
  - Cascade rule impact: Deleting a perfil nulls autor_id preserving posts.
  - Risk if reverted: Content features break; foreign key-dependent services fail.

- 20251213001919_add_categories_and_interests — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251213001919_add_categories_and_interests/migration.sql)
  - Structural change: Creates Categorias, Interesses (join Perfil–Categoria), PostsCategorias (join Post–Categoria).
  - Security impact: Enables controlled category taxonomy; composite PKs reduce duplicates.
  - Referential integrity: FKs with ON DELETE CASCADE for Interesses and PostsCategorias enforce cleanup on parent deletes.
  - Cascade rule impact: Removing categorias/perfis cascades to interests and post-categories links.
  - Risk if reverted: Stale relations remain; features relying on categories break.

- 20251207012715_adicionar_campos_auth_verificacao_expiracao — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251207012715_adicionar_campos_auth_verificacao_expiracao/migration.sql)
  - Structural change: Adds cadastro_confirmado, expiracao_pendente, expiracao_token_recuperacao, token_recuperacao, token_verificacao to Usuarios; index on token_verificacao.
  - Security impact: Enables email verification and password recovery flows with expirations; improves account control.
  - Referential integrity: N/A (intra-table fields).
  - Cascade rule impact: None.
  - Risk if reverted: Breaks verification/recovery logic; raises auth bypass risk.

- 20251208104943_adicionar_ondelete_cascade — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251208104943_adicionar_ondelete_cascade/migration.sql)
  - Structural change: Drops previous FK and re-adds Usuarios.perfil_id → Perfis.perfil_id with ON DELETE CASCADE, ON UPDATE CASCADE.
  - Security impact: Ensures user rows are removed when profile is deleted, preventing orphaned credentials.
  - Referential integrity: Tightens coupling with cascade.
  - Cascade rule impact: Profile deletion cascades to Usuarios.
  - Risk if reverted: Orphaned Usuarios possible; integrity drift.

- 20251222220210_ajuste_anonimizacao_final — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251222220210_ajuste_anonimizacao_final/migration.sql)
  - Structural change: Tightens column lengths (Categorias.nome 50, Perfis.nome 100, Usuarios.email 150, tokens 100), renames posts-categorias table to posts_categorias, adds indices (usuarios_email_idx), and normalizes index names.
  - Security impact: Shorter token fields reduce storage exposure; email index improves auth performance.
  - Referential integrity: Re-asserts FKs with CASCADE for usuarios.perfil_id, interesses, posts_categorias; Posts.autor_id remains ON DELETE SET NULL.
  - Cascade rule impact: Consistent cascades across many-to-many structures; posts preserve via SET NULL author then content reassignments managed in service layer.
  - Risk if reverted: Index loss; token/email field mismatches; broken relations due to table name changes.

- 20251223230147_adicionar_campo_is_admin — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20251223230147_adicionar_campo_is_admin/migration.sql)
  - Structural change: Adds is_admin (default false) to Usuarios; unique index and index on token_recuperacao.
  - Security impact: Explicit admin flag supports access control; unique recovery token improves token management.
  - Referential integrity: N/A.
  - Cascade rule impact: None.
  - Risk if reverted: Admin paths break; recovery flows risk duplicates.

- 20260116222946_adicionar_token_version — [migration.sql](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/migrations/20260116222946_adicionar_token_version/migration.sql)
  - Structural change: Adds token_version with default 0 to Usuarios.
  - Security impact: Enables session revocation and global logout.
  - Referential integrity: N/A.
  - Cascade rule impact: None.
  - Risk if reverted: Token revocation stops working; stale sessions remain valid.

Comparison vs Current schema.prisma:
- Table/field names and FKs align with the latest schema: lowercased mapped tables, posts_categorias name, CASCADE on usuarios.perfil_id, interests and posts_categorias cascades, Posts.autor_id SET NULL.
- Field lengths match: Usuarios.email 150, password_hash 255, tokens 100; Perfis.nome 100; Categorias.nome 50.

Extracted performance constraints (database-related):
- Indexed columns: usuarios.email, usuarios.token_verificacao, usuarios.token_recuperacao.
- Composite PKs: interesses (perfil_id, categoria_id), posts_categorias (post_id, categoria_id).
- Cascade paths: Perfis → Usuarios (CASCADE), Perfis/Categorias → Interesses (CASCADE), Posts/Categorias → PostsCategorias (CASCADE), Posts.autor_id → Perfis (SET NULL).

---

## Middleware Stack Order Map

Extracted from [server.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/server.ts#L1-L119):

- Global order (actual):
  - requestId → helmet (HSTS configurado) → cors → express.json(100kb) → jsonDepthMiddleware(7) → enforceSecurity → routes → 404 → errorHandler
- Route-level insertion points:
  - auth.routes: limitadorAcoesAuth/login limiter → validate(Zod) → controller
  - perfil.routes: authMiddleware → validate (per route) → controller
  - categorias.routes: authMiddleware (and adminMiddleware on admin-only endpoints if applied at controller) → validate → controller
- Notes on rate limiters:
  - limitadorRegistro: 20 req/15min
  - limitadorLogin: 15 req/5min
  - limitadorEngajamento: 10 req/min
  - limitadorLeitura: 200 req/min
  - limitadorSaude: 30 req/min
- Additional constraints:
  - trust proxy enabled for correct client IP
  - HTTPS enforcement and Host allow-list active in production

---

## Logger Masking Contract

Source: [logger.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/utils/logger.ts)

- Fields whitelisted (examples): id, uuid, requestId, correlationId, createdAt/updatedAt, status, code, errorCode, level, message, path, method, counts, evento, operacao, metrics.
- Fields masked: any non-whitelisted key; explicit filter excludes authorization, token, senha, password, headers before masking.
- Masking strategy: Non-whitelisted primitives → “[MASKED]”; objects/arrays recursively processed; errors reduced to name/message (+stack in non-production).
- Circular reference behavior: Replaced by “[CIRCULAR]”.
- Output format: JSON lines with timestamp, level, message, optional requestId and masked context.

---

## Service Email Contract

Source: [serviceEmail.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/utils/serviceEmail.ts)

- SMTP provider behavior:
  - Config via EMAIL_HOST/PORT/SECURE/USER/PASS; optional DKIM; TLS rejectUnauthorized in production.
  - Mock mode when SMTP not configured: logs EMAIL_MOCK_SENT and returns.
- Timeout behavior: connectionTimeout/greetingTimeout/socketTimeout = 10s each.
- Retry policy: up to 3 attempts; backoff 1s, 2s, 3s; logical errors (4xx or invalid recipient) fail fast.
- Error fallback: Throws 503 EMAIL_SERVICE_UNAVAILABLE with AppError on persistent failures; logs verification failures.
- Health check integration: diagnosticarSMTP() retorna status instantâneo de cache (UP/DOWN) e DISABLED quando não configurado; monitoramento em background revalida a cada 30s via iniciarMonitoramentoSMTP(); usado em [health.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/health/health.controller.ts#L30-L75).
- Impact if SMTP is down: Registration confirmation and password recovery endpoints return 503 on send; health shows DEGRADED if only email is DOWN.

---

## Seed Bootstrap Matrix

Source: [seed.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/prisma/seed.ts)

- Default users:
  - Admin: senior@teste.com / Senha123 (cadastro_confirmado: true, is_admin: true)
  - Common: comum@teste.com / Senha123 (confirmado: true, is_admin: false)
  - System anonymization user: excluido@system.local (confirmado: true)
  - Temporary “ghost” user for scheduler test: fantasma@teste.com (cadastro_confirmado: false, expiracao_pendente in the past)
- Categories initial state: “Geral”, “Tecnologia”, “Dicas”.
- Posts initial: “Boas-vindas à Comunidade” by Dev Sênior with categories Geral/Tecnologia.
- Interests initial: Dev Sênior follows Tecnologia.
- Test environment dependency: Prints admin and user credentials in non-production; hashing via gerarHashSenha('Senha123').
- Impact if removed:
  - Demo/admin credentials unavailable; some flows still function (services create anonymization user on demand), but tests and manual QA lose baseline.
  - Cron cleanup still runs but may find fewer targets.

---

## Immutable Data Contracts

Exact success JSON (from controllers):

- Login — [auth.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.controller.ts#L27-L39)
  - Status: 200
  - Body:
    - { "status": "success", "message": "Login realizado com sucesso.", "data": { "token": "<jwt>" }, "meta": null }

- Register — [auth.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/auth/auth.controller.ts#L17-L25)
  - Status: 202
  - Body:
    - { "status": "success", "message": "Recebemos sua solicitação. Se os dados informados forem válidos e a conta ainda não estiver ativa, um link de confirmação será enviado em instantes. Caso não receba, verifique sua caixa de spam ou tente realizar o processo novamente garantindo que o e-mail foi digitado corretamente.", "meta": null }

- Profile update — [perfil.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/perfil/perfil.controller.ts#L31-L47)
  - Status: 200
  - Body:
    - { "status": "success", "message": "Perfil atualizado com sucesso.", "data": { perfil_id, nome, score_karma, reading_points, data_criacao }, "meta": null }

- Post vote — [posts.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.controller.ts)
  - Status: 200
  - Body:
    - { "status": "success", "message": "Voto registrado.", "data": Post, "meta": null }

- Post comment — [posts.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/posts/posts.controller.ts)
  - Status: 201
  - Body:
    - { "status": "success", "message": "Comentário publicado.", "data": Post, "meta": null }

- Denúncia — [denuncias.controller.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/features/denuncias/denuncias.controller.ts)
  - Status: 201
  - Body:
    - { "status": "success", "message": "Denúncia registrado com sucesso.", "data": Denuncia, "meta": null }

Exact error JSON structure (from error handler):

- Generic (non-Zod) — [errorHandler](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/errorHandler.middleware.ts#L1-L232)
  - { "timestamp": "<iso>", "status": <httpStatus>, "error": "<reason>", "errorCode": "<ErrorCodes>", "message": "<localized message>", "path": "<url>", "requestId": "<uuid>" }
- Zod validation (400 FIELD_VALIDATION):
  - Adds "details": [ { "field": "path", "rule": "type|min|max|min_length|max_length|refine|...", "expected": <any?>, "received": <any?> } ]

Required/Optional fields by route (Zod schemas):
- Register body: { nome: string (2–100), email: email, senha: string (≥8, 1 uppercase, 1 digit) } — strict; no extras.
- Login body: { email: email, senha: string } — strict; no extras.
- Perfil PATCH body: { nome?: string } via UpdatePerfilSchema — strict; no extras.
- Post vote body: { tipo: 'UP' | 'DOWN' } via PostVoteSchema — strict; no extras.
- Post comment body: { texto: string (1–1000) } via PostCommentSchema — strict; no extras.
- Denúncia body: union — { denuncia_tipo: number(int, >0), descricao?: string ≤500 } OR { motivo: string (3–500) } via DenunciaCreateSchema — strict; no extras. Params: { postId: number (>0) }.

Contract differences across routes:
- Success body commonly includes { status: "success", message, data? }. Frontend services read token from data.token for login; for register they use HTTP status and message only.

---

## Frontend ↔ Backend Type Parity Table

Scope: backend/src/shared/types/* vs frontend/src/shared/types/*

- ErrorCodes — parity 1:1
  - Backend: [ErrorCodes.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/errors/ErrorCodes.ts)
  - Frontend: [errors.ts](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/types/errors.ts)
  - Status: Match for all listed codes.
  - Risk if changed: Any rename/removal breaks typed error handling and UX flows.

- Auth Request/Response
  - Backend schemas: [auth.types.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/types/auth.types.ts)
  - Frontend types: [auth.types.ts](file:///c:/Users/Guilherme/Documents/teste0/frontend/src/shared/types/auth.types.ts)
  - Status: Request payloads align (RegisterPayload/LoginCredentials). Success login response modeled as { token } on FE; BE returns { status, message, data: { token } }. FE service extracts data.token; OK.
  - Risk if changed: Altering BE success envelope or moving token out of data breaks FE parsing unless updated.

- Other backend types (perfil.types.ts, categoria.types.ts, post.types.ts, interesses.types.ts, error.types.ts, utils.types.ts)
  - Frontend equivalents: Not explicitly modeled.
  - Risk if changed: Route response shapes impact FE services/components expecting certain fields; add/update FE types as features surface.

Extracted performance constraints (cross-layer):
- JWT expiration: 7d ([jwtUtils.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/utils/jwtUtils.ts#L1-L34))
- Hashing cost: bcrypt SALT_ROUNDS = 10 ([hashing.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/utils/hashing.ts#L1-L21))
- Body size: express.json limit 100kb ([server.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/server.ts#L60-L77))
- JSON depth: maxDepth = 7 ([jsonDepth.middleware.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/jsonDepth.middleware.ts#L34-L60))
- Rate limits: registro(20/15min), login(15/5min), engajamento(10/min), leitura(200/min), saúde(30/min) ([rateLimiter.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/shared/middlewares/rateLimiter.ts#L34-L79))
- Scheduler: hourly cron '0 * * * *' ([server.ts](file:///c:/Users/Guilherme/Documents/teste0/backend/src/server.ts#L99-L118))

---

## Global Concordance Rule (Obligatory)

STRICT MODE — Any change to one of the items below REQUIRES:
- Database schema (schema.prisma, migrations)
- DTOs / Zod Schemas (shared/types)
- API Returns (controller envelopes)
- JWT payload (TokenPayloadSchema)
- ErrorCodes dictionary
- Middleware signatures (auth/optionalAuth/admin/validate/rateLimiter/depthLimiter/errorHandler/requestId)

Process:
- Perform global search.
- List impacted files (backend + frontend).
- List impacted tests.
- List impacted frontend services.
- Request explicit confirmation before mutation.
- Partial modification is forbidden.

---

## Anti-Omission Checklist (Final Validation)

- [x] All test files analyzed (Mega-stress, DX, Health).
- [x] Real performance constraints extracted (limits, timeouts, schedules).
- [x] All migrations individually analyzed with cascade rules.
- [x] schema.prisma compared against migrations.
- [x] Full middleware stack mapped (including requestId and admin).
- [x] Logger masking rules audited (whitelist/blacklist/circular).
- [x] serviceEmail behavior audited (timeouts/retry/health).
- [x] seed.ts bootstrap audited.
- [x] OWASP Defense Matrix built.
- [x] Database Integrity Matrix built.
- [x] Backend forensic flow mapped.
- [x] Frontend integration mapped.
- [x] Cross-layer type parity table built.
- [x] Hidden dependency graph mapped.
- [x] Impact Matrix built.
- [x] Consolidated PROJECT_MEMORY.md generated.
- [x] ZERO new code created.
- [x] ZERO folders ignored.

If any item becomes unconfirmed in future changes → INVALID REPORT. Proceed with surgical precision.

---
## Sistema de Gamificação (RPG Acadêmico)
- **Motor de Progresso:** O `XP` é a métrica mestre. `Level` é derivado do XP total acumulado.
- **Patentes Acadêmicas:** Calculadas dinamicamente via Backend (1-10: Calouro, 11-20: Explorador, etc.). Não são salvas no banco para permitir atualizações globais de nomenclatura.
- **Títulos vs Medalhas:** Medalhas foram descartadas em favor de Títulos. Títulos são conquistas baseadas em contagem de eventos (ex: 50 posts lidos).
- **Título Ativo:** O usuário pode colecionar vários títulos, mas apenas um fica "equipado" (`titulo_ativo`).
- **Escalabilidade:** O sistema utiliza o `LogAtividade` para auditar progressão. Novos módulos (ex: Livros) devem apenas registrar novos tipos de eventos de log para integrar-se ao XP e aos Títulos.

## Dashboard (MVP)

- Rota: /dashboard via react-router-dom v6
- Layout raiz: min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] grid grid-cols-1 md:grid-cols-[250px,1fr,300px] gap-6 p-6
- Colunas:
  - Sidebar (bg-[var(--bg-card)]): links, botão Escrever (var(--color-if-green)), rótulo Admin condicional
  - Feed (cards com backdrop-blur-sm): header @nome_user, título, resumo, ações Votar/Comentar/Denunciar (usa alertaDecisao)
  - Gamificação (bg-[var(--bg-card)]): barras para score_karma e reading_points
- Dados: perfil/me para nome_user, score_karma, reading_points; feed com fallback local quando indisponível

ProtectedRoute (v6)
- Componente: shared/utils/ProtectedRoute.tsx
- Comportamento:
  - loading (AuthContext) → mostra feedback visual
  - autenticado=false → <Navigate to="/login" replace />
  - autenticado=true → <Outlet />
- App.tsx: /dashboard envolvido por ProtectedRoute; formulário de Login não faz navegação direta

🏗️ ARCHITECTURAL CHANGE RULE (STRICT MODE)

If any of the following changes: Prisma schemas, DTO structures (Zod), API returns (controller envelopes), or JWT payloads:
- Perform Global Search: Identify all impacted files and references (backend and frontend).
- Produce Impact Lists: All affected code files, tests, and frontend services.
- Update PROJECT_MEMORY.md: Synchronize design, contracts, and matrices with the new state.
- Update CHANGELOG_AI.md: Log the Why, When, and What of the structural change.
- Validate Cross-Layer Parity: Ensure Frontend Types map 1:1 to Backend DTOs.
- Verify Security Matrix: Ensure no change bypasses Stage 1 protections.
- Require Explicit Human Confirmation before any mutation. Partial modifications are forbidden.

```
