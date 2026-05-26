//backend/CHANGELOG_AI.md
# CHANGELOG_AI

## [2026-04-23] — Busca Unificada Consumida no Frontend

### Adicionado
- **Navegação por Tipo:** Implementado seletor de Tabs (Tudo, Artigos, Obras) na página de Explorar para filtragem rápida.
- **Identidade Visual Unificada:** `CardTrabalho.tsx` agora exibe badges coloridas diferenciando Artigos (Verde) de Obras Literárias (Azul).
- **Contexto de Autor:** Adicionada exibição do curso do autor ao lado do nome nos resultados de busca.
- **Thumbnail de Obras:** Resultados do tipo Obra agora exibem uma prévia da imagem de capa lateralmente.

### Alterado
- **Service de Busca:** `pesquisarTrabalhos` atualizado para enviar os parâmetros `tipo` e `termo` corretamente ao backend.
- **Filtros Avançados:** `FiltrosTopo.tsx` refatorado para incluir as novas opções de status unificadas e integração com as Tabs de tipo.
- **Truncamento de Texto:** Resumos de conteúdo e descrições agora são truncados para garantir a integridade do layout do card.

### Técnica
- **Integridade de Build:** Build do Frontend validado com **0 erros** (`npm run build`).

## [2026-04-23] — Refatoração de Status e Herança de Metadados

### Corrigido
- **Falha na Criação de Capítulos:** Resolvido o erro que impedia a criação de capítulos vinculados a obras devido à exigência de campos que devem ser herdados (idioma/categorias).
- **Lógica de Herança:** O sistema agora herda automaticamente o `idioma`, `status` e `categorias` da `Obra` pai ao criar um capítulo, eliminando a necessidade de envio manual pelo frontend.

### Alterado
- **Schema de Criação (Backend):** Flexibilizado o `PostCreateSchema` para tornar `idioma` e `status` opcionais quando `obra_id` estiver presente, mantendo a obrigatoriedade para posts independentes via `.refine()`.
- **UI de Escrita (Frontend):** Removido o seletor de "Status" da página `EscreverPost.tsx`. O status agora é gerido exclusivamente no nível da `Obra`.

### Técnica
- **Integridade de Build:** Build do Backend validado com **0 erros** (`npm run build`).
- **Integridade de Build Frontend:** Build do Frontend validado com **0 erros** após flexibilização dos tipos de criação de posts.
- **Depuração de Busca:** Adicionados logs de diagnóstico em `ExplorarPage.tsx` e `post.service.ts` para rastrear o fluxo de requisições de busca.
- **Otimização de URL:** Refatorado o `useEffect` de filtros na `ExplorarPage.tsx` para evitar loops de renderização ao atualizar os query params.
- **Correção de Contrato API:** Padronizado o mapeamento de resultados de busca no backend para paridade total com o Zod no frontend, resolvendo o erro de "Contrato da API inválido".
- **Correção de Resposta Global:** Adicionado o campo `message` à resposta da busca unificada para atender aos requisitos de integridade do `apiClient`.
- **Correção de Rotas:** Ajustada a validação de parâmetros de busca no backend para ler da `query` em vez do `body` em rotas GET.

## [2026-04-23] — Motor de Busca Unificada e Persistência de Metadados

### Adicionado
- **Busca Unificada:** Implementado o método `pesquisarUnificado` no `posts.service.ts` para realizar buscas simultâneas em `Posts` e `Obras`.
- **Endpoint de Pesquisa:** Criada a rota `GET /api/v1/posts/pesquisa` para centralizar a busca global do sistema.
- **Normalização de Resultados:** Interface comum de resposta para busca que inclui `id`, `titulo`, `resumo`, `tipo`, `autor`, `curso` e `data_criacao`.

### Alterado
- **Persistência de Idioma:** `posts.service.ts` e `obras.service.ts` agora persistem o campo `idioma` no banco de dados.
- **Persistência de Status:** `obras.service.ts` agora persiste o campo `status` recebido do frontend.
- **Schemas de Backend:** Atualizados `PostCreateSchema` e `ObraCreateSchema` para tornar o campo `idioma` obrigatório e validar o `status`.

### Técnica
- **Integridade de Build:** Build do Backend finalizado com **0 erros** (`npm run build`).

## [2026-04-23] — Paridade de Esquema e Formulários (Obras e Posts)

### Adicionado
- **Esquema Obras:** Adicionados campos `idioma` (String) e `status` (PostStatus) ao modelo `Obras` no Prisma.
- **Formulários Frontend:** Implementados seletores de `Idioma` e `Status` nas páginas `CriarObra.tsx` e `EscreverPost.tsx`.
- **Validação de Formulário:** Adicionada validação obrigatória para o campo `Idioma` com feedback via toast.
- **Paridade de Dados:** Garantida a paridade entre `Posts` e `Obras` em toda a stack para suportar filtros unificados na busca (Explorar).

### Alterado
- **Tipagens Frontend:** Atualizados `ObraCreateSchema` e `PostCreateBodySchema` para incluir `idioma` e `status` como campos obrigatórios.
- **Seed do Banco:** Atualizada a criação de registros iniciais de `Obras` no `seed.ts` para incluir valores de exemplo para `idioma` e `status`.

### Técnica
- **Migração de Dados:** Executada a migração `add_idioma_e_status_nas_obras` para sincronizar o banco de dados.

## [2026-03-30] — Identidade Visual Dinâmica no Header

### Alterado
- **Header.tsx:** Implementada estilização condicional para a Logo (BookOpen) e o Nome (PAPIRUS). Quando o usuário está em rotas de autenticação (`/entrada`), os elementos aparecem em branco puro para melhor contraste. Em outras rotas, seguem as cores institucionais do tema.

### Técnica
- **Integridade de Build:** Build do Frontend finalizado com **0 erros**.

## [2026-03-30] — Padronização de Navegação e Header Global

### Adicionado
- **Header Unificado:** Implementado o componente `Header` global em todas as páginas do sistema, substituindo cabeçalhos locais e garantindo acesso à busca e perfil em todo o fluxo do usuário.
- **Actions Contextuais:** Integrados botões específicos (ex: "Criar Nova Obra") na prop `actions` do `Header`.

### Alterado
- **MinhasObrasPage:** Refatorada para usar o `Header` com título "Minha Biblioteca".
- **CriarObra:** Migrada para o `Header` global, removendo o botão de voltar manual.
- **ObraDetalhesPage:** Integrado o `Header` ao topo da página, mantendo o efeito visual do Hero.
- **EscritaCapitulo:** Implementado o `Header` com contexto dinâmico da obra em edição.
- **Login & Redefinir:** Padronizadas com a identidade visual do `Header` (Logo Papirus), mantendo o foco nos formulários de autenticação.

### Técnica
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] — Fix Navegação e Otimização de Leitura

### Corrigido
- **Navegação entre Capítulos:** Corrigida falha no `PostDetalhesPage.tsx` onde o conteúdo não atualizava ao clicar em "Anterior/Próximo" devido a um bloqueio incorreto no `useEffect`.
- **Deduplicação de Visualizações (v2):** Refatorada a lógica de `useRef` para `lastFetchedId` para garantir que o incremento de view e o fetch ocorram apenas uma vez por ID, permitindo navegação fluida entre posts diferentes.

### Adicionado
- **Traceability de Navegação:** Adicionados logs de debug no `posts.service.ts` para rastrear o cálculo de IDs de capítulos vizinhos.

## [2026-03-30] — Correção de Lógica e Polimento de Leitura

### Adicionado
- **Trava de Engajamento:** Implementado estado de `isUpdating` no `FeedbackBox.tsx` para desabilitar cliques e mostrar feedback visual (opacidade/grayscale) durante o processamento de reações.
- **Resiliência de Layout:** Adicionada classe `break-words` e `overflow-wrap-anywhere` no corpo do texto literário para prevenir quebra de layout com palavras longas ou links.

### Alterado
- **Deduplicação de Visualizações:** Corrigido problema de contagem dupla de views no Frontend usando `useRef` para garantir incremento único mesmo em `React.StrictMode`.
- **Sincronização de Comentários:** Atualizada a lógica do `comentarios.service.ts` para suportar o campo `is_spoiler` e adicionados logs de debug para rastrear o fluxo de criação.
- **Robustez de Contrato:** Atualizado `PostCommentSchema` no backend para aceitar `is_spoiler` e permitir `parent_id` nulo explicitamente.

### Técnica
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**. (Backend confirmado após nova execução).

## [2026-03-30] — Efeito "Folha de Papel" e Padronização de Navegação

