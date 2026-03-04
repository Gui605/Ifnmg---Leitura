-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `cadastro_confirmado` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `expiracao_pendente` DATETIME(3) NULL,
    ADD COLUMN `expiracao_token_recuperacao` DATETIME(3) NULL,
    ADD COLUMN `token_recuperacao` VARCHAR(191) NULL,
    ADD COLUMN `token_verificacao` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Usuarios_token_verificacao_idx` ON `Usuarios`(`token_verificacao`);
