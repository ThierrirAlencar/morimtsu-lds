import { Injectable } from "@nestjs/common";
import { events, Prisma, PrismaClient } from "@prisma/client";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityDoesNotExists } from "src/infra/utils/errors";

interface completeEvents extends events{
    classname:string
}
@Injectable()
export class EventsService{
    
    constructor(
        private _prisma:PrismaService
    ){}

    async create(data:Prisma.eventsUncheckedCreateInput):Promise<events>{
        const {id:uid, title, event_date, class_id} = data

        const doesTheClassExists = await this._prisma.class.findUnique({
            where:{
                id: class_id
            }
        })
        if(!doesTheClassExists){
            throw new entityDoesNotExists()
        }

        const _event = await this._prisma.events.create({
            data:{
                class_id,        
                title,
                event_date
            }
        })

        return _event  
    }

    async delete(id:string):Promise<void>{
        const doesTheEventExists = await this._prisma.events.findUnique({
            where:{
                id
            }
        })

        if(!doesTheEventExists){
            throw new entityDoesNotExists()
        }

        await this._prisma.events.delete({
            where:{
                id
            }
        })
    }

    async listByClass(classId:string):Promise<completeEvents[]>{
        const doesTheClassExists = await this._prisma.class.findUnique({
            where:{
                id: classId
            }
        })

        if(!doesTheClassExists){
            throw new entityDoesNotExists()
        }

        const eventsList = await this._prisma.events.findMany({
            where:{
                class_id: classId
            }
        })
        return await Promise.all(eventsList.map(async e=>{
            const classroom = await this._prisma.class.findUnique({
                where:{
                    id:e.class_id
                }
            })

            return{
                ...e,
                classname:classroom.name
            }
        }))
    }

    async listByDateRange(startDate:Date, endDate:Date):Promise<completeEvents[]>{
        const eventsList = await this._prisma.events.findMany({
            where:{
                event_date:{
                    gte: startDate,
                    lte: endDate
                }
            }
        })
        return await Promise.all(eventsList.map(async e=>{
            const classroom = await this._prisma.class.findUnique({
                where:{
                    id:e.class_id
                }
            })

            return{
                ...e,
                classname:classroom.name
            }
        }))
    }

    async listAll():Promise<completeEvents[]>{
        const eventsList = await this._prisma.events.findMany()
        console.log(eventsList)
        return await Promise.all(eventsList.map(async e=>{
            const classroom = await this._prisma.class.findUnique({
                where:{
                    id:e.class_id
                }
            })

            return{
                ...e,
                classname:classroom.name
            }
        }))
    }

    async getById(id:string):Promise<events>{
        const doesTheEventExists = await this._prisma.events.findUnique({
            where:{
                id
            }
        })
        if(!doesTheEventExists){
            throw new entityDoesNotExists()
        }
        return doesTheEventExists
    }

    async updateById(id:string, data:Prisma.eventsUncheckedUpdateInput):Promise<events>{
        const doesTheEventExists = await this._prisma.events.findUnique({
            where:{
                id
            }
        })

        if(!doesTheEventExists){
            throw new entityDoesNotExists()
        }

        const _event = await this._prisma.events.update({
            where:{
                id
            },
            data:{
                ...data
            }
        })
        return _event
    }
}