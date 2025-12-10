-- CreateTable
CREATE TABLE "promotion_registry" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "student_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "from_rank" "Rank" NOT NULL,
    "to_rank" "Rank" NOT NULL,

    CONSTRAINT "promotion_registry_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "promotion_registry" ADD CONSTRAINT "promotion_registry_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_registry" ADD CONSTRAINT "promotion_registry_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
