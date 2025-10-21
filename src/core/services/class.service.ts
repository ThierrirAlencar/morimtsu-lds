import { Injectable } from "@nestjs/common";
import { Prisma, student, User } from "generated/prisma";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityAlreadyExistsError, entityDoesNotExists } from "src/infra/utils/errors";


@Injectable()
export class classService{
    constructor(
        private __prisma:PrismaService
    ){

    }

    //Creates a class and automatically assigns it to the ADMIN user
    async create(data:Prisma.ClassUncheckedCreateInput,userId:string | null){
        const {name,description} = data

        //Automaticaly assigns it to the admin user
        const adminOrCoach = userId ?await this.__prisma.user.findUnique({
            where:{
                id:userId
            }
        }) : await this.__prisma.user.findFirst({
            where:{
                role:"ADMIN"
            }
        })  

        const doesTheClassWithTheSameNameExists = await this.__prisma.class.findUnique({
            where:{
                name
            }
        })

        if(doesTheClassWithTheSameNameExists){
            throw new entityAlreadyExistsError()
        }

        
        const doesTheUserExists = await this.__prisma.user.findUnique({
            where:{
                id:adminOrCoach.id
            }
        })

        if(!doesTheUserExists){
            throw new entityDoesNotExists()
        }

        const _class = await this.__prisma.class.create({
            data:{
                name, 
                description
            }
        })

        const _relation = await this.__prisma.userClasses.create({
            data:{
                classId:_class.id,userId:adminOrCoach.id
            }
        })

        return{
            _class,
            _relation
        }
    }

    async update(data:Prisma.ClassUpdateInput,id:string){
        const {name,description} = data

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
}