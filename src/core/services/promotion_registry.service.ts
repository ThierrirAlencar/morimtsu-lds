import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/database/prisma.service";


@Injectable()
export class PromotionRegistryService {
    constructor(private _prisma:PrismaService) {}

    async getAll(){
        return this._prisma.promotion_registry.findMany();
    }
} 