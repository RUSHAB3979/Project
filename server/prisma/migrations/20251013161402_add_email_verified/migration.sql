/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `email_verified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `google_id` VARCHAR(191) NULL,
    MODIFY `password_hash` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_google_id_key` ON `User`(`google_id`);
