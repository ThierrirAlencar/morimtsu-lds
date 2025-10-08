import { Injectable } from "@nestjs/common";
import { base_repository } from "src/core/domain/repositories/prisma/baseRepository";
import { BaseModel, PrismaService } from "../../../infra/db/prismaService";
import { base_repository_interface } from "src/core/domain/repositories/baseRepository";
import { Prisma } from "generated/prisma";



@Injectable()
export class base_service<
    T extends keyof Prisma.TypeMap['model'],
    CreateInput = Prisma.TypeMap['model'][T] extends { create: { args: { data: any } } } 
        ? Prisma.TypeMap['model'][T]['create']['args']['data'] 
        : never,
    UpdateInput = Prisma.TypeMap['model'][T] extends { update: { args: { data: any } } }
        ? Prisma.TypeMap['model'][T]['update']['args']['data']
        : never
>{

    constructor(
        private baseRepository:base_repository_interface , 
        private Model:BaseModel<T> ,
        private prisma:PrismaService
    ){}

    async create(data:CreateInput):Promise<BaseModel<any>>{
        return await this.baseRepository.create(data);
    }
    async findById(id:string):Promise<BaseModel<any> | null>{
        return await this.baseRepository.findById(id);
    }
    async findAll():Promise<BaseModel<any>[]>{
        return await this.baseRepository.findAll();
    }
    async update(id:string, data:UpdateInput):Promise<BaseModel<T>>{
        return await this.baseRepository.update(id, data);
    }
}