import { Injectable } from "@nestjs/common";
import { log } from "console";
import { Class, Prisma, student, User } from "generated/prisma";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityAlreadyExistsError, entityDoesNotExists } from "src/infra/utils/errors";
import { timeStringToDate } from "src/infra/utils/toDateTimeString";

interface classFilters{
    query:string
    minAge:number,
    maxAge:number
}
@Injectable()
export class classService{
    constructor(
        private __prisma:PrismaService
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
       const _studentClasses = await this.__prisma.studentClasses.deleteMany({
        where:{
            classId:id
        }
       })

       const _class = await this.__prisma.class.delete({
        where:{
            id
        }
       })

       return{
        _class,
        _studentClasses
       }
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
            students:_classStudentsList,
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
}