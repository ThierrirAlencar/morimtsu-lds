import { UUID } from "crypto";
import { Prisma, User } from "@prisma/client";
import { safe_user } from "src/infra/interfaces/user";
import { ZodEmail } from "zod";



export interface userInterface{
    create(data:Prisma.UserCreateInput):Promise<safe_user>
    findById(id:UUID):Promise<User>
    findByEmail(email:ZodEmail):Promise<User>
    delete(id:string):Promise<safe_user>
    update(id:string,data:Prisma.UserUpdateInput):Promise<User>
}