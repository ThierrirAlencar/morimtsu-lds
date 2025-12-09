import { Injectable } from "@nestjs/common";
import { Prisma, Rank } from "generated/prisma";
import { PrismaService } from "src/infra/database/prisma.service";

@Injectable()
export class ConfigService{
    constructor(
        private _prisma: PrismaService
    ){

    }

    async createConfigIfNotExists(data:Prisma.promotion_configCreateInput){
        const {name,ref_rank,module,needed_frequency} = data;
        const config = await this._prisma.promotion_config.findFirst({
            where:{
                ref_rank:ref_rank
            }
        });
        if(config){
            throw new Error("já existe uma configuração de promoção para o rank informado.");
        }
        return this._prisma.promotion_config.create({
            data:{
                name,
                ref_rank,
                module,
                needed_frequency
            }
        });
    }

    async getAllConfigs(){
        return this._prisma.promotion_config.findMany();
    }

    async getConfigByRank(ref_rank:Rank){
        return this._prisma.promotion_config.findFirst({
            where:{
                ref_rank:ref_rank
            }
        });
    }

    async getConfigById(Id:string){
        return this._prisma.promotion_config.findFirst({
            where:{
                id:Id
            }
        });
    }
    async deleteConfigById(id:string){
        return this._prisma.promotion_config.delete({
            where:{
                id:id
            }
        });
    }

    async deleteConfigByRank(ref_rank:Rank){
        return this._prisma.promotion_config.deleteMany({
            where:{
                ref_rank:ref_rank
            }
        });
    }

    async updateConfigById(id:string,data:Partial<Prisma.promotion_configUpdateInput>){
        return this._prisma.promotion_config.update({
            where:{
                id:id
            },
            data:data
        });
    }
}