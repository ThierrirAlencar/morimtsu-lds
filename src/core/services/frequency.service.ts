import { Injectable } from "@nestjs/common";
import { frequency, Prisma } from "generated/prisma";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityDoesNotExists } from "src/infra/utils/errors";


@Injectable()
export class frequencyService{
    constructor(private _prisma:PrismaService){}

    async create(data:Prisma.frequencyUncheckedCreateInput){
        const {class_id,student_id,Date,id,coach_id} = data
    
        const doesTheCoachExists= await this._prisma.user.findUnique({
            where:{
                id:coach_id
            }
        })
        const doesTheClassExists = await this._prisma.class.findUnique({
            where:{
                id:class_id
            }
        })
        const doesTheStudentExists = await this._prisma.student.findUnique({
            where:{
                id:student_id
            }
        })
        if(!doesTheCoachExists || !doesTheClassExists || !doesTheStudentExists){
            throw new entityDoesNotExists()
        }

        const __frequency = await this._prisma.frequency.create({
            data:{
                class_id,coach_id,student_id
            }
        })

        const {Presence} = await this._prisma.studentForm.findUnique({
            where:{
                studentId:doesTheStudentExists.id
            }
        })
        //update student 
        const __form = await this._prisma.studentForm.update({
            where:{
                studentId: doesTheStudentExists.id,
            },
            select:{
                
            },
            data:{
                Presence: Presence+1
            }
        })
        return{
            frequency:{
                name:doesTheStudentExists.name,
                date:__frequency.Date
            }
        }
    }

    async getFrequencyFromStudent(studentId:string):Promise<frequency[]>{
        const doesTheStudentExists = await this._prisma.student.findUnique({
            where:{
                id:studentId
            }
        })

        if(!doesTheStudentExists){
            throw new entityDoesNotExists()
        }

        return await this._prisma.frequency.findMany({
            where:{
                student_id:studentId
            }
        })
    }

    async getFrequencyFromClass(classId:string):Promise<frequency[]>{
        const doesTheclassExists = await this._prisma.class.findUnique({
            where:{
                id:classId
            }
        })

        if(!doesTheclassExists){
            throw new entityDoesNotExists()
        }

        return await this._prisma.frequency.findMany({
            where:{
                class_id:classId
            }
        })
    }

    async delete(id:string):Promise<frequency>{
        const frequency = await this._prisma.frequency.findUnique({
            where:{
                id
            }
        })

        if(!frequency){
            throw new entityDoesNotExists()
        }

        return await this._prisma.frequency.delete({
            where:{
                id
            }
        })
    }
}