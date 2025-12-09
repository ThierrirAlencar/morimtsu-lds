import { Injectable } from "@nestjs/common";
import { log } from "console";
import { Class, Prisma, student, User } from "generated/prisma";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityAlreadyExistsError, entityDoesNotExists } from "src/infra/utils/errors";
import { timeStringToDate } from "src/infra/utils/toDateTimeString";
import { frequencyService } from "./frequency.service";

interface classFilters{
    query:string
    minAge:number,
    maxAge:number
}
@Injectable()
export class classService{
    constructor(
        private __prisma:PrismaService,
        private __frequency:frequencyService
    ){

    }

    async create(data: Prisma.ClassUncheckedCreateInput, userIds?: string[]) {
        const {maxAge,name,description,endTime,icon_url,minAge,startTime} = data
        const doesTheClassWithTheSameNameExists = await this.__prisma.class.findUnique({
            where:{
                name:data.name
            }
        })

        if(doesTheClassWithTheSameNameExists){
            throw new entityAlreadyExistsError()
        }

        const __class = await this.__prisma.class.create({
            data:{
                name,description,endTime,startTime,icon_url,maxAge,minAge 
            }
        })

        //create relationships
        if(userIds){
            for(let i=0; i<userIds.length;i++){
                const __user = await this.__prisma.user.findUnique({
                    where:{
                        id:userIds[i]
                    }
                })
                const __relation = await this.__prisma.userClasses.create({
                    data:{
                        classId:__class.id,
                        userId:userIds[i],
                    }
                })
            }            
        }

        const __find_unique_admin = await this.__prisma.user.findFirst({
            where:{
                role:"ADMIN"
            }
        })

        if(!__find_unique_admin){
            throw new entityDoesNotExists()
        }
        const __admin_relation = await this.__prisma.userClasses.create({
            data:{
                classId:__class.id,
                userId:__find_unique_admin.id
            }
        })

        return{
            assigned_admin: {
                name:__find_unique_admin.name,
                email:__find_unique_admin.email
            },
            class:__class
        }

        
    }

    async update(data:Prisma.ClassUpdateInput,id:string){
        const {name,description,maxAge,minAge} = data

        const _class = await this.__prisma.class.update({
            where:{
                id
            },
            data
        })

        return _class
    }

    async delete(id:string){
         // 1. Find all frequencies for this class
        const frequencies = await this.__prisma.frequency.findMany({
                where: {
                    class_id: id
                }
         });

        // 2. Delete all frequencies and update student presence
        for (const frequency of frequencies) {
                const studentForm = await this.__prisma.studentForm.findUnique({
                    where: { studentId: frequency.student_id },
                    select: { Presence: true }
                });

                if (studentForm) {
                    await this.__prisma.studentForm.update({
                        where: { studentId: frequency.student_id },
                        data: {
                            Presence: Math.max(0, studentForm.Presence - 1)
                        }
                    });
                }

                await this.__prisma.frequency.delete({
                    where: { id: frequency.id }
                });
            }

            // 3. Delete all StudentClasses relationships
            await this.__prisma.studentClasses.deleteMany({
                where: { classId: id }
            });

            // 4. Delete all UserClasses relationships
            await this.__prisma.userClasses.deleteMany({
                where: { classId: id }
            });

            
            const _class = await this.__prisma.class.delete({
                where: { id }
            });

        return {
            message: "Class deleted successfully",
            class: _class,
            frequenciesDeleted: frequencies.length
        };
    }

    async getOne(id:string){
        const _class = await this.__prisma.class.findUnique({
            where:{
                id
            }
        })

        if(!_class){
            throw new entityDoesNotExists()
        }

        //find any relation between students
        const _classRelation = await this.__prisma.studentClasses.findMany({
            where:{
                classId:id
            }
        })
        var  _classStudentsList: student[] = []

        for(let i=0; i<_classRelation.length;i++){
            const a = await this.__prisma.student.findMany({
                where:{
                    id:_classRelation[i].studentId
                }
            })
            _classStudentsList = _classStudentsList.concat(a)
        }
        
        //Find any relation between coachs
        const _UserRelation = await this.__prisma.userClasses.findMany({
            where:{
                classId:id
            }
        })

        var  _classCoachsList: User[] = []

        for(let i=0; i<_UserRelation.length;i++){
            const ab = await this.__prisma.user.findMany({
                where:{
                    id:_UserRelation[i].userId
                }
            })
            _classCoachsList = _classCoachsList.concat(ab)
        }
        return {
            class:_class,
            students:await Promise.all(_classStudentsList.map(async e=>{
                    let student_form = await this.__prisma.studentForm.findUnique({
                        where:{
                            studentId:e.id,
                        }
                    })

                    return{
                        personal: e,
                        form: student_form
                    }
                })),
            coachs:_classCoachsList
        }
    }


   async getManyWithFilters(filters:classFilters,userId:string):Promise<Class[]>{
        const {query, minAge, maxAge} = filters;
        const _userClasses = await this.__prisma.userClasses.findMany({
            where:{
                userId
            }
        })

        var _classList:Class[] = []
        for(let i =0; i<_userClasses.length;i++){
            const classes = await this.__prisma.class.findMany({
            where: {
                id: _userClasses[i].classId,
                AND: [
                    // Search in both name and description if query exists
                    {
                        OR: query ? [
                            {
                                name: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            },
                            {
                                description: {
                                    contains: query,
                                    mode: 'insensitive'
                                }
                            }
                        ] : undefined
                    },
                    // Filter by minimum age if provided
                    {
                        minAge: minAge ? {
                            gte: minAge
                        } : undefined
                    },
                    // Filter by maximum age if provided
                    {
                        maxAge: maxAge ? {
                            lte: maxAge
                        } : undefined
                    }
                ]
                }
            });
            _classList = _classList.concat(classes)
        }
        

        return _classList;
   }

   async assignCoachsToClass(classId:string, coachId:string){
        const doesTheClassExists = await this.__prisma.class.findUnique({
            where:{
                id:classId
            }
        })
        const doesTheUserExists = await this.__prisma.user.findUnique({
            where:{
                id:coachId
            }
        })
        
        if(!doesTheClassExists || !doesTheUserExists){
            throw new entityDoesNotExists()
        }

        const _relation = await this.__prisma.userClasses.create({
            data:{
                classId,
                userId:coachId
            }
        })
        return _relation

   }
}