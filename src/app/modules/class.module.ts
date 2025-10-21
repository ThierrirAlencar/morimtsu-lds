import { Module } from "@nestjs/common";
import { classService } from "src/core/services/class.service";
import { PrismaService } from "src/infra/database/prisma.service";

@Module({
    providers:[classService,PrismaService]
})
export class classModule{

}