-- DropForeignKey
ALTER TABLE "public"."StudentForm" DROP CONSTRAINT "StudentForm_userId_fkey";

-- AlterTable
ALTER TABLE "StudentForm" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "StudentForm" ADD CONSTRAINT "StudentForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