### Adicionado
- **Efeito "Folha de Papel":** Refatorada a `PostDetalhesPage.tsx` para envolver o conteúdo literário em um container `max-w-4xl` com sombra profunda (`shadow-2xl`) e fundo contrastante, simulando uma folha de papel para foco total.
- **Header Dinâmico:** Implementada prop `hideBack` e lógica de posicionamento onde o ícone do Campus fica à esquerda e o botão Voltar à sua direita.

### Alterado
- **Tipografia Imersiva:** Corpo do texto na página de leitura agora utiliza `font-serif` com `leading-[1.8]` e alinhamento justificado para conforto visual.
- **FeedbackBox (Barra Elegante):** Transformado o quadro de reações em uma barra fina e minimalista com ícones menores (`18px`) e labels ultra-compactas, integrada ao rodapé da "folha".
- **Header Sticky:** O Header agora é `sticky top-0` com `backdrop-blur-md` em todas as visualizações, garantindo navegação persistente.

### Técnica
- **Integridade de Build:** Build final do Frontend finalizado com **0 erros**.

## [2026-03-30] — Refinamento Visual e Conectividade de Leitura

### Adicionado
- **Navegação no Feed:** Títulos e breadcrumbs de capítulos no `PostCard.tsx` agora são links diretos para a página de leitura (`/posts/:id`).

### Alterado
- **FeedbackBox (Redimensionamento):** Reduzido o tamanho do quadro de reações para `max-w-xl` e ícones para `24px`, garantindo uma estética mais limpa e menos intrusiva.
- **Identidade Visual (Reações):** Substituídos ícones por versões sólidas da Lucide com tipografia em caixa alta e `tracking-widest` para um ar mais institucional.
- **Navegação de Capítulos:** Botões "Anterior" e "Próximo" na página de leitura foram redimensionados para estilos mais discretos (ghost/solid) e alinhados às margens do texto.
- **Tipografia de Leitura:** Reforçado o uso de fonte Serifada para o corpo do texto em `PostDetalhesPage.tsx`, otimizando a legibilidade para textos longos.

### Técnica
- **Integridade de Build:** Build final do Frontend finalizado com **0 erros**.

## [2026-03-30] — Otimização de Performance e Resiliência (P2028 Fix)

### Adicionado
- **Crash Protection:** Implementado bloco `try/catch` isolado no motor de gamificação para garantir que falhas em ganhar XP/Títulos não interrompam ações principais (ex: criar obra).
- **Debug Hardening:** Habilitada exibição de `error.stack` no terminal e no payload JSON (apenas em desenvolvimento) via `errorHandler.middleware.ts`.

### Alterado
- **Desacoplamento de XP:** Transferido o gatilho de XP da criação de Obra para a criação de Capítulo (Post).
- **Processamento Assíncrono:** A gamificação agora é disparada fora da transação principal de criação de conteúdo, eliminando o erro de Timeout (P2028).
- **Resiliência do Prisma:** Aumentado o timeout de transações interativas para 10 segundos no `prisma.client.ts`.

### Corrigido
- **Null-Safety em Títulos:** Corrigido `INTERNAL_ERROR` ao verificar títulos de mérito onde a busca por títulos existentes poderia retornar nulo ou falhar no mapeamento.

## [2026-03-30] — Experiência de Leitura e Engajamento Social (Webtoon Style)

### Adicionado
- **ObraDetalhesPage:** Nova página de visão geral da obra com layout "Webtoon" (Hero com blur, sidebar de estatísticas e lista de capítulos estilo playlist).
- **PostDetalhesPage:** Página de leitura dedicada com tipografia focada em legibilidade e navegação inteligente entre capítulos (Anterior/Próximo).
- **Sistema de Reações (FeedbackBox):** Implementados 5 tipos de reações (LIKE, LOVE, FIRE, SAD, BORED) com contadores e toggle.
- **Comentários Avançados:** Suporte a marcação de **Spoiler** (texto borrado até o clique) e respostas aninhadas de 2 níveis.
- **Métricas de Leitura:** Contador de visualizações automático ao abrir um post/capítulo.

### Alterado
- **Enriquecimento de Post:** Endpoint `GET /posts/:id` agora retorna metadados de navegação, contagem de reações agrupada e árvore de comentários.
- **Schema Update:** Adicionado campo `is_spoiler` ao modelo `Comentarios`.

### Técnica
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] - Painel "Minhas Obras" e Fluxo de Capítulos

### Adicionado
- **Minhas Obras:** Nova página de gestão estilo biblioteca para autores.
- **Escrita de Capítulos:** Fluxo dedicado com herança automática de categorias da obra pai.
- **ObrasCategorias:** Modelo pivot no backend para fixar categorias em projetos literários.
- **Breadcrumbs:** Navegação hierárquica no `PostCard` para capítulos de obras.

### Alterado
- **Criação de Posts:** Refatorada para suportar herança de metadados e incremento de ordem sequencial automática.
- **Obras Service:** Suporte a `imagem_capa` e vínculo persistente com categorias.

### Técnica
- **Schema Update:** Adicionada relação pivot `ObrasCategorias` e campo `imagem_capa`.
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] - Direito ao Esquecimento (LGPD) e Anonimização

### Adicionado
- **Pre-flight Check:** Novo endpoint `GET /seguranca/check-exclusao` para validar impedimentos antes de deletar conta.
- **UI de Privacidade:** Modal dinâmico no frontend que exibe avisos contextuais sobre comunidades e status de administrador.

### Alterado
- **Anonimização Atômica:** Refatorada a exclusão de conta para realizar anonimização pública (identidade) mantendo integridade interna (auditoria).
- **Limpeza de Comunidades:** Remoção automática de grupos onde o usuário era o único membro.
- **Segurança de Registro:** Liberação do e-mail real para novos cadastros imediatamente após a anonimização.

### Técnica
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] - Comentários de 2 Níveis e Null-Safety de Autoria

### Adicionado
- **Comentários (Serviço):** Criado `comentarios.service.ts` com suporte a respostas e trava de profundidade (Post -> Comentário -> Resposta).
- **AutorDisplay (Snapshot):** Novo modelo de resposta para posts e comentários que preserva nome e campus mesmo após a exclusão do perfil.
- **Perfil Público Híbrido:** Suporte ao status `is_following` no `GET /perfil/:id` para usuários logados.

### Alterado
- **Endpoints de Post:** Adicionadas rotas de listagem e exclusão de comentários.
- **PostCard (Frontend):** Atualizada a UI para renderizar o autor via `AutorDisplay` e lidar com estados de "Usuário Deletado".
- **Higiene de Tipos:** Sincronizados os tipos de posts e perfis entre frontend e backend.

### Técnica
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] - Diferenciação de Logout Local vs Global

### Adicionado
- **Logout Local:** Nova função `logoutLocal()` no `auth.service.ts` para sair apenas do navegador atual.
- **Feedback de Sessão:** Toasts diferenciados para encerramento de sessão local ("neste navegador") e global ("em todos os dispositivos").

### Alterado
- **Header:** O botão de sair superior agora realiza apenas o logout local, preservando outras sessões.
- **Configurações de Segurança:** O botão "Sair de todos os dispositivos" agora chama o backend para invalidar globalmente via `token_version`.
- **AuthContext:** Refatorada a função `logout` para suportar o parâmetro `global: boolean`.

### Técnica
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] - Sincronização de Endpoints e Higiene Arquitetural (Fase 1 Finalizada)

### Alterado
- **Sincronização de Logout:** Endpoint de logout no frontend atualizado para `/auth/logout-all` (Sincronia total com Backend).
- **Higiene de Segurança:** Endpoint de exclusão de conta padronizado para `DELETE /perfil/seguranca/conta` em ambas as camadas.
- **Robustez de Contratos:** Refatoradas as chamadas de serviço no frontend para usar `z.any()` em retornos de sucesso sem payload fixo, prevenindo erros de parse.

### Técnica
- **Validação de Mass Assignment:** Confirmada a integridade do `validate.middleware.ts` no backend para suporte a schemas `.strict()`.
- **Integridade de Build:** Build final do Frontend e Backend finalizados com **0 erros**.

## [2026-03-30] - Hardening de Identidade e Blindagem de Registro (Backend)

### Adicionado
- **Blindagem de Registro (Segurança):** Forçado manualmente `is_admin: false` no `auth.service.ts` como defesa de segunda camada contra Mass Assignment.

### Alterado
- **Tipagem Global Express:** Refatorado `express.d.ts` para padronizar o acesso à identidade via `req.user` (tipo `AuthUser`), tornando campos obrigatórios e removendo atalhos legados.
- **Middlewares de Identidade:** Atualizados `authMiddleware.ts` e `optionalAuthMiddleware.ts` para injetar o objeto `user` completo.
- **Refatoração de Controllers:** Migrados todos os controllers (Perfil, Auth, Posts, Obras, Denúncias, Categorias) para o novo padrão de acesso `req.user.perfil_id`.

