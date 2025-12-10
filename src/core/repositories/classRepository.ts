import { UUID } from "crypto"
import { Class, Prisma, student } from "@prisma/client"


export interface classRepository{
        create(data:Prisma.UserCreateInput):Promise<Class>
        findById(id:UUID):Promise<Class>
        findByUser(userId:UUID):Promise<Class[]>
        findMany():Promise<Class[]>
        findByStudent():Promise<Class[]>
        delete(id:string):Promise<Class>
        update(id:string,data:Prisma.UserUpdateInput):Promise<Class>  
}