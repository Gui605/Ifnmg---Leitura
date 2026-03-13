-- AlterTable
ALTER TABLE `posts` ADD COLUMN `autor_nome_user` VARCHAR(100) NULL;

-- CreateTable
CREATE TABLE `seguidores` (
    `seguidor_id` INTEGER NOT NULL,
    `seguido_id` INTEGER NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `seguidores_seguido_id_idx`(`seguido_id`),
    PRIMARY KEY (`seguidor_id`, `seguido_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `posts_data_criacao_total_upvotes_idx` ON `posts`(`data_criacao`, `total_upvotes`);

-- CreateIndex
CREATE INDEX `votos_data_idx` ON `votos`(`data`);

-- AddForeignKey
ALTER TABLE `seguidores` ADD CONSTRAINT `seguidores_seguidor_id_fkey` FOREIGN KEY (`seguidor_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `seguidores` ADD CONSTRAINT `seguidores_seguido_id_fkey` FOREIGN KEY (`seguido_id`) REFERENCES `perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;
