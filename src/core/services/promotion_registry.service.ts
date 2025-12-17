import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/database/prisma.service";


@Injectable()
export class PromotionRegistryService {
    constructor(private _prisma:PrismaService) {}

    async getAll(){
        const registry = await this._prisma.promotion_registry.findMany()

        return await Promise.all(registry.map(async e=>{
            const student = await this._prisma.student.findUnique({
                where:{
                    id:e.student_id
                }
            })

            return{
                ...e,
                student_name:student.name
            }
        }));
    }
} 