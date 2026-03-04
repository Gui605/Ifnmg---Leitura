-- CreateTable
CREATE TABLE `Posts` (
    `post_id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(255) NOT NULL,
    `conteudo` TEXT NOT NULL,
    `data_criacao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `autor_id` INTEGER NULL,

    INDEX `Posts_autor_id_idx`(`autor_id`),
    PRIMARY KEY (`post_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Posts` ADD CONSTRAINT `Posts_autor_id_fkey` FOREIGN KEY (`autor_id`) REFERENCES `Perfis`(`perfil_id`) ON DELETE SET NULL ON UPDATE CASCADE;
