/*
  Warnings:

  - You are about to drop the column `motivo` on the `denuncias` table. All the data in the column will be lost.
  - Added the required column `conteudo_snapshot` to the `denuncias` table without a default value. This is not possible if the table is not empty.
  - Added the required column `denuncia_tipo` to the `denuncias` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `denuncias` DROP COLUMN `motivo`,
    ADD COLUMN `conteudo_snapshot` TEXT NOT NULL,
    ADD COLUMN `denuncia_tipo` INTEGER NOT NULL,
    ADD COLUMN `descricao` VARCHAR(500) NULL;
