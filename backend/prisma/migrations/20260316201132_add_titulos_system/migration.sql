/*
  Warnings:

  - Made the column `autor_id` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `posts_autor_id_fkey`;

-- AlterTable
ALTER TABLE `perfis` ADD COLUMN `bio` VARCHAR(255) NULL,
    ADD COLUMN `level` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `titulo_ativo` VARCHAR(50) NULL,
    ADD COLUMN `xp` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `posts` ADD COLUMN `nome_campus` VARCHAR(100) NULL,
    MODIFY `autor_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `titulos` (
    `titulo_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(50) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `categoria` VARCHAR(30) NOT NULL,
    `requisito` INTEGER NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `titulos_nome_key`(`nome`),
    PRIMARY KEY (`titulo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `perfis_titulos` (
    `perfil_id` INTEGER NOT NULL,
    `titulo_id` INTEGER NOT NULL,
    `atribuido_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `esta_ativo` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`perfil_id`, `titulo_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `perfis_titulos` ADD CONSTRAINT `perfis_titulos_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `perfis_titulos` ADD CONSTRAINT `perfis_titulos_titulo_id_fkey` FOREIGN KEY (`titulo_id`) REFERENCES `titulos`(`titulo_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;
