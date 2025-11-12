import { Module } from "@nestjs/common";
import { classService } from "src/core/services/class.service";
import { PrismaService } from "src/infra/database/prisma.service";
import { classController } from "../controllers/class.controller";
import { frequencyService } from "src/core/services/frequency.service";
import { frequencyController } from "../controllers/frequency.controller";

@Module({
    controllers:[frequencyController],
    providers:[frequencyService,PrismaService]
})
export class frequencyModule{}