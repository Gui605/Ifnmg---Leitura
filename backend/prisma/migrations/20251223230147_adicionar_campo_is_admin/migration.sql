/*
  Warnings:

  - A unique constraint covering the columns `[token_recuperacao]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `is_admin` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX `usuarios_token_recuperacao_key` ON `usuarios`(`token_recuperacao`);

-- CreateIndex
CREATE INDEX `usuarios_token_recuperacao_idx` ON `usuarios`(`token_recuperacao`);
