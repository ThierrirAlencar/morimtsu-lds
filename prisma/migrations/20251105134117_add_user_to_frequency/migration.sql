/*
  Warnings:

  - Added the required column `coach_id` to the `Frequency` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Frequency" ADD COLUMN     "coach_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Frequency" ADD CONSTRAINT "Frequency_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
