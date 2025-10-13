-- AlterTable
ALTER TABLE `SkillRequest` RENAME COLUMN `requesterId` TO `student_id`;
ALTER TABLE `SkillRequest` RENAME COLUMN `teacherId` TO `tutor_id`;
ALTER TABLE `SkillRequest` ADD COLUMN `tutor_message` TEXT NULL;
ALTER TABLE `SkillRequest` ADD COLUMN `duration` INTEGER NOT NULL DEFAULT 30;
ALTER TABLE `SkillRequest` ADD COLUMN `cost` INTEGER NOT NULL DEFAULT 30;