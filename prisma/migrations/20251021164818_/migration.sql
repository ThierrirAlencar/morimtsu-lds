/*
  Warnings:

  - The values [BASIC,INTERMEDIATE,ADVANCED] on the enum `Rank` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rank_new" AS ENUM ('WHITE', 'GRAY', 'YELLOW', 'ORANGE', 'GREEN', 'BLUE', 'PURPLE', 'BROWN', 'BLACK', 'RED_BLACK', 'RED_WHITE', 'RED');
ALTER TABLE "public"."StudentForm" ALTER COLUMN "Rank" DROP DEFAULT;
ALTER TABLE "StudentForm" ALTER COLUMN "Rank" TYPE "Rank_new" USING ("Rank"::text::"Rank_new");
ALTER TYPE "Rank" RENAME TO "Rank_old";
ALTER TYPE "Rank_new" RENAME TO "Rank";
DROP TYPE "public"."Rank_old";
ALTER TABLE "StudentForm" ALTER COLUMN "Rank" SET DEFAULT 'WHITE';
COMMIT;

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "endTime" TIME,
ADD COLUMN     "startTime" TIME;

-- AlterTable
ALTER TABLE "StudentForm" ALTER COLUMN "Rank" SET DEFAULT 'WHITE';

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "parentContact" TEXT,
ADD COLUMN     "parentName" TEXT;
