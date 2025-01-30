/*
  Warnings:

  - You are about to drop the column `fk_user_id` on the `pod` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "pod_idx";

-- AlterTable
ALTER TABLE "pod" DROP COLUMN "fk_user_id";
