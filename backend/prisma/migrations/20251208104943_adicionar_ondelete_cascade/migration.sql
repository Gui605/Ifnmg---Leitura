-- DropForeignKey
ALTER TABLE `usuarios` DROP FOREIGN KEY `Usuarios_perfil_id_fkey`;

-- AddForeignKey
ALTER TABLE `Usuarios` ADD CONSTRAINT `Usuarios_perfil_id_fkey` FOREIGN KEY (`perfil_id`) REFERENCES `Perfis`(`perfil_id`) ON DELETE CASCADE ON UPDATE CASCADE;
