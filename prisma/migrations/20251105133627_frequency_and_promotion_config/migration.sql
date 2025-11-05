-- CreateTable
CREATE TABLE "Frequency" (
    "id" TEXT NOT NULL,
    "Date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,
    "class_id" TEXT NOT NULL,

    CONSTRAINT "Frequency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_config" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL DEFAULT 'app',
    "ref_rank" "Rank" NOT NULL,
    "needed_frequency" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "promotion_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotion_config_name_key" ON "promotion_config"("name");

-- AddForeignKey
ALTER TABLE "Frequency" ADD CONSTRAINT "Frequency_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Frequency" ADD CONSTRAINT "Frequency_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
