-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "public"."Rank" AS ENUM ('BASIC', 'INTERMEDIATE', 'ADVANCED');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'USER',
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Class" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nickname" TEXT,
    "Contact" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "CPF" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."StudentForm" (
    "id" TEXT NOT NULL,
    "Rating" INTEGER NOT NULL DEFAULT 0,
    "Presence" INTEGER NOT NULL DEFAULT 0,
    "Comments" TEXT,
    "Rank" "public"."Rank" NOT NULL DEFAULT 'BASIC',
    "studentId" TEXT NOT NULL,

    CONSTRAINT "StudentForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserClasses" (
    "userId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "UserClasses_pkey" PRIMARY KEY ("userId","classId")
);

-- CreateTable
CREATE TABLE "public"."StudentClasses" (
    "studentId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,

    CONSTRAINT "StudentClasses_pkey" PRIMARY KEY ("studentId","classId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "public"."User"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "public"."Class"("name");

-- CreateIndex
CREATE UNIQUE INDEX "student_email_key" ON "public"."student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "student_CPF_key" ON "public"."student"("CPF");

-- CreateIndex
CREATE UNIQUE INDEX "StudentForm_studentId_key" ON "public"."StudentForm"("studentId");

-- AddForeignKey
ALTER TABLE "public"."StudentForm" ADD CONSTRAINT "StudentForm_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserClasses" ADD CONSTRAINT "UserClasses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserClasses" ADD CONSTRAINT "UserClasses_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentClasses" ADD CONSTRAINT "StudentClasses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "public"."student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StudentClasses" ADD CONSTRAINT "StudentClasses_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
