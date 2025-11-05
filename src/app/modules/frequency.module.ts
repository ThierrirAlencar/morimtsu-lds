import { Module } from "@nestjs/common";
import { classService } from "src/core/services/class.service";
import { PrismaService } from "src/infra/database/prisma.service";
import { classController } from "../controllers/class.controller";
import { frequencyService } from "src/core/services/frequency.service";

@Module({
    controllers:[classController],
    providers:[frequencyService,PrismaService]
})
export class frequencyModule{}