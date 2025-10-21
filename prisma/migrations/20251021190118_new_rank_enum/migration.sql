/*
  Warnings:

  - The values [WHITE,GRAY,YELLOW,ORANGE,GREEN,BLUE,PURPLE,BROWN,BLACK,RED_BLACK,RED_WHITE,RED] on the enum `Rank` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Rank_new" AS ENUM ('BRANCA', 'CINZA_BRANCA', 'CINZA', 'CINZA_PRETA', 'AMARELA_BRANCA', 'AMARELA', 'AMARELA_PRETA', 'LARANJA_BRANCA', 'LARANJA', 'LARANJA_PRETA', 'VERDE_BRANCA', 'VERDE', 'VERDE_PRETA', 'AZUL', 'ROXA', 'MARROM', 'PRETA', 'VERMELHA');
ALTER TABLE "public"."StudentForm" ALTER COLUMN "Rank" DROP DEFAULT;
ALTER TABLE "StudentForm" ALTER COLUMN "Rank" TYPE "Rank_new" USING ("Rank"::text::"Rank_new");
ALTER TYPE "Rank" RENAME TO "Rank_old";
ALTER TYPE "Rank_new" RENAME TO "Rank";
DROP TYPE "public"."Rank_old";
ALTER TABLE "StudentForm" ALTER COLUMN "Rank" SET DEFAULT 'BRANCA';
COMMIT;

-- AlterTable
ALTER TABLE "StudentForm" ALTER COLUMN "Rank" SET DEFAULT 'BRANCA';
