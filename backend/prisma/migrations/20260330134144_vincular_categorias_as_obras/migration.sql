/*
  Warnings:

  - You are about to alter the column `descricao` on the `denuncias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(500)` to `VarChar(191)`.
  - You are about to drop the `log_atividade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts_categorias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `comentarios` DROP FOREIGN KEY `comentarios_perfil_id_fkey`;

-- DropForeignKey
ALTER TABLE `comentarios` DROP FOREIGN KEY `comentarios_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `denuncias` DROP FOREIGN KEY `denuncias_perfil_id_fkey`;

-- DropForeignKey
ALTER TABLE `denuncias` DROP FOREIGN KEY `denuncias_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `interesses` DROP FOREIGN KEY `interesses_categoria_id_fkey`;

-- DropForeignKey
ALTER TABLE `interesses` DROP FOREIGN KEY `interesses_perfil_id_fkey`;

-- DropForeignKey
ALTER TABLE `log_atividade` DROP FOREIGN KEY `log_atividade_perfil_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_autor_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts_categorias` DROP FOREIGN KEY `posts_categorias_categoria_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts_categorias` DROP FOREIGN KEY `posts_categorias_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `seguidores` DROP FOREIGN KEY `seguidores_seguido_id_fkey`;

-- DropForeignKey
ALTER TABLE `seguidores` DROP FOREIGN KEY `seguidores_seguidor_id_fkey`;

-- DropForeignKey
ALTER TABLE `votos` DROP FOREIGN KEY `votos_perfil_id_fkey`;

-- DropForeignKey
ALTER TABLE `votos` DROP FOREIGN KEY `votos_post_id_fkey`;

-- DropIndex
DROP INDEX `posts_autor_id_idx` ON `posts`;

-- DropIndex
DROP INDEX `posts_data_criacao_total_upvotes_idx` ON `posts`;

-- DropIndex
DROP INDEX `posts_total_upvotes_idx` ON `posts`;

-- AlterTable
ALTER TABLE `categorias` MODIFY `nome` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `comentarios` ADD COLUMN `parent_id` INTEGER NULL,
    MODIFY `perfil_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `denuncias` MODIFY `post_id` INTEGER NULL,
    MODIFY `perfil_id` INTEGER NULL,
    MODIFY `conteudo_snapshot` VARCHAR(191) NOT NULL,
    MODIFY `descricao` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `perfis` ADD COLUMN `curso` VARCHAR(100) NULL,
    ADD COLUMN `streak_dias` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `ultimo_login` DATETIME(3) NULL,
    ADD COLUMN `xp_curadoria` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `xp_escrita` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `xp_social` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `comunidade_id` INTEGER NULL,
    ADD COLUMN `idioma` VARCHAR(20) NULL,
    ADD COLUMN `obra_id` INTEGER NULL,
    ADD COLUMN `ordem` INTEGER NULL,
    ADD COLUMN `score_ranking` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `score_trending` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('ANDAMENTO', 'CONCLUIDO') NOT NULL DEFAULT 'ANDAMENTO',
    ADD COLUMN `visualizacoes` INTEGER NOT NULL DEFAULT 0,
    MODIFY `autor_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `nome_completo` VARCHAR(191) NULL,
    MODIFY `nome_campus` VARCHAR(191) NULL;

-- DropTable
DROP TABLE `log_atividade`;

-- DropTable
DROP TABLE `posts_categorias`;

-- CreateTable
CREATE TABLE `Comunidades` (
    `comunidade_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `criador_id` INTEGER NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Comunidades_nome_key`(`nome`),
    INDEX `Comunidades_criador_id_idx`(`criador_id`),
    PRIMARY KEY (`comunidade_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComunidadeMembros` (
    `perfil_id` INTEGER NOT NULL,
    `comunidade_id` INTEGER NOT NULL,
    `role` ENUM('MEMBRO', 'MODERADOR', 'ADMIN', 'DONO') NOT NULL DEFAULT 'MEMBRO',
    `entrou_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ComunidadeMembros_comunidade_id_role_idx`(`comunidade_id`, `role`),
    PRIMARY KEY (`perfil_id`, `comunidade_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComunidadeBans` (
    `perfil_id` INTEGER NOT NULL,
    `comunidade_id` INTEGER NOT NULL,
    `motivo` VARCHAR(255) NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`perfil_id`, `comunidade_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ComunidadeConfig` (
    `comunidade_id` INTEGER NOT NULL,
    `privada` BOOLEAN NOT NULL DEFAULT false,
    `somente_admin_post` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`comunidade_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Obras` (
    `obra_id` INTEGER NOT NULL AUTO_INCREMENT,
    `autor_id` INTEGER NULL,
    `titulo` VARCHAR(191) NOT NULL,
    `descricao` VARCHAR(191) NULL,
    `imagem_capa` VARCHAR(191) NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Obras_autor_id_idx`(`autor_id`),
    PRIMARY KEY (`obra_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ObrasCategorias` (
    `obra_id` INTEGER NOT NULL,
    `categoria_id` INTEGER NOT NULL,

    INDEX `ObrasCategorias_categoria_id_obra_id_idx`(`categoria_id`, `obra_id`),
    PRIMARY KEY (`obra_id`, `categoria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reacoes` (
    `reacao_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `tipo` ENUM('LIKE', 'LOVE', 'FIRE', 'SAD') NOT NULL,

    INDEX `Reacoes_post_id_tipo_idx`(`post_id`, `tipo`),
    UNIQUE INDEX `Reacoes_perfil_id_post_id_tipo_key`(`perfil_id`, `post_id`, `tipo`),
    PRIMARY KEY (`reacao_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reposts` (
    `repost_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,

    UNIQUE INDEX `Reposts_perfil_id_post_id_key`(`perfil_id`, `post_id`),
    PRIMARY KEY (`repost_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favoritos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,

    UNIQUE INDEX `Favoritos_perfil_id_post_id_key`(`perfil_id`, `post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeituraProgresso` (
    `perfil_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `concluido` BOOLEAN NOT NULL DEFAULT false,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`perfil_id`, `post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Midias` (
    `midia_id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `tipo` ENUM('IMAGE', 'VIDEO') NOT NULL,

    INDEX `Midias_post_id_idx`(`post_id`),
    PRIMARY KEY (`midia_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notificacoes` (
    `notificacao_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `tipo` ENUM('LIKE', 'COMMENT', 'FOLLOW', 'REPOST') NOT NULL,
    `post_id` INTEGER NULL,
    `comentario_id` INTEGER NULL,
    `autor_id` INTEGER NULL,
    `lida` BOOLEAN NOT NULL DEFAULT false,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notificacoes_perfil_id_lida_idx`(`perfil_id`, `lida`),
    PRIMARY KEY (`notificacao_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rascunhos` (
    `rascunho_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `titulo` VARCHAR(191) NULL,
    `conteudo` VARCHAR(191) NULL,
    `atualizado_em` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Rascunhos_perfil_id_key`(`perfil_id`),
    PRIMARY KEY (`rascunho_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rankings` (
    `ranking_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `tipo` ENUM('GLOBAL', 'SEMANAL', 'CURSO') NOT NULL,
    `data_ref` DATETIME(3) NOT NULL,

    INDEX `Rankings_tipo_data_ref_idx`(`tipo`, `data_ref`),
    PRIMARY KEY (`ranking_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostsCategorias` (
    `post_id` INTEGER NOT NULL,
    `categoria_id` INTEGER NOT NULL,

    INDEX `PostsCategorias_categoria_id_post_id_idx`(`categoria_id`, `post_id`),
    PRIMARY KEY (`post_id`, `categoria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LogAtividade` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `evento` VARCHAR(191) NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `detalhes` JSON NULL,

    INDEX `LogAtividade_evento_idx`(`evento`),
    INDEX `LogAtividade_data_idx`(`data`),
    INDEX `LogAtividade_perfil_id_idx`(`perfil_id`),
    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conquistas` (
    `conquista_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `icone` VARCHAR(100) NULL,

    UNIQUE INDEX `conquistas_nome_key`(`nome`),
    PRIMARY KEY (`conquista_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis_conquistas` (
    `perfil_id` INTEGER NOT NULL,
    `conquista_id` INTEGER NOT NULL,
    `ganha_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`perfil_id`, `conquista_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Comentarios_parent_id_idx` ON `Comentarios`(`parent_id`);

-- CreateIndex
CREATE INDEX `Posts_autor_id_data_criacao_idx` ON `Posts`(`autor_id`, `data_criacao`);

-- CreateIndex
CREATE INDEX `Posts_comunidade_id_data_criacao_idx` ON `Posts`(`comunidade_id`, `data_criacao`);

-- CreateIndex
CREATE INDEX `Posts_comunidade_id_score_ranking_idx` ON `Posts`(`comunidade_id`, `score_ranking`);

-- CreateIndex
CREATE INDEX `Posts_comunidade_id_score_trending_idx` ON `Posts`(`comunidade_id`, `score_trending`);

-- CreateIndex
CREATE INDEX `Posts_score_ranking_idx` ON `Posts`(`score_ranking`);

-- CreateIndex
CREATE INDEX `Posts_score_trending_idx` ON `Posts`(`score_trending`);

-- CreateIndex
CREATE INDEX `Posts_obra_id_ordem_idx` ON `Posts`(`obra_id`, `ordem`);

-- CreateIndex
CREATE INDEX `Posts_data_criacao_score_ranking_idx` ON `Posts`(`data_criacao`, `score_ranking`);

-- AddForeignKey
ALTER TABLE `Comunidades` ADD CONSTRAINT `Comunidades_criador_id_fkey` FOREIGN KEY (`criador_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComunidadeMembros` ADD CONSTRAINT `ComunidadeMembros_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComunidadeMembros` ADD CONSTRAINT `ComunidadeMembros_comunidade_id_fkey` FOREIGN KEY (`comunidade_id`) REFERENCES `Comunidades`(`comunidade_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComunidadeBans` ADD CONSTRAINT `ComunidadeBans_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComunidadeBans` ADD CONSTRAINT `ComunidadeBans_comunidade_id_fkey` FOREIGN KEY (`comunidade_id`) REFERENCES `Comunidades`(`comunidade_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ComunidadeConfig` ADD CONSTRAINT `ComunidadeConfig_comunidade_id_fkey` FOREIGN KEY (`comunidade_id`) REFERENCES `Comunidades`(`comunidade_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Obras` ADD CONSTRAINT `Obras_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ObrasCategorias` ADD CONSTRAINT `ObrasCategorias_obra_id_fkey` FOREIGN KEY (`obra_id`) REFERENCES `Obras`(`obra_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ObrasCategorias` ADD CONSTRAINT `ObrasCategorias_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `Categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_comunidade_id_fkey` FOREIGN KEY (`comunidade_id`) REFERENCES `Comunidades`(`comunidade_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_obra_id_fkey` FOREIGN KEY (`obra_id`) REFERENCES `Obras`(`obra_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Votos` ADD CONSTRAINT `Votos_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Votos` ADD CONSTRAINT `Votos_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reacoes` ADD CONSTRAINT `Reacoes_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reacoes` ADD CONSTRAINT `Reacoes_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reposts` ADD CONSTRAINT `Reposts_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reposts` ADD CONSTRAINT `Reposts_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favoritos` ADD CONSTRAINT `Favoritos_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favoritos` ADD CONSTRAINT `Favoritos_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentarios` ADD CONSTRAINT `Comentarios_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentarios` ADD CONSTRAINT `Comentarios_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comentarios` ADD CONSTRAINT `Comentarios_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Comentarios`(`comentario_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeituraProgresso` ADD CONSTRAINT `LeituraProgresso_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeituraProgresso` ADD CONSTRAINT `LeituraProgresso_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Midias` ADD CONSTRAINT `Midias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacoes` ADD CONSTRAINT `Notificacoes_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rascunhos` ADD CONSTRAINT `Rascunhos_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rankings` ADD CONSTRAINT `Rankings_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interesses` ADD CONSTRAINT `Interesses_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interesses` ADD CONSTRAINT `Interesses_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `Categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostsCategorias` ADD CONSTRAINT `PostsCategorias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostsCategorias` ADD CONSTRAINT `PostsCategorias_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `Categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncias` ADD CONSTRAINT `Denuncias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Denuncias` ADD CONSTRAINT `Denuncias_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LogAtividade` ADD CONSTRAINT `LogAtividade_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seguidores` ADD CONSTRAINT `Seguidores_seguidor_id_fkey` FOREIGN KEY (`seguidor_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seguidores` ADD CONSTRAINT `Seguidores_seguido_id_fkey` FOREIGN KEY (`seguido_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_conquistas` ADD CONSTRAINT `perfis_conquistas_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_conquistas` ADD CONSTRAINT `perfis_conquistas_conquista_id_fkey` FOREIGN KEY (`conquista_id`) REFERENCES `conquistas`(`conquista_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `categorias` RENAME INDEX `categorias_nome_key` TO `Categorias_nome_key`;

-- RenameIndex
ALTER TABLE `comentarios` RENAME INDEX `comentarios_data_criacao_idx` TO `Comentarios_data_criacao_idx`;

-- RenameIndex
ALTER TABLE `comentarios` RENAME INDEX `comentarios_perfil_id_idx` TO `Comentarios_perfil_id_idx`;

-- RenameIndex
ALTER TABLE `comentarios` RENAME INDEX `comentarios_post_id_idx` TO `Comentarios_post_id_idx`;

-- RenameIndex
ALTER TABLE `denuncias` RENAME INDEX `denuncias_perfil_id_idx` TO `Denuncias_perfil_id_idx`;

-- RenameIndex
ALTER TABLE `denuncias` RENAME INDEX `denuncias_post_id_idx` TO `Denuncias_post_id_idx`;

-- RenameIndex
ALTER TABLE `denuncias` RENAME INDEX `denuncias_status_idx` TO `Denuncias_status_idx`;

-- RenameIndex
ALTER TABLE `interesses` RENAME INDEX `interesses_categoria_id_idx` TO `Interesses_categoria_id_idx`;

-- RenameIndex
ALTER TABLE `posts` RENAME INDEX `posts_data_criacao_idx` TO `Posts_data_criacao_idx`;

-- RenameIndex
ALTER TABLE `seguidores` RENAME INDEX `seguidores_seguido_id_idx` TO `Seguidores_seguido_id_idx`;

-- RenameIndex
ALTER TABLE `votos` RENAME INDEX `votos_data_idx` TO `Votos_data_idx`;

-- RenameIndex
ALTER TABLE `votos` RENAME INDEX `votos_perfil_id_idx` TO `Votos_perfil_id_idx`;

-- RenameIndex
ALTER TABLE `votos` RENAME INDEX `votos_perfil_id_post_id_key` TO `Votos_perfil_id_post_id_key`;

-- RenameIndex
ALTER TABLE `votos` RENAME INDEX `votos_post_id_tipo_idx` TO `Votos_post_id_tipo_idx`;
