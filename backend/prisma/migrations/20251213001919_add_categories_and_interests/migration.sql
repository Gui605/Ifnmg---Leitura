-- CreateTable
CREATE TABLE `Categorias` (
    `categoria_id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `Categorias_nome_key`(`nome`),
    PRIMARY KEY (`categoria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interesses` (
    `perfil_id` INTEGER NOT NULL,
    `categoria_id` INTEGER NOT NULL,
    `data_interesse` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Interesses_categoria_id_idx`(`categoria_id`),
    PRIMARY KEY (`perfil_id`, `categoria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PostsCategorias` (
    `post_id` INTEGER NOT NULL,
    `categoria_id` INTEGER NOT NULL,

    INDEX `PostsCategorias_categoria_id_idx`(`categoria_id`),
    PRIMARY KEY (`post_id`, `categoria_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Interesses` ADD CONSTRAINT `Interesses_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `Perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interesses` ADD CONSTRAINT `Interesses_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `Categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostsCategorias` ADD CONSTRAINT `PostsCategorias_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `Posts`(`post_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PostsCategorias` ADD CONSTRAINT `PostsCategorias_categoria_id_fkey` FOREIGN KEY (`categoria_id`) REFERENCES `Categorias`(`categoria_id`) ON DELETE CASCADE ON UPDATE CASCADE;
