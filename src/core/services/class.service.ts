import { Injectable } from "@nestjs/common";
import { log } from "console";
import { Class, Prisma, student, User } from "generated/prisma";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityAlreadyExistsError, entityDoesNotExists } from "src/infra/utils/errors";

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
    // Use transaction to ensure data consistency
        return await this.__prisma.$transaction(async (tx) => {
            const { name, description, maxAge, minAge, icon_url, startTime, endTime } = data;

            // 1. Validate admin existence
            const admin = await tx.user.findFirst({
                where: { role: "ADMIN" }
            });
            if (!admin) {
                throw new entityDoesNotExists();
            }

            // 2. Check for duplicate class name
            const existingClass = await tx.class.findUnique({
                where: { name }
            });
            if (existingClass) {
                throw new entityAlreadyExistsError();
            }

            // 3. Create the class with all schema-defined fields
            const _class = await tx.class.create({
                data: {
                    name,
                    description,
                    maxAge: maxAge || 99,
                    minAge: minAge || 0,
                    icon_url,
                    startTime: startTime ? new Date(startTime) : null,
                    endTime: endTime ? new Date(endTime) : null
                }
            });

            // 4. Process coach assignments
            const uniqueCoachIds = new Set(userIds?.filter(Boolean) || []);
            if (!uniqueCoachIds.has(admin.id)) {
                uniqueCoachIds.add(admin.id);
            }

            // 5. Create coach relationships
            const coachRelations = await Promise.all(
                Array.from(uniqueCoachIds).map(async (coachId) => {
                    const coach = await tx.user.findUnique({
                        where: { id: coachId }
                    });
                    if (!coach) {
                        throw new entityDoesNotExists();
                    }

                    return tx.userClasses.create({
                        data: {
                            classId: _class.id,
                            userId: coachId
                        }
                    });
                })
            );

            return {
                class: _class,
                coaches: coachRelations
            };
        });
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