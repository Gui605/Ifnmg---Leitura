-- AlterTable
ALTER TABLE `posts` ADD COLUMN `total_comentarios` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_downvotes` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_upvotes` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `votos` (
    `voto_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `tipo` ENUM('UP', 'DOWN') NOT NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `votos_post_id_idx`(`post_id`),
    INDEX `votos_perfil_id_idx`(`perfil_id`),
    INDEX `votos_post_id_tipo_idx`(`post_id`, `tipo`),
    UNIQUE INDEX `votos_perfil_id_post_id_key`(`perfil_id`, `post_id`),
    PRIMARY KEY (`voto_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios` (
    `comentario_id` INTEGER NOT NULL AUTO_INCREMENT,
    `texto` TEXT NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `perfil_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,

    INDEX `comentarios_post_id_idx`(`post_id`),
    INDEX `comentarios_perfil_id_idx`(`perfil_id`),
    INDEX `comentarios_data_criacao_idx`(`data_criacao`),
    PRIMARY KEY (`comentario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `denuncias` (
    `denuncia_id` INTEGER NOT NULL AUTO_INCREMENT,
    `motivo` VARCHAR(200) NOT NULL,
    `status` ENUM('PENDENTE', 'ANALISADO', 'REJEITADO') NOT NULL DEFAULT 'PENDENTE',
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `post_id` INTEGER NOT NULL,
    `perfil_id` INTEGER NOT NULL,

    INDEX `denuncias_status_idx`(`status`),
    INDEX `denuncias_post_id_idx`(`post_id`),
    INDEX `denuncias_perfil_id_idx`(`perfil_id`),
    PRIMARY KEY (`denuncia_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `log_atividade` (
    `log_id` INTEGER NOT NULL AUTO_INCREMENT,
    `perfil_id` INTEGER NOT NULL,
    `evento` VARCHAR(50) NOT NULL,
    `detalhes` JSON NULL,
    `data` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `log_atividade_perfil_id_idx`(`perfil_id`),
    INDEX `log_atividade_data_idx`(`data`),
    INDEX `log_atividade_evento_idx`(`evento`),
    PRIMARY KEY (`log_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `posts_data_criacao_idx` ON `posts`(`data_criacao`);

-- CreateIndex
CREATE INDEX `posts_total_upvotes_idx` ON `posts`(`total_upvotes`);

-- AddForeignKey
ALTER TABLE `votos` ADD CONSTRAINT `votos_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `votos` ADD CONSTRAINT `votos_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `denuncias` ADD CONSTRAINT `denuncias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `denuncias` ADD CONSTRAINT `denuncias_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `log_atividade` ADD CONSTRAINT `log_atividade_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;
