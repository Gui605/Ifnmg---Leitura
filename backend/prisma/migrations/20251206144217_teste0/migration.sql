-- CreateTable
CREATE TABLE `Perfis` (
    `perfil_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(191) NOT NULL,
    `score_karma` INTEGER NOT NULL DEFAULT 0,
    `reading_points` INTEGER NOT NULL DEFAULT 0,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Perfis_nome_key`(`nome`),
    PRIMARY KEY (`perfil_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Usuarios` (
    `usuario_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `perfil_id` INTEGER NOT NULL,

    UNIQUE INDEX `Usuarios_email_key`(`email`),
    UNIQUE INDEX `Usuarios_perfil_id_key`(`perfil_id`),
    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `Perfis`(`perfil_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
