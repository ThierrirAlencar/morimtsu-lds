import { Module } from "@nestjs/common";
import { StudentController } from "../controllers/student.controller";
import { PrismaService } from "src/infra/database/prisma.service";
import { studentServices } from "src/core/services/students.service";



@Module({
    controllers:[StudentController],
    providers:[PrismaService,studentServices]
})
export class studentModule{}