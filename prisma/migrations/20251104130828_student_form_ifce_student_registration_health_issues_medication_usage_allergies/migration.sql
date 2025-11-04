/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `StudentForm` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `StudentForm` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudentForm" ADD COLUMN     "Allergies" TEXT,
ADD COLUMN     "Health_issues" TEXT,
ADD COLUMN     "IFCE_student_registration" TEXT,
ADD COLUMN     "Medication_usage" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "StudentForm_userId_key" ON "StudentForm"("userId");

-- AddForeignKey
ALTER TABLE "StudentForm" ADD CONSTRAINT "StudentForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