### Técnica
- **Validação de Build:** O projeto backend agora builda com 100% de sucesso (`npm run build` OK), confirmando a remoção de dívidas técnicas de tipagem.

## [2026-03-29] - Gamificação V2: UI & Obras Support (Frontend)

### Adicionado
- **ProgressBarXP (Refatoração):** Implementada a fórmula geométrica do backend no frontend para cálculo de progresso entre níveis.
- **Suporte a Obras no Feed:** `PostCard.tsx` agora exibe badges de "Capítulo" e selos de "Obra Finalizada".
- **Patentes Automáticas:** Função `getPatentePorNivel` para exibir títulos dinâmicos baseados no nível.

### Alterado
- **Sincronia de Gamificação:** Sidebar do Feed e do Perfil agora utilizam o componente `ProgressBarXP` para exibir o progresso real.
- **Tipagem Sincronizada:** Atualizados `perfil.types.ts` e `post.types.ts` com os novos campos de XP por categoria e obras.

### Técnica
- **Validação de Build:** O projeto frontend agora builda com 100% de paridade de tipos com o backend (`npm run build` OK).

## [2026-03-29] - Centralização de Constantes de Unidades (Campus)

### Adicionado
- **Módulo de Unidades (Fullstack):** Criado `unidades.ts` no Backend e Frontend para centralizar a `LISTA_CAMPUS` oficial do IFNMG.
- **Validação Rigorosa (Backend):** Implementado `z.enum` no `RegistrarSchema` para garantir que apenas campi válidos sejam cadastrados.

### Alterado
- **Refatoração do Login:** Removida a declaração local da lista de campi no `Login.tsx` em favor da constante compartilhada.

### Técnica
- **Integridade de Build:** Build do Backend e Frontend validados com sucesso (0 erros).

## [2026-03-29] - Autocomplete de Campus e Sincronia de Cadastro

### Adicionado
- **Seletor de Campus Inteligente:** Implementado autocomplete no cadastro com a lista oficial de campi do IFNMG.
- **Normalização de Data:** Conversão automática de `DD/MM/YYYY` para `YYYY-MM-DD` (ISO) antes do envio ao backend.

### Corrigido
- **Sincronia de Tipos:** Ajustado o payload de registro no `Login.tsx` para garantir paridade com o `RegisterPayloadSchema` do backend.
- **Validação de Campus:** O sistema agora exige que o campus selecionado pertença à lista oficial para habilitar o cadastro.

### Técnica
- **Build do Frontend:** Validada a integridade do código com `npm run build` (0 erros).

## [2026-03-29] - Ajustes Finos: Sequenciamento e Gatilhos de Mérito

### Corrigido
- **Sequenciamento de Capítulos:** Substituído `.count()` por busca do maior valor de `ordem` atual para evitar duplicidade de capítulos se itens intermediários forem excluídos.
- **Gatilho de Títulos:** Implementada lógica de "transição de faixa" no motor de XP para garantir que títulos não sejam pulados em saltos grandes de XP.

### Técnica
- **Validação de Autoria:** Isolada a lógica `isAutor` em `posts.service.ts` com comentário `TODO` para futura co-autoria.
- **Build:** Confirmada integridade do sistema após ajustes finos.

## [2026-03-29] - Módulo de Obras e Capítulos Sequenciais

### Adicionado
- **CRUD de Obras:** Implementação completa de serviços, controllers e rotas para gestão de projetos literários/acadêmicos (`/api/v1/obras`).
- **Sequenciamento de Capítulos:** Lógica automática de incremento de `ordem` para posts vinculados a obras.
- **Novas Regras de XP:** Recompensa de 50 XP para criação de obra (`OBRA_CRIAR`).

### Alterado
- **Integração de Posts:** `criarPost` agora valida a autoria da obra antes de permitir o vínculo de capítulos.
- **Performance de Títulos:** Otimização do motor de verificação de mérito para reduzir carga no banco de dados.
- **Saneamento de Banco:** Correção de erros críticos no `schema.prisma` relacionados a relações e ações referenciais.

### Técnica
- **Validação de Schema:** Resolvidos erros P1012 no Prisma através de relações bidirecionais explícitas em `ComunidadeBans`.
- **Integridade Referencial:** Ajustada a nulidade de campos em `Denuncias` para suportar a ação `SetNull`.

## [2026-03-29] - Gamificação V2: XP Orgânico, Decaimento e Especialização (IFNMG)

### Adicionado
- **Rastreamento de XP por Categoria:** Adicionados campos `xp_escrita`, `xp_curadoria` e `xp_social` ao modelo `Perfis` no Prisma.
- **Missing Models (Prisma):** Restaurada a integridade do `schema.prisma` com os modelos `Titulos`, `PerfisTitulos`, `Conquistas` e `PerfisConquistas`.
- **Especialização de Títulos:** Novo motor de verificação de títulos baseado em XP acumulado por categoria específica em `perfil.service.ts`.

### Alterado
- **Motor de XP v2.0:** Refatorado `gamificacao.config.ts` com categorias (Escrita, Curadoria, Social) e curva geométrica de nível (`Nivel * 100 * (1.5 ^ Nivel)`).
- **Decaimento Temporal:** Implementada lógica de decaimento (0-48h: 100%, 48-168h: 50%, >168h: 10%) para interações sociais recebidas.
- **Limites Diários:** Adicionado hard cap de 3000 XP/dia para evitar abusos e progressão artificial acelerada.
- **Regra de Espontaneidade:** Votos e comentários não geram mais XP para quem realiza a ação; apenas o receptor (autor) ganha Karma/XP.
- **Validação de Conteúdo:** Ganho de XP em posts agora exige comprimento mínimo (100 caracteres para posts avulsos, 300 para capítulos de obras).

### Técnica
- **Atomicidade em Transações:** Atualização de XP Total, XP por Categoria e Nível consolidada em uma única transação Prisma.
- **Cálculo de Limite Diário:** Uso de `LogAtividade` para somar o XP ganho no dia atual antes de processar novas recompensas.

## [2026-03-25] - Correção de Z-Index e Integração do ScrollToTop

### Alterado
- **Ajuste de Camada (Z-Index):** Elevado o z-index do `ScrollToTop` para `99` para flutuar sobre o conteúdo principal sem interferir em modais.
- **Refinamento de Integração:** Validada a renderização global no `App.tsx` para assegurar que o botão esteja visível em todas as páginas após 400px de scroll.

### Técnica
- **Validação de Listener:** Confirmada a captura de scroll global através do objeto `window`.

## [2026-03-25] - Botão Flutuante "Voltar ao Topo"

### Adicionado
- **Botão Voltar ao Topo:** Componente global `ScrollToTop` para facilitar a navegação em telas com rolagem extensa.
- **Animações de Visibilidade:** Transições de escala e opacidade via `framer-motion` ao atingir 400px de scroll.

### Alterado
- **Integração Global:** Adicionado ao `App.tsx` para persistência em todas as rotas autenticadas e públicas.

### Técnica
- **Rolagem Suave:** Utilização de `window.scrollTo({ top: 0, behavior: "smooth" })`.
- **Cleanup de Eventos:** Remoção automática do listener de scroll ao desmontar o componente.

## [2026-03-25] - Sistema de Denúncias Responsivo (Modal/Bottom Sheet)

### Adicionado
- **Modal de Denúncias Adaptativo:** Novo componente que funciona como modal em desktop e como "Bottom Sheet" em dispositivos móveis.
- **Serviço de Denúncia:** Integração frontend-backend para registro de denúncias via `POST /denuncias/:postId`.
- **Animações Framer Motion:** Transições suaves de entrada e saída para os modais de segurança.

### Alterado
- **Ação de Denúncia no Feed:** Substituído o alerta de confirmação simples por um formulário completo de denúncia com seleção de motivo e descrição opcional.

### Técnica
- **Snapshot de Evidências:** Backend captura estado atual do post no momento da denúncia para auditoria futura.
- **Responsividade Touch-Ready:** Botões e chips de seleção dimensionados para facilitar a interação em telas sensíveis ao toque (44px+).

## [2026-03-25] - Restauração de Dados e Refinamento de Tipagem Social

### Adicionado
- **PostResponse Schema:** Novo tipo de resposta para posts que lida com a nulidade do autor e utiliza snapshots de autoria (`autor_nome_user`, `nome_campus`).
- **Trava de Hierarquia:** TODO técnico adicionado para impedir comentários de 3º nível.

### Alterado
- **Restauração de Campo:** Reintroduzido `data_nascimento` no fluxo de registro de usuários para conformidade com o schema e política institucional.
- **Hierarquia de Comentários:** `PostCommentSchema` agora suporta `parent_id` opcional.

### Segurança
- **Hardening de Privilégios:** Validada a ausência de `is_admin` em schemas de entrada pública (Registro e Patch Perfil).

## [2026-03-25] - Sincronização de DTOs e Tipagem Arquitetural

### Adicionado
- **Módulo de Comunidades (Tipos):** Novo arquivo `comunidade.types.ts` com schemas Zod para criação de comunidades, configuração de privacidade e gestão de papéis (Roles: MEMBRO, MODERADOR, ADMIN, DONO).
- **Hierarquia de Comentários:** Suporte a `parent_id` no `PostCommentSchema` para permitir respostas encadeadas.
- **Sistema de Reações:** Implementado `ReacaoSchema` com suporte a `LIKE`, `LOVE`, `FIRE` e `SAD`.

### Alterado
- **Contrato de Registro:** Inclusão obrigatória de `nome_completo` e `nome_campus` no fluxo de cadastro.
- **Segurança de JWT:** Payload do token agora exige `perfil_id` e `is_admin` nativamente, com suporte a metadados de expiração.
- **Expansão de Posts:** `PostCreateSchema` atualizado para suportar status de obra (`ANDAMENTO`/`CONCLUIDO`), `obra_id` e `comunidade_id`.
- **Integridade de Denúncias:** Schemas ajustados para refletir a nova política de `SetNull` do banco, tratando `post_id` e `perfil_id` como opcionais em snapshots históricos.

### Técnica
- **Strict Validation:** Aplicado `.strict()` em todos os novos schemas Zod para mitigar ataques de Mass Assignment.
- **Extensão do Request:** Objeto `req.user` agora é tipado globalmente via `express.d.ts`.

## [2026-03-25] - Refinamento de Listagem de Posts e Perfil Dinâmico

### Adicionado
- **Diferenciação de Empty States:** Aba de "Pergaminhos" agora exibe mensagens distintas quando o perfil visualizado não possui publicações ("Você ainda não publicou..." vs "Este acadêmico ainda não publicou...").

### Alterado
- **Performance de Filtragem:** Substituída a filtragem manual no frontend por consultas otimizadas no backend via `autorId`.
- **Integridade de Perfil:** `PerfilTabs` agora reage corretamente à troca de usuários na URL, garantindo que os dados exibidos sempre correspondam ao perfil atual.

### Técnica
- **Validação de Query String:** Garantida a formatação correta de parâmetros de busca no `post.service.ts` para evitar disparidades com a API.

## [2026-03-25] - Gamificação Atômica e Sincronia de Reatividade Instantânea

### Adicionado
- **Reatividade Global de XP:** Todas as ações sociais (Voto, Post, Comentário) agora disparam uma atualização instantânea do estado do perfil no frontend sem necessidade de refresh.
- **Enriquecimento de Resposta:** APIs de Post, Voto e Comentário agora retornam o objeto `perfil_atualizado` no contrato JSON.
- **Ganho de XP em Votos:** Usuário que vota ganha +2 XP. Autor do post recebe +10 XP em cada Upvote recebido.

### Alterado
- **Justiça de Progressão:** Nova fórmula de nível progressiva baseada em raiz quadrada (`floor(sqrt(XP / 100))`).
- **Atomicidade Técnica:** Processamento de XP e Level consolidado em uma única transação Prisma no backend, eliminando race conditions.
- **Optimistic UI para Votos:** Atualização visual imediata do contador de votos com rollback inteligente em caso de erro.

### Técnica
- **Evento Global de Sincronia:** Implementado evento `auth:perfil_updated` para comunicação entre `apiClient` e `AuthContext`.

## [2026-03-25] - Filtragem de Posts por Autor e Sincronização de UI

### Adicionado
- **Filtro por Autor (Backend):** Rota `/posts` agora aceita o query param `autorId`, permitindo listar publicações de um acadêmico específico.
- **Integração no Perfil:** Aba "Pergaminhos" no perfil agora carrega dados reais filtrados pelo banco, com suporte a paginação e loading dinâmico.

### Alterado
- **Refatoração de Serviço (Frontend):** A função `getPosts` no `post.service.ts` foi reestruturada para aceitar um objeto de filtros (page, categoriaId, autorId), tornando-a mais versátil para uso no Feed, Explorar e Perfil.
- **Sincronia de Feed:** Atualizados os hooks de carregamento no `Feed.tsx` para compatibilidade com a nova assinatura de serviço.

### Técnica
- **Consistência de Build:** Validada a integridade de todas as referências ao serviço de posts no projeto via `npm run build`.

## [2026-03-25] - Otimização de Performance, Privacidade e Optimistic UI

### Adicionado
- **Optimistic UI para Seguimento:** Atualização instantânea do botão "Seguir" e contadores de seguidores no frontend, com rollback em caso de falha.

### Alterado
- **Privacidade Rigorosa:** O objeto `usuario` é agora totalmente removido do payload de perfis de terceiros no backend (Privacidade por Design).
- **Sincronia Global de Perfil:** Alterações feitas em Configurações agora atualizam o estado global (`AuthContext`) imediatamente, refletindo no Header e Sidebar sem refresh.
- **Alta Performance de Query:** Otimização das agregações de perfil no backend via execução paralela massiva com `Promise.all`.

## [2026-03-25] - Perfil Público, Estado de Seguimento Real e Privacidade

### Adicionado
- **Rota de Perfil Público:** Implementado `GET /perfil/:id` no backend para visualização de acadêmicos de terceiros.
- **Campo `is_following`:** Novo dado dinâmico no contrato de API para informar se o usuário logado segue o perfil visitado.

### Alterado
- **Privacidade de Dados:** E-mail do usuário agora é automaticamente omitido em visualizações de perfis que não pertencem ao próprio dono.
- **UI de Perfil Reativa:** `PerfilPage.tsx` refatorada para usar dados reais do banco, removendo o hack visual que usava `is_admin` para simular seguimento.
- **Roteamento Interno:** A página de perfil agora decide de forma inteligente entre chamar `/me` ou `/:id` comparando IDs.

### Segurança
- **Isolamento de Identidade:** Implementada lógica de "Visitante" no serviço de perfil para garantir que dados sensíveis não vazem em rotas públicas.

## [2026-03-25] - Notificações de Level Up e Humanização de Erros

### Adicionado
- **Modal de Level Up (Vibrante):** Implementação de `Notificacao.modal.levelUp` com timer de 5s, animações e suporte a exibição de nova patente.
- **Monitor de Evolução em Tempo Real:** Novo hook no `AuthContext` que detecta subida de nível e dispara a notificação visual sem necessidade de refresh (F5).

### Alterado
- **Dicionário de Erros Humanizados:** Sincronização e mapeamento de `ErrorCodes` do backend para mensagens amigáveis em português no frontend.
- **Melhoria de UX em Falhas:** Toasts e Modais de erro agora apresentam textos mais claros para `TOKEN_EXPIRED`, `UNAUTHORIZED`, `INVALID_CREDENTIALS` e `RATE_LIMIT_EXCEEDED`.

## [2026-03-25] - Sincronização de Rotas e Refatoração de Contratos de API

### Adicionado
- **Modal de Entrada Versátil:** Novo método `Notificacao.modal.input` no frontend para capturar dados (senhas, textos) com suporte a tipos nativos de input.
- **Confirmação de Segurança:** Implementada etapa de validação de senha atual antes da exclusão definitiva da conta em `SubSeccionPrivacidade.tsx`.

### Alterado
- **Sincronização de Endpoints:**
  - Logout: `fazerLogout` atualizado para `POST /auth/logout-all` (Sincronia com Backend).
  - Perfil: `updateMeuPerfil` atualizado para `PATCH /perfil/me`.
  - Exclusão: `deleteMinhaConta` atualizado para `DELETE /perfil/seguranca/conta`.
- **Refatoração do apiClient:** Extensão do método `apiClient.delete` para suportar o envio de payload no corpo da requisição via `config.data`.
- **Ajuste de Tipagem de Perfil:** `updateMeuPerfil` agora utiliza o campo `nome` em vez de `nome_user` para manter paridade com o `PerfilPatchSchema` do backend.

### Segurança
- **Hardening de Deleção:** A conta não pode mais ser excluída apenas com um clique; a senha do usuário é validada pelo backend antes da operação destrutiva.

## [2026-03-19] - Refinamento de Rigor (Explorar) e Arquitetura de Configurações

### Adicionado
- **Botão "Voltar" Inteligente:** Adicionado à `ExplorarPage.tsx` utilizando `navigate(-1)` para respeitar o fluxo histórico do usuário, com design "Fine UI" (divisor vertical e hover dinâmico).
- **Filtros AO3 (Fidelidade Total):** Implementação de checkboxes para idiomas e grid de 2 colunas para status na sidebar de filtros, seguindo o rigor do protótipo `copia.md`.
- **Navegação de Resultados:** Adicionado seletor de ordenação ("Mais Recentes", "Mais Citados", etc.) diretamente no header da `ListaResultados.tsx`.

### Alterado
- **Arquitetura da Sidebar:** Refatoração da `FiltrosSide.tsx` para abandonar o scroll interno em favor de um scroll independente no container pai (`aside`), garantindo que o bloco de "Ajuda" acompanhe a rolagem.
- **Configurações via Nested Routes:** Módulo de configurações agora utiliza rotas aninhadas (`/configuracoes/*`), permitindo sub-páginas de Perfil, Segurança e Privacidade com isolamento de estado.
- **Sincronia Visual (Filtros):** Atualização do `FiltrosTopo.tsx` para espelhar a nova lógica de filtros (Idioma e Status) quando a sidebar está oculta (Modo Foco).
- **Rigor Tipográfico:** Aplicação sistemática de `uppercase tracking-wider` e pesos `font-black` em labels e botões de ação para paridade absoluta com o design de referência.

### UX/UI
- **Layout Híbrido Dinâmico:** Implementação de transições suaves via `Framer Motion` ao alternar entre visão de Sidebar e Filtros no Topo.
- **Scroll Independente:** Uso de `overscroll-contain` e `scrollbar-hide` para garantir que a navegação na sidebar não interfira no scroll da página principal.

## [2026-03-17] - Integração de Gamificação, Header Global e Refatoração de Rotas

### Adicionado
- **Header Global ("Camaleão"):** Criação de um componente `Header.tsx` altamente configurável e stateless em `shared/components/`, integrando navegação, busca, perfil e ações contextuais.
- **Isolamento de Dados no Perfil:** Implementada lógica de filtragem em `PerfilTabs.tsx` para garantir que visitantes vejam apenas posts do autor e o dono veja seus posts salvos.
- **Roteamento de Entrada Amigável:** Reestruturação de rotas no `App.tsx` para usar `/entrada` e `/entrada/cadastro`, com redirecionamento de `/login`.
- **Navegação Universal por Avatar:** Todos os avatares (Header, PostCard, SuggestedUsers) agora são links para o perfil correspondente.

### Alterado
- **Sincronização de Gamificação:** Refatoração completa do Perfil (`PerfilSidebar`, `PerfilConquistas`, `PerfilTabs`) para consumir dados reais de XP, Nível e Títulos do backend.
- **Logout Seguro:** Implementação de fluxo assíncrono que invalida o `token_version` no backend via `fazerLogout` antes de limpar o estado local.
- **Refinamento Estético ("Fine UI"):** Aplicação global da tipografia Lexend e ajuste de `strokeWidth: 1.5` em todos os ícones Lucide para um visual mais elegante.
- **Eliminação de Mocks:** Substituição de dados estáticos por chamadas reais aos serviços `getPostsByUserId`, `getPostsFavoritados` e `getPerfilPublico`.

### Segurança
- **Invalidação Server-side:** Logout agora incrementa a versão do token no banco, prevenindo o reuso de JWTs após a saída.
- **Privacidade de Dados:** Aba "Salvos" no perfil agora é estritamente oculta para visitantes, protegendo a privacidade do usuário.

### [2026-03-16] - Refatoração para RPG Acadêmico (Gamificação)

### Adicionado
- **Sistema de Títulos:** Implementação das tabelas `Titulos` e `PerfisTitulos` no Prisma.
- **Motor de Gamificação:** Criado `src/shared/utils/gamificacao.config.ts` com constantes de XP e definições de Patentes.
- **Lógica de Progressão:** Novos métodos `processarGanhoXP` e `getPatentePorNivel` no `perfil.service.ts`.
- **Snapshot de Autoria:** Colunas `autor_nome_user` e `nome_campus` agora são preenchidas obrigatoriamente no `Posts` para preservar histórico pós-deleção.

### Alterado
- **Simplificação de Métricas:** XP unificado como motor principal de nível, substituindo a dependência direta de `reading_points`.
- **Schema Prisma:** Removidas as tabelas de `Medalhas` (substituídas por títulos textuais mais escaláveis).
- **Infinite Scroll:** Rota `/posts` atualizada para suportar paginação via `skip` e `take`.

### Segurança
- **Rate Limit Validado:** Testes de estresse confirmaram bloqueio 429 funcional contra spam de postagens.
- **Identidade Blindada:** Guard de `perfil_id` implementado nos controllers de postagem.

### [2026-03-15] - Funcionalidade de Visibilidade na Prévia e Preparação para Produção

**Frontend:**
- **PreviewCard.tsx**: Adicionado toggle de visibilidade para a prévia da publicação.
- **UX**: Implementada renderização condicional com placeholder ("Visualização da prévia oculta") e ícones dinâmicos `Eye`/`EyeOff`.
- **Animações**: Card da prévia agora possui animação suave de entrada.
- **Build**: Verificado via `npm run build` com sucesso no frontend.

---

### [2026-03-11] - Evolução para Rede Social e Otimização de Feed

**Backend:**
- **Follow System:** Implementação do model `Seguidores` no Prisma com chave composta e índices.
- **Service de Perfil:** Adicionadas funções `seguirPerfil` e `deixarDeSeguirPerfil` com tratamento de idempotência.
- **Controller de Perfil:** Novo endpoint `POST /:id/seguir` (toggle follow) implementado com padrão `tratarAssincrono`.
- **Otimização de Posts:** Denormalização do campo `autor_nome_user` no model `Posts` para acelerar o Feed.
- **Performance:** Adicionado índice composto `[data_criacao, total_upvotes]` no model `Posts`.
- **Anti-N+1:** Refatoração do `posts.service.ts` para carregar categorias e autor em uma única query otimizada.

**Frontend:**
- **QuickPost:** Integrada a identidade real do usuário logado (exibição da inicial do nome no avatar) consumindo `getMeuPerfil`.

---

### [2026-03-11] - Auditoria de Paridade e Feature de Feed

## 2026-03-09 — Auditoria de Código Morto, Refatoração de Erros e Design System
Type: Refactor | Architecture | Backend | Frontend

Escopo:
- **Auditoria de Código Morto (Backend)**:
  - Removidos tipos obsoletos (`CategoriaResponse`, `PostResponse`, `InteresseResponseSchema`, etc.) em `src/shared/types/`.
  - Removidas funções órfãs: `checarSaudeSMTP` (serviceEmail.ts), `hashPassword` (auth.service.ts) e `buscarPorId` (categorias.service.ts).
  - Validação completa com 26 testes do Mega Stress passando 100%.
- **Design System & Arquitetura Frontend**:
  - Configurada estrutura modular em `frontend/src` espelhando o backend (`shared/styles`, `shared/types`, `features/auth`, etc.).
  - Implementado `shared/styles/themes.css` com Tokens de Identidade Imutáveis e Tokens Dinâmicos para Dark Mode.
  - Configurada tipagem global e tipografia (Open Sans) com ajustes de peso visual para modo escuro.
- **Rastreamento e Diagnóstico (Observabilidade)**:
  - Implementados logs de "breadcrumbs" (`[FLOW:IN]`, `[DEBUG]`) no `server.ts` e `authMiddleware.ts` para identificar causas de erro 401/CORS.
  - Criado endpoint de diagnóstico isolado `GET /api/v1/saude/ping` (público) para testes de conectividade.
  - Adicionado teste de conexão automático no `useEffect` do `Login.tsx`.
- **Refatoração de Erros e Semântica HTTP**:
  - **AppError.ts**: Adicionados métodos Factory `conflict()`, `forbidden()`, `gone()`, `serviceUnavailable()` e `config()`.
  - **ErrorCodes**: Unificado o dicionário de erros entre Backend e Frontend. Adicionados novos códigos (`CONFLICT`, `SERVICE_UNAVAILABLE`, `CONFIG_ERROR`) e marcados obsoletos como `@deprecated`.
  - **Falsos Sucessos**: Refatorado `auth.service.ts` para eliminar retornos de strings em erros de negócio, passando a lançar `AppError` (ex: 409 Conflict para e-mail duplicado).
  - **errorHandler.middleware.ts**: Implementado helper `setResponse` para garantir consistência entre Status HTTP, ErrorCode e Mensagem. Adicionada proteção para mensagens genéricas em erros 5xx.
  - **apiClient.ts (Frontend)**: Sincronizado com os novos códigos de erro e mensagens amigáveis de UX.
- **Frontend Refactoring (Login.tsx)**:
  - **Consolidação de Erros**: Refatorado o tratamento de erros nos fluxos de Login e Cadastro para usar `switch(err.errorCode)`.
  - **Eliminação de Strings Legadas**: Removido o parsing manual de strings (`msg.includes`) para decisões de UI.
  - **Fluxo de Cadastro**: O componente agora confia plenamente no contrato de erro do backend para disparar modais específicos (E-mail existente, Cadastro pendente, Link expirado).
  - **Build**: Verificado via `npm run build` com sucesso.
- **UX & Notificações (SweetAlert2)**:
  - **Refatoração do Notificacao.ts**: Alterado o retorno das funções de modal para `Promise<SweetAlertResult>`, permitindo capturar interações do usuário (Confirm, Cancel, Deny).
  - **Suporte a Ações Reais**: Implementado o botão "Abrir Gmail" nos alertas de sucesso e pendência de cadastro, utilizando `window.open` para facilitar o acesso à caixa de entrada institucional.
  - **Padronização de Decisões**: O alerta de e-mail existente foi ajustado para o novo padrão, permitindo que o usuário escolha entre "Fazer Login" ou "Recuperar Senha" de forma mais fluida.
  - **Escalabilidade**: A tipagem `ModalConfig` agora aceita propriedades nativas do SweetAlert2 via spread, permitindo extensões futuras (como botões de negação) sem alterar o utilitário.
- **Feature: Feed "EscrevAí"**:
  - **Modularização**: Criada a pasta `src/features/feed/` com componentes dedicados (`Feed`, `QuickPost`, `PostCard`, `TagList`, `PostActions`).
  - **Design System**: Implementado layout inspirado em Medium/Reddit moderno, utilizando variáveis CSS de identidade (`var(--accent-primary)`, `var(--bg-card)`).
  - **Quick Post**: Adicionada área de criação rápida com estilo minimalista.
  - **Post Card**: Refatorado para exibir avatar, nome de usuário, tempo relativo (estático), conteúdo com `line-clamp` e lista de hashtags.
  - **Integração**: Substituída a implementação local do Feed no `Dashboard.tsx` pelo novo componente modularizado.
  - **Tipagem**: Atualizado `PostResumoSchema` em `src/shared/types/post.types.ts` para suportar o campo opcional `tags: string[]`.

Impacto:
- Eliminação de dívida técnica e código morto no backend.
- Padronização total da comunicação de erros (idioma único) entre as camadas.
- Melhoria na usabilidade e feedback visual no frontend através de semântica de erro robusta.
- Fundação sólida para o frontend com suporte nativo a temas e arquitetura modular.

## 2026-03-08 — Refatoração da Tela de Login (UI/UX "EscrevAí")
Type: Refactor | UI/UX | Frontend

Escopo:
- **`src/features/auth/Login.tsx`**: Refatoração completa do JSX para um layout moderno, centrado e responsivo, alinhado com a identidade visual "EscrevAí".
- **Layout e Estilo**:
  - Adoção de um card central com cabeçalho (`<header>`) e rodapé (`<footer>`) padronizados.
  - Uso de ícones da biblioteca `lucide-react` para melhorar a semântica de labels e botões.
  - Implementação de um rodapé institucional com o logo do IFNMG e links para a política de privacidade.
- **Funcionalidades de UX**:
  - **Progressive Disclosure para Senha**: O campo "Confirmar Senha" só é exibido após a senha principal atender a todos os critérios de força (comprimento, maiúscula, número).
  - **Input de Data com Máscara**: O campo de data de nascimento (`nascimento`) agora utiliza `react-input-mask` para forçar o formato `DD/MM/YYYY`, com conversão para `YYYY-MM-DD` antes do envio ao backend.
  - **"Lembrar de mim"**: Checkbox que persiste o email do usuário no `localStorage` para preenchimento automático em visitas futuras.
  - **"Termos de Uso"**: Checkbox de consentimento obrigatório para o fluxo de cadastro, bloqueando a submissão caso não seja marcado.
- **Componentes Adjacentes**:
  - **`src/shared/components/ThemeToggle.tsx`**: Refatorado para remover posicionamento fixo, permitindo sua integração fluida no cabeçalho do card. Adicionado efeito de "glow" e borda condicional ao tema.
  - **`src/index.css`**: Adicionada regra CSS robusta (`-webkit-appearance: none;`) para ocultar o ícone nativo do `input[type="date"]`, garantindo consistência visual.
- **Validação**:
  - Toda a lógica de estado, validação de formulário (`zod`), tratamento de erros e comunicação com a API (`auth.service.ts`) foi 100% preservada.
  - Build do frontend (`npm run build`) executado com sucesso após a resolução de múltiplos erros de importação com casing inconsistente (e.g., `ThemeToggle.tsx` vs `themetoggle.tsx`).

Impacto:
- Modernização completa da experiência de autenticação, alinhando-a com o design system do "EscrevAí".
- Melhoria na usabilidade com feedbacks visuais claros (requisitos de senha) e inputs guiados (máscara de data).
- Aumento da conformidade com a adição do consentimento de termos de uso.


## 2026-02-20 — Architectural Consolidation (Governance v4.3)

- Consolidated forensic memory across backend and frontend with strict, file-linked evidence.
- Integrated SweetAlert2 decision flows for registration and authentication outcomes:
  - 202 (Registro): success prompt with “Open Gmail” option.
  - 400/409 (Registro/Conflito): warning with “Fazer Login”/“Recuperar Senha” decisions.
- Implemented Progressive Disclosure in Login.tsx:
  - “Confirm Password” field visibility gated by password strength (≥8, 1 uppercase, 1 digit).
- Enforced token_version security chain:
  - Added/validated token_version in schema.prisma; increment on login/logout-all; verified in auth middlewares.
- Established Nominal Impact Matrix:
  - Enumerated and linked all files depending on prisma.client.ts to assess change blast radius.

Notes:
- This entry reflects the governance and memory expansion completed on Feb 19–20, 2026.
## 2026-02-23 — User/Profile Identity Separation
Type: Schema | Endpoint | UI | Security

Scope:
- Database: Introduced usuarios.nome_completo, usuarios.data_nascimento, usuarios.nome_campus; renamed perfis.nome → perfis.nome_user (unique).
- Migration: add_separa_nomeEninck; Prisma Client regenerated.
- Backend: RegistrarSchema now requires nome_completo, nome_user, nome_campus, data_nascimento, email, senha. auth.service.ts persists identity in usuarios and social nickname in perfis via Prisma transaction. Posts now expose autor.nome sourced from perfis.nome_user. Perfil update targets nome_user.
- Frontend: Registration form updated with Full Name, Nickname, Campus, Birth Date; payload aligned 1:1 with backend.
- Security: Zod .strict() maintained for Mass Assignment protection; Endpoint Contract Grid updated to lock new mandatory fields.

Contracts:
- POST /api/v1/auth/registrar → 202 Accepted; mandatory: nome_completo, nome_user, nome_campus, data_nascimento, email, senha.

Risks & Mitigations:
- Back-compat: New DB columns are nullable, avoiding runtime failures for legacy records.
- UI: SweetAlert2 202 Accepted flow preserved. FIELD_VALIDATION and EMAIL_ALREADY_EXISTS behavior unchanged.

## 2026-03-01 — UI Utilities & Types Governance Cleanup
Type: Frontend | UI | Governance

Scope:
- UI: Expansão do módulo de alertas (shared/utils/alerta.ts) com alertaInfo e alertaDecisao, mantendo BASE e CLASSES para padronização visual.
- Types: Tipos globais mantidos em shared/types/models.ts; tipos específicos definidos localmente nas features (auth.service.ts).

Impact:
- Reduz duplicação de configuração de SweetAlert2 e facilita manutenção visual.
- Evita poluição do espaço global de tipos.

## 2026-03-01 — Roteamento v6
Type: Frontend | Routing

Scope:
- App.tsx migrado para react-router-dom v6: BrowserRouter/Routes/Route/Navigate.
- Rotas: / → redireciona para /dashboard ou /login conforme autenticação; /login → Login; /redefinir-senha → Redefinir; /dashboard → componente.

Impact:
- Remove lógica manual de popstate e simplifica App.tsx.

## 2026-03-01 — Dashboard (MVP)
Type: Frontend | UI

Scope:
- Criado Dashboard.tsx (layout 3 colunas): Sidebar sólida, Feed com cards (backdrop-blur-sm) e Gamificação sólida.
- Rota /dashboard integrada em App.tsx.
- Usa alertaDecisao no botão “Denunciar” e tokens var(--bg-app)/var(--bg-card)/var(--color-if-green)/var(--color-if-red).

Impact:
- Entrega visual pós-login com responsividade e governança de design.

## 2026-03-01 — ProtectedRoute & Desacoplamento de Navegação
Type: Frontend | Routing | UX

Scope:
- Adicionado shared/utils/ProtectedRoute.tsx com feedback de carregamento, redireciono declarativo e Outlet.
- AuthContext expande valor com loading; inicialização sincronizada com storage.
- App.tsx envolve /dashboard com ProtectedRoute.
- Login.tsx remove useNavigate; formulário apenas atualiza o contexto via setSession.

Impact:
- Evita acoplamento de navegação nos componentes de formulário.
- Melhora UX ao impedir flicker e garante proteção declarativa das rotas privadas.

## 2026-03-03 — Refatoração de Logs: Consolidação de Auditoria e Limpeza Técnica
Type: Refactor | Cleanup

Scope:
- Controllers (src/features/**/**.controller.ts): Removidos logs de fluxo técnico (início/fim de requisições). Controllers mantêm foco em HTTP e delegam totalmente a negócio e validação.
- Services (src/features/**/**.service.ts): Removidos logger.info/warn/error redundantes; mantidas apenas chamadas a logService.registrar para auditoria de negócio (login/logout, votos, comentários, denúncias).

Rationale:
- O middleware de errorHandler centraliza o logging de erros operacionais (4xx/5xx).
- A auditoria de negócio permanece consistente, com trilhas de eventos através de logService e LogAtividade.

Impact:
- Redução de ruído nos logs e melhoria da rastreabilidade por eventos de negócio.
 
## 2026-03-03 — Fusão de Domínios: Interesses → Categorias (Taxonomia)
Type: Refactor | Domain Consolidation

Scope:
- Tipos: ToggleInteresseSchema e InteresseResponse movidos de shared/types/interesses.types.ts para shared/types/categoria.types.ts.
- Serviço: seguir/deixarDeSeguir/listar interesses incorporados a features/categorias/categorias.service.ts como seguirCategoria, deixarDeSeguirCategoria e listarInteresses.


## 2026-03-03 — Implementação de Rate Limiting "Campus-Aware" (Identity-Aware)
Type: Security | Middleware

Scope:
- rateLimiter.ts: Fábrica aceita useIdentity (default: true) e usa perfil_id como chave quando disponível; fallback para req.ip.
- Novos limitadores: 
  - limitadorRegistro (20/15min, useIdentity: false)
  - limitadorLogin (15/5min, useIdentity: false)
  - limitadorEngajamento (10/1min, useIdentity: true)
  - limitadorLeitura (200/1min, useIdentity: true)
- Rotas:
  - auth.routes.ts: limitadorRegistro em POST /registrar; limitadorLogin em POST /logar; limitadorRegistro aplicado em /solicitar-recuperacao e /redefinir-senha.
  - posts.routes.ts: limitadorLeitura em GET /posts; limitadorEngajamento em POST /, /:id/votar e /:id/comentarios.
  - denuncias.routes.ts: limitadorEngajamento em POST /:postId.
  - interesses.routes.ts: limitadorEngajamento em POST /:categoriaId.

Rationale:
- Evita bloqueios indevidos em redes NAT do campus ao usar identidade (perfil_id) como chave nas rotas autenticadas.
- Mantém proteção adequada em endpoints de autenticação e engajamento.
### [2026-03-03] — Expansão Social (Votos, Comentários, Denúncias e Logs)
- Tipo: Schema | Prisma
- Impacto: Adição de modelos e campos materializados para escala de leitura, para votos, comentários e denúncias.
### [2026-03-03] — Evolução de Denúncias: Adição de Snapshot e Tipagem Numérica
- Tipo: Schema | Database
- Mudanças: Modelo Denuncias agora suporta código numérico, descrição opcional e snapshot do conteúdo original.
### [2026-03-05] — Hardening de Segurança, Observabilidade e Padronização de API
Type: Refactor | Security | Observability | Middleware

Files affected:
- backend/src/server.ts
- backend/src/shared/middlewares/jsonDepth.middleware.ts (New)
- backend/src/shared/middlewares/security.middleware.ts (New)
- backend/src/shared/middlewares/validate.middleware.ts
- backend/src/shared/utils/logger.ts
- backend/src/shared/utils/logService.ts
- backend/src/features/*/routes.ts
- backend/src/features/*/controller.ts

O que foi feito:
- **Observabilidade:** Migração para Pino.js com mascaramento (redaction) de dados sensíveis; implementação de persistência de logs assíncrona (fire-and-forget) para não bloquear requisições.
- **Segurança (Hardening):** Isolamento de middlewares de segurança (HTTPS/Host Validation em `security.middleware.ts`; proteção contra JSON Bomb em `jsonDepth.middleware.ts`).
- **Proteção Crítica:** Restauração de salvaguardas em produção (Check de `JWT_SECRET`, HSTS preloading e logs de monitoramento no cron).
- **Contratos de API:** Padronização do envelope de resposta global (`status`, `message`, `data`, `meta`), garantindo previsibilidade total para o frontend.
- **Validação Atômica:** Refatoração do `validate.middleware` para aceitar um objeto de contrato `{ body, query, params }`, eliminando o middleware `validateParams` redundante e unificando a validação de rotas.

Verificação:
- Build (`tsc`) validado com sucesso após refatoração de assinaturas de middleware.
- Padronização de envelopes verificada nos controllers de `posts` e aplicada como template para os demais.

## 2026-03-05 — Reconciliação: Grid de Endpoints e Ordem de Middlewares
Type: Documentation | Governance

Escopo:
- PROJECT_MEMORY.md
  - Middleware Stack: atualizado para `requestId → helmet (HSTS) → cors → express.json(100kb) → jsonDepthMiddleware(7) → enforceSecurity → routes → 404 → errorHandler`.
  - Routes Mapping: removido `interesses.routes` e incluído `denuncias.routes` conforme mounts atuais do `server.ts`.
  - Endpoint Contract Grid: removida a seção `/api/v1/interesses`; adicionados endpoints de interesse sob `/api/v1/categorias` com envelopes padronizados.
  - Immutable Data Contracts: adicionados contratos de voto, comentário e denúncia (PostVoteSchema, PostCommentSchema, DenunciaCreateSchema).
  - Rate limits e profundidade JSON atualizados para refletir `rateLimiter.ts` e `jsonDepth.middleware.ts`.

Racional:
- Alinhar a “Fonte Única de Verdade” com o estado real do código após refatores de segurança e consolidação de domínios.

Verificação:
- Conferência manual dos arquivos: `server.ts`, `categorias.routes.ts`, `posts.routes.ts`, `denuncias.routes.ts`, `validate.middleware.ts`, `rateLimiter.ts`, `jsonDepth.middleware.ts`, `security.middleware.ts`.

## 2026-03-05 — Padronização de Envelopes (Fase 1: Posts)
Type: Backend | Controller | Contract

Arquivos afetados:
- backend/src/features/posts/posts.controller.ts

Mudanças:
- Adotado envelope consistente em 200/201/204 com campos obrigatórios:
  - criarPost (201): adiciona `meta: null`.
  - listarPosts (200): mantém `data` e `meta` de paginação.
  - deletarPost (200): retorna `{ status, message, data: null, meta: null }` conforme diretriz.
  - votarPost (200) e comentarPost (201): adiciona `meta: null`.

Impacto na documentação:
- PROJECT_MEMORY.md ajustado para refletir `DELETE /posts/:id` com envelope em 204 e exemplos de sucesso de voto/comentário com `meta: null`.

Verificação:
- Build backend (`npm run build`) executado com sucesso após a mudança.

## 2026-03-05 — Migração 204 → 200 OK (Categorias/Interesses)
Type: Backend | Controller | Contract

Arquivos afetados:
- backend/src/features/categorias/categorias.controller.ts

Mudanças:
- Padronização de envelope em todos os retornos:
  - listar (200), criar (201), atualizar (200): adiciona `meta: null`.
  - excluir (200): envelope com `data: null`, `meta: null` (migração de 204 → 200).
  - listarInteressesCategoria (200): adiciona `meta: null`.
  - seguirCategoriaController (201): retorna `data: null`, `meta: null`.
  - deixarDeSeguirCategoriaController (200): envelope com `data: null`, `meta: null` (migração de 204 → 200).

Governança:
- Padrão global consolidado: deleções retornam 200 OK com envelope completo.

Verificação:
- Build backend (`npm run build`) executado com sucesso após as mudanças.

## 2026-03-05 — Padronização de Envelopes (Fase 3: Perfil)
Type: Backend | Controller | Contract

Arquivos afetados:
- backend/src/features/perfil/perfil.controller.ts

Mudanças:
- getPerfilInfo (200) e updatePerfil (200): adiciona `meta: null`.
- alterarSenha (200) e deletarPerfil (200): retornam envelope com `data: null`, `meta: null`.

Verificação:
- Build backend (`npm run build`) executado com sucesso após as mudanças.

## 2026-03-05 — Padronização de Envelopes (Fase 4: Auth)
Type: Backend | Controller | Contract

Arquivos afetados:
- backend/src/features/auth/auth.controller.ts

Mudanças:
- logar, confirmarEmail, solicitarRecuperacao, redefinirSenha, logoutAll (200): adiciona `meta: null` e `data: null` quando não há payload.
- registrar (202): adicionado `meta: null`.

Verificação:
- Build backend (`npm run build`) executado com sucesso após as mudanças.

## 2026-03-05 — Padronização de Envelopes (Fase 5: Denúncias)
Type: Backend | Controller | Contract

Arquivos afetados:
- backend/src/features/denuncias/denuncias.controller.ts

Mudanças:
- criar (201): retorna objeto de denúncia criado em `data` e `meta: null`.

Verificação:
- Build backend (`npm run build`) executado com sucesso após as mudanças.

## 2026-03-05 — Otimização de Health Check SMTP (Monitoramento Assíncrono)
Type: Backend | Observability | Performance

Arquivos afetados:
- backend/src/shared/utils/serviceEmail.ts
- backend/src/server.ts

Mudanças:
- Implementado cache de status em memória via `smtpStatus` com valores 'UP' | 'DOWN' | 'CHECKING'.
- Criado `iniciarMonitoramentoSMTP()` para realizar `verify()` inicial e revalidar a cada 30 segundos, atualizando `smtpStatus`.
- `diagnosticarSMTP()` passa a responder instantaneamente usando o cache e mantém verificação de variáveis de ambiente (retorna 'DISABLED' quando não configurado).
- Inicialização do servidor passou a aguardar `iniciarMonitoramentoSMTP()` ao invés de chamar verificação pontual.

Impacto:
- Elimina latência (~2s) nos health checks de infraestrutura.
- Evita restart loops por timeouts em probes sincronas.

Verificação:
- Build (`npm run build`) executado com sucesso após refatores.
## 2026-03-06 — Padronização de Envelope de API, Unificação de Rede e Novo Sistema de Notificações
Type: Refactor | Architecture | Security | Frontend

Scope:
- Backend: Implementação do envelope global `{ status, message, data, meta }` em todos os controllers (`posts`, `categorias`, `perfil`, `auth`, `denuncias`).
- Backend: Depreciação do status HTTP 204 (No Content). Todas as operações de sucesso (incluindo DELETE) agora retornam 200 OK (ou 201 Created) com o envelope completo.
- Backend: Otimização do Health Check SMTP com monitoramento assíncrono em background (job de 30s) e cache em memória para eliminar latência de probes.
- Frontend: Unificação da camada de rede. O arquivo `axios.ts` foi removido e sua lógica de interceptores foi movida para `apiClient.ts`.
- Frontend: Migração massiva para o novo sistema unificado `Notificacao.ts`.
- Frontend: Substituição de `alerta.ts` e `toast.ts` em todos os componentes (`Login`, `Redefinir`, `Dashboard`) e utilitários (`apiClient`, `authContext`).
- Frontend: Deletados arquivos legados `src/shared/utils/alerta.ts` e `src/shared/utils/toast.ts`.

## 2026-03-06 — Hardening de Autenticação: Validação Proativa de JWT
Type: Security | Architecture | Frontend

Scope:
- AuthContext: Implementação de `parseJwt` nativo para inspeção de payload sem dependências pesadas.
- AuthContext: Inicialização de estado agora utiliza `getValidToken()`, que valida a claim `exp` (expiração) antes mesmo da primeira renderização.
- AuthContext: Limpeza automática do `localStorage` caso um token expirado ou malformado seja detectado na inicialização ou via eventos de `storage`.
- App.tsx: Implementação de guard de carregamento (`loading`) para impedir redirecionamentos ou renderizações de rotas antes da conclusão da validação da sessão.

## 2026-03-06 — Refatoração de Tratamento de Erros no Login
Type: Refactor | UX | Frontend

Scope:
- Login.tsx: Implementação de tratamento de erros explícito com `try/catch`.
- Login.tsx: Diferenciação entre erros de credenciais (Toast Warning) e erros de sistema (Modal Error) utilizando `AppError`.
- apiClient.ts: Ajuste no interceptor de resposta para não interferir em tentativas de login, permitindo que o componente gerencie o feedback de erro específico.
- apiClient.ts: Interceptor agora rejeita promessas utilizando a classe `AppError` para garantir tipagem consistente no catch.

## 2026-03-06 — Refatoração do Dashboard: Layout Holy Grail e Mobile-First
Type: Refactor | UX | UI | Frontend

Scope:
- Dashboard.tsx: Implementação de layout de 3 colunas (Holy Grail) com colunas laterais dinâmicas.
- Dashboard.tsx: Adição de controles de visibilidade para as barras laterais (`isLeftVisible`, `isRightVisible`) no Desktop.
- Dashboard.tsx: Implementação de Drawer Mobile (Menu Hamburger) para navegação em telas pequenas.
- Dashboard.tsx: Transição para componentes visuais modernos com `lucide-react` e suporte nativo ao `ThemeToggle`.
- Dashboard.tsx: Hardening do tratamento de erros em chamadas de API com feedbacks contextuais e tratamento de 401.

## 2026-03-06 — Reorganização de Segurança: Guards e Barrel Exports
Type: Refactor | Architecture | Security

Scope:
- Guards: Criação do diretório `src/shared/guards` para centralizar lógica de proteção de rotas.
- Guards: Implementação do `PublicOnlyRoute` para impedir acesso a telas de Login/Redefinição por usuários já autenticados.
- Guards: Migração do `ProtectedRoute` para o novo diretório e conversão para Named Export.
- Guards: Implementação de Barrel File (`index.ts`) para simplificar importações.
- App.tsx: Atualização do roteamento para utilizar os novos Guards, garantindo que usuários autenticados sejam redirecionados para o Dashboard ao tentar acessar o Login.
- authContext.tsx: Extração do `AuthLoadingScreen` para eliminar redundância visual nos Guards.

Impact:
- Melhor separação de responsabilidades (SRP) na arquitetura frontend.
- Experiência de usuário mais consistente com redirecionamentos inteligentes em todas as camadas de autenticação.
- Facilidade de manutenção com importações centralizadas via `@/shared/guards`.


Impact:
- Melhoria significativa na acessibilidade mobile.
- Interface mais limpa e moderna, com suporte a personalização de layout pelo usuário.
- Robustez no tratamento de falhas de carregamento de dados.


Impact:
- Melhoria na UX de login com feedbacks menos intrusivos para erros comuns de usuário.
- Maior robustez e previsibilidade no tratamento de exceções de rede e negócio.


Impact:
- Eliminação total de "Race Conditions" no carregamento inicial. Usuários com tokens expirados são redirecionados ao login instantaneamente, sem flicker de rotas protegidas.
- Redução da superfície de ataque ao invalidar tokens comprometidos ou expirados localmente de forma proativa.


Impact:
- Consistência total entre Backend e Frontend no tratamento de respostas.
- Centralização de UI de notificações e diálogos em um único namespace `Notificacao`.
- Melhora na performance de infraestrutura e redução de dívida técnica.
- Tipagem forte e API ergonômica (suporte a objeto ou string) em `Notificacao.ts`.

- Controller: Handlers de interesses integrados a categorias.controller.ts (listarInteressesCategoria, seguirCategoriaController, deixarDeSeguirCategoriaController).
- Rotas: Novos endpoints RESTful em categorias.routes.ts:
  - GET /api/v1/categorias/interesses (lista interesses do perfil)
  - POST /api/v1/categorias/:id/interesse (seguir)
  - DELETE /api/v1/categorias/:id/interesse (deixar de seguir)
- Server: Removido o mount de /api/v1/interesses; categorias mantém todo o escopo de Taxonomia.

Impact:
- Aumenta coesão do domínio de Taxonomia e simplifica o roteamento público.
- Build (tsc) validado após mudanças.