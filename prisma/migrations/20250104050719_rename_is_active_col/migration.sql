/*
  Warnings:

  - You are about to drop the column `isActive` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user"
RENAME COLUMN "isActive" TO "is_active" ;
