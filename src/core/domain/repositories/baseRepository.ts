import { PrismaClient } from "generated/prisma";
import { BaseModel, PrismaService } from "src/infra/db/prismaService";

export interface base_repository_interface{
    create(data: any):Promise<BaseModel<any>>;
    findById(id:string):Promise<BaseModel<any> | null>;
    findAll():Promise<BaseModel<any>[]>;
    update(id:string, data:any):Promise<BaseModel<any>>;
    delete(id:string):Promise<BaseModel<any>>;
}

