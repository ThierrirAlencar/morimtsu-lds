import { Module } from "@nestjs/common";
import { EventsController } from "../controllers/events.controller";
import { PrismaService } from "src/infra/database/prisma.service";
import { EventsService } from "src/core/services/events.service";

@Module({
    imports:[],
    controllers:[EventsController],
    providers:[PrismaService, EventsService],
    exports:[EventsService]
})
export class EventModule{}