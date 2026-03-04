-- AlterTable: perfis rename column
ALTER TABLE `perfis` CHANGE COLUMN `nome` `nome_user` VARCHAR(100) NOT NULL;

-- Rename unique index to reflect new column name (if exists)
ALTER TABLE `perfis` RENAME INDEX `perfis_nome_key` TO `perfis_nome_user_key`;

-- AlterTable: usuarios add identity fields (nullable for backward compatibility)
ALTER TABLE `usuarios` 
  ADD COLUMN `nome_completo` VARCHAR(150) NULL,
  ADD COLUMN `data_nascimento` DATETIME(3) NULL,
  ADD COLUMN `nome_campus` VARCHAR(100) NULL;

-- Note: Down migration should reverse column rename and drop added columns if needed.
