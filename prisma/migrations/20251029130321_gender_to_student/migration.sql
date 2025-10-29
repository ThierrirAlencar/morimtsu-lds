/*
  Warnings:

  - Added the required column `gender` to the `student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "gender" "Gender" NOT NULL;
