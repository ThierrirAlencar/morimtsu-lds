import { Module } from "@nestjs/common";
import { dashboardController } from "../controllers/dashboard.controller";
import { DataService } from "src/core/services/data.service";



@Module({
    controllers:[dashboardController],
    providers:[DataService],
})
export class dashboardModule{}