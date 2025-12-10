import { UUID } from "crypto";
import { Prisma, student } from "@prisma/client";

export interface studentService{
    create(data:Prisma.UserCreateInput):Promise<student>
    findById(id:UUID):Promise<student>
    findByClass(classId:string):Promise<student[]>
    findMany():Promise<student[]>
    delete(id:string):Promise<student>
    update(id:string,data:Prisma.UserUpdateInput):Promise<student>    
}