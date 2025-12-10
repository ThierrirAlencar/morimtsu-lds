import { Module } from "@nestjs/common";
import { dashboardController } from "../controllers/dashboard.controller";
import { DataService } from "src/core/services/data.service";
import { PrismaService } from "src/infra/database/prisma.service";



@Module({
    controllers:[dashboardController],
    providers:[DataService, PrismaService],
})
export class dashboardModule{}