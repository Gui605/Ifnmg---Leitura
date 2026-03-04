/*
  Warnings:

  - You are about to alter the column `nome` on the `categorias` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `nome` on the `perfis` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `email` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(150)`.
  - You are about to alter the column `token_recuperacao` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to alter the column `token_verificacao` on the `usuarios` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(100)`.
  - You are about to drop the `postscategorias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `interesses` DROP FOREIGN KEY `Interesses_categoria_id_fkey`;

-- DropForeignKey
ALTER TABLE `interesses` DROP FOREIGN KEY `Interesses_perfil_id_fkey`;

-- DropForeignKey
ALTER TABLE `posts` DROP FOREIGN KEY `Posts_autor_id_fkey`;

-- DropForeignKey
ALTER TABLE `postscategorias` DROP FOREIGN KEY `PostsCategorias_categoria_id_fkey`;

-- DropForeignKey
ALTER TABLE `postscategorias` DROP FOREIGN KEY `PostsCategorias_post_id_fkey`;

-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `Usuarios_perfil_id_fkey`;

-- AlterTable
ALTER TABLE `categorias` MODIFY `nome` VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE `perfis` MODIFY `nome` VARCHAR(100) NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` MODIFY `email` VARCHAR(150) NOT NULL,
    MODIFY `password_hash` VARCHAR(255) NOT NULL,
    MODIFY `token_recuperacao` VARCHAR(100) NULL,
    MODIFY `token_verificacao` VARCHAR(100) NULL;

-- DropTable
DROP TABLE `postscategorias`;

-- CreateTable
CREATE TABLE `posts_categorias` (
    `post_id` INTEGER NOT NULL,
    `categoria_id` INTEGER NOT NULL,

    INDEX `posts_categorias_categoria_id_idx`(`categoria_id`),
    PRIMARY KEY (`post_id`, `categoria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `usuarios_email_idx` ON `usuarios`(`email`);

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interesses` ADD CONSTRAINT `interesses_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interesses` ADD CONSTRAINT `interesses_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts_categorias` ADD CONSTRAINT `posts_categorias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts_categorias` ADD CONSTRAINT `posts_categorias_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `posts` ADD CONSTRAINT `posts_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `categorias` RENAME INDEX `Categorias_nome_key` TO `categorias_nome_key`;

-- RenameIndex
ALTER TABLE `interesses` RENAME INDEX `Interesses_categoria_id_idx` TO `interesses_categoria_id_idx`;

-- RenameIndex
ALTER TABLE `perfis` RENAME INDEX `Perfis_nome_key` TO `perfis_nome_key`;

-- RenameIndex
ALTER TABLE `posts` RENAME INDEX `Posts_autor_id_idx` TO `posts_autor_id_idx`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `Usuarios_email_key` TO `usuarios_email_key`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `Usuarios_perfil_id_key` TO `usuarios_perfil_id_key`;

-- RenameIndex
ALTER TABLE `usuarios` RENAME INDEX `Usuarios_token_verificacao_idx` TO `usuarios_token_verificacao_idx`;
