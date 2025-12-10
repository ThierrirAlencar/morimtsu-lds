import { Module } from "@nestjs/common";
import { PromotionRegistryService } from "src/core/services/promotion_registry.service";
import { PrismaService } from "src/infra/database/prisma.service";
import { PromotionRegistryController } from "../controllers/promotion_registry.controller";



@Module({
    controllers:[PromotionRegistryController],
    providers:[PrismaService, PromotionRegistryService]
})
export class promotionRegistryModule{

}