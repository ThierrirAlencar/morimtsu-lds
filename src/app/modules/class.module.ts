import { Module } from "@nestjs/common";
import { classService } from "src/core/services/class.service";
import { PrismaService } from "src/infra/database/prisma.service";
import { classController } from "../controllers/class.controller";

@Module({
    controllers:[classController]
    providers:[classService,PrismaService]
})
export class classModule{

}