generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

//////////////// ENUMS //////////////////

enum VotoTipo {
  UP
  DOWN
}

enum PostStatus {
  ANDAMENTO
  CONCLUIDO
}

enum TipoReacao {
  LIKE
  LOVE
  FIRE
  SAD
}

enum TipoMidia {
  IMAGE
  VIDEO
}

enum TipoNotificacao {
  LIKE
  COMMENT
  FOLLOW
  REPOST
}

enum TipoRanking {
  GLOBAL
  SEMANAL
  CURSO
}

enum ComunidadeRole {
  MEMBRO
  MODERADOR
  ADMIN
  DONO
}

enum DenunciaStatus {
  PENDENTE
  ANALISADO
  REJEITADO
}

//////////////// PERFIS //////////////////

model Perfis {
  perfil_id Int @id @default(autoincrement())

  nome_user String @unique @db.VarChar(100)
  bio       String? @db.VarChar(255)

  score_karma    Int @default(0)
  reading_points Int @default(0)

  level Int @default(1)
  xp    Int @default(0)

  streak_dias  Int @default(0)
  ultimo_login DateTime?

  titulo_ativo String? @db.VarChar(50)
  curso        String? @db.VarChar(100)

  data_criacao DateTime @default(now())

  usuario Usuarios?

  posts     Posts[]
  obras     Obras[]
  progresso LeituraProgresso[]

  interesses  Interesses[]
  votos       Votos[]
  comentarios Comentarios[]
  denuncias   Denuncias[]
  logs        LogAtividade[]

  seguidores Seguidores[] @relation("quem_segue")
  seguidos   Seguidores[] @relation("sendo_seguido")

  titulos    PerfisTitulos[]
  conquistas PerfisConquistas[]
  rankings   Rankings[]

  notificacoes Notificacoes[]
  rascunho     Rascunhos?

  reacoes   Reacoes[]
  reposts   Reposts[]
  favoritos Favoritos[]

  comunidades_criadas Comunidades[]
  comunidades_membro  ComunidadeMembros[]

  @@map("perfis")
}

//////////////// USUARIOS //////////////////

model Usuarios {
  usuario_id Int @id @default(autoincrement())

  email         String @unique @db.VarChar(150)
  password_hash String @db.VarChar(255)

  data_criacao DateTime @default(now())

  token_verificacao   String? @db.VarChar(100)
  cadastro_confirmado Boolean @default(false)
  token_version       Int     @default(0)

  token_recuperacao String? @unique @db.VarChar(100)
  expiracao_pendente          DateTime?
  expiracao_token_recuperacao DateTime?
  nome_completo               String?
  data_nascimento             DateTime?
  nome_campus                 String?
  is_admin                    Boolean @default(false)
  perfil_id Int    @unique
  perfil    Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)

  @@index([email])
  @@index([token_verificacao])
  @@index([token_recuperacao])
  @@map("usuarios")
}

//////////////// COMUNIDADES //////////////////

model Comunidades {
  comunidade_id Int @id @default(autoincrement())

  nome      String @unique @db.VarChar(100)
  descricao String? @db.VarChar(255)

  criador_id Int?
  data_criacao DateTime @default(now())

  criador Perfis? @relation(fields: [criador_id], references: [perfil_id], onDelete: SetNull)

  membros ComunidadeMembros[]
  posts   Posts[]

  config ComunidadeConfig?
  bans   ComunidadeBans[]

  @@index([criador_id])
}

model ComunidadeMembros {
  perfil_id     Int
  comunidade_id Int

  role ComunidadeRole @default(MEMBRO)
  entrou_em DateTime @default(now())

  perfil     Perfis      @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  comunidade Comunidades @relation(fields: [comunidade_id], references: [comunidade_id], onDelete: Cascade)

  @@id([perfil_id, comunidade_id])
  @@index([comunidade_id, role])
}

model ComunidadeBans {
  perfil_id     Int
  comunidade_id Int

  motivo String? @db.VarChar(255)
  data   DateTime @default(now())

  perfil     Perfis      @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  comunidade Comunidades @relation(fields: [comunidade_id], references: [comunidade_id], onDelete: Cascade)

  @@id([perfil_id, comunidade_id])
}

model ComunidadeConfig {
  comunidade_id Int @id 

  privada Boolean @default(false)
  somente_admin_post Boolean @default(false)

  comunidade Comunidades @relation(fields: [comunidade_id], references: [comunidade_id], onDelete: Cascade)
}

//////////////// OBRAS //////////////////

model Obras {
  obra_id Int @id @default(autoincrement())

  autor_id Int?

  titulo String
  descricao String?

  data_criacao DateTime @default(now())

  autor Perfis? @relation(fields: [autor_id], references: [perfil_id], onDelete: SetNull)
  capitulos Posts[]

  @@index([autor_id])
}

//////////////// POSTS //////////////////

model Posts {
  post_id Int @id @default(autoincrement())

  titulo   String @db.VarChar(255)
  conteudo String @db.Text

  idioma String? @db.VarChar(20)
  status PostStatus @default(ANDAMENTO)

  visualizacoes Int @default(0)

  score_ranking  Float @default(0)
  score_trending Float @default(0)

  data_criacao DateTime @default(now())

  total_upvotes     Int @default(0)
  total_downvotes   Int @default(0)
  total_comentarios Int @default(0)

  autor_id        Int?
  autor_nome_user String? @db.VarChar(100)
  nome_campus     String? @db.VarChar(100)
  autor    Perfis? @relation(fields: [autor_id], references: [perfil_id], onDelete: SetNull)

  comunidade_id Int?
  comunidade    Comunidades? @relation(fields: [comunidade_id], references: [comunidade_id], onDelete: Cascade)

  obra_id Int?
  ordem   Int?
  obra    Obras? @relation(fields: [obra_id], references: [obra_id], onDelete: Cascade)

  categorias  PostsCategorias[]
  votos       Votos[]
  comentarios Comentarios[]
  denuncias   Denuncias[]
  reacoes     Reacoes[]
  midias      Midias[]
  reposts     Reposts[]
  favoritos   Favoritos[]
  progresso   LeituraProgresso[]

  @@index([autor_id, data_criacao])
  @@index([comunidade_id, data_criacao])
  @@index([comunidade_id, score_ranking])
  @@index([comunidade_id, score_trending])
  @@index([score_ranking])
  @@index([score_trending])
  @@index([obra_id, ordem])
  @@index([data_criacao])
  @@index([data_criacao, score_ranking])
  
}

//////////////// INTERAÇÕES //////////////////

model Votos {
  voto_id Int @id @default(autoincrement())

  perfil_id Int
  post_id   Int
  tipo      VotoTipo
  data DateTime @default(now())

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  post   Posts  @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  @@unique([perfil_id, post_id])
  @@index([post_id, tipo])
  @@index([data])
  @@index([perfil_id])
}

model Reacoes {
  reacao_id Int @id @default(autoincrement())

  perfil_id Int
  post_id   Int
  tipo      TipoReacao

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  post   Posts  @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  @@unique([perfil_id, post_id, tipo])
  @@index([post_id, tipo])
}

model Reposts {
  repost_id Int @id @default(autoincrement())

  perfil_id Int
  post_id   Int

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  post   Posts  @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  @@unique([perfil_id, post_id])
}

model Favoritos {
  id Int @id @default(autoincrement())

  perfil_id Int
  post_id   Int

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  post   Posts  @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  @@unique([perfil_id, post_id])
}

//////////////// COMENTÁRIOS //////////////////

model Comentarios {
  comentario_id Int @id @default(autoincrement())

  texto String @db.Text

  perfil_id Int?
  post_id   Int
  parent_id Int?
  data_criacao DateTime @default(now())

  perfil Perfis? @relation(fields: [perfil_id], references: [perfil_id], onDelete: SetNull)
  post   Posts  @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  parent    Comentarios?  @relation("ComentarioPai", fields: [parent_id], references: [comentario_id], onDelete: Cascade)
  respostas Comentarios[] @relation("ComentarioPai")

  @@index([post_id])
  @@index([parent_id])
  @@index([data_criacao])
  @@index([perfil_id])
}

//////////////// LEITURA //////////////////

model LeituraProgresso {
  perfil_id Int
  post_id   Int

  concluido Boolean @default(false)
  data      DateTime @default(now())

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  post   Posts  @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  @@id([perfil_id, post_id])
}

//////////////// MIDIA //////////////////

model Midias {
  midia_id Int @id @default(autoincrement())

  post_id Int
  url     String
  tipo    TipoMidia

  post Posts @relation(fields: [post_id], references: [post_id], onDelete: Cascade)

  @@index([post_id])
}

//////////////// NOTIFICAÇÕES //////////////////

model Notificacoes {
  notificacao_id Int @id @default(autoincrement())

  perfil_id Int
  tipo      TipoNotificacao

  post_id       Int?
  comentario_id Int?
  autor_id      Int?

  lida Boolean @default(false)
  data DateTime @default(now())

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)

  @@index([perfil_id, lida])
}

//////////////// RASCUNHO //////////////////

model Rascunhos {
  rascunho_id Int @id @default(autoincrement())

  perfil_id Int @unique

  titulo   String?
  conteudo String?

  atualizado_em DateTime @updatedAt

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
}

//////////////// RANKING //////////////////

model Rankings {
  ranking_id Int @id @default(autoincrement())

  perfil_id Int
  score     Int
  tipo      TipoRanking
  data_ref  DateTime

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)

  @@index([tipo, data_ref])
}

//////////////// RESTANTE //////////////////

model Categorias {
  categoria_id Int @id @default(autoincrement())
  nome String @unique

  posts PostsCategorias[]
  interessados Interesses[]
}

model Interesses {
  perfil_id Int
  categoria_id Int
  data_interesse DateTime @default(now())

  perfil    Perfis     @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)
  categoria Categorias @relation(fields: [categoria_id], references: [categoria_id], onDelete: Cascade)

  @@id([perfil_id, categoria_id])
  @@index([categoria_id])
}

model PostsCategorias {
  post_id Int
  categoria_id Int

  post      Posts      @relation(fields: [post_id], references: [post_id], onDelete: Cascade)
  categoria Categorias @relation(fields: [categoria_id], references: [categoria_id], onDelete: Cascade)

  @@id([post_id, categoria_id])
  @@index([categoria_id, post_id])
}

model Denuncias {
  denuncia_id Int @id @default(autoincrement())

  denuncia_tipo     Int
  descricao         String?
  conteudo_snapshot String
  status            DenunciaStatus @default(PENDENTE)
  data_criacao      DateTime @default(now())

  post_id   Int
  perfil_id Int

  post   Posts?  @relation(fields: [post_id], references: [post_id], onDelete: SetNull)
  perfil Perfis? @relation(fields: [perfil_id], references: [perfil_id], onDelete: SetNull)

  @@index([status])
  @@index([post_id])
  @@index([perfil_id])
}

model LogAtividade {
  log_id Int @id @default(autoincrement())

  perfil_id Int
  evento    String
  data      DateTime @default(now())
  detalhes Json?

  perfil Perfis @relation(fields: [perfil_id], references: [perfil_id], onDelete: Cascade)

  @@index([evento])
  @@index([data])
  @@index([perfil_id])
}

model Seguidores {
  seguidor_id Int
  seguido_id  Int

  data_criacao DateTime @default(now())

  seguidor Perfis @relation("quem_segue", fields: [seguidor_id], references: [perfil_id], onDelete: Cascade)
  seguido  Perfis @relation("sendo_seguido", fields: [seguido_id], references: [perfil_id], onDelete: Cascade)

  @@id([seguidor_id, seguido_id])
  @@index([seguido_id])
}