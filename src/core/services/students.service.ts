import { Injectable } from "@nestjs/common";
import { log } from "console";
import { Class, Gender, Prisma, Rank, student, StudentClasses, StudentForm } from "generated/prisma";
import { retry } from "rxjs";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityAlreadyExistsError, entityDoesNotExists, prohibitedAction } from "src/infra/utils/errors";
import { string } from "zod";

interface QueryStudentFilters {
    query?: string;
    maxAge?:number;
    minAge?:number;
    CPF?:string;
    email?:string;
    Presence?:number //from studentForm
    Rank?:Rank // from studentForm
    class?:string //the class id from studentClasses relationship 
}

interface genericPrivateStudentReturn{
    student:{
            nickname:string,
            email:string,
            personal:{
                name:string,
                CPF:string,
                contact:string,
                birthDate:Date,
                gender:Gender
            },
            createdAt:Date,
            form:StudentForm
            classes:Class[]
        }
}

interface genericStudentReturn{
    student:{
            nickname:string,
            email:string,
            personal:{
                name:string,
                CPF:string,
                contact:string,
                birthDate:Date,
                gender:Gender
            },
            createdAt:Date,
            form:StudentForm
        }
}
@Injectable()
export class studentServices{
    constructor(
        private _prisma:PrismaService
    ){

    }

    private validateStudentAge(birthDate: Date, requiredAge: number): boolean {
        const today = new Date();
        const birthDateTime = new Date(birthDate);
        
        // Calculate age
        let age = today.getFullYear() - birthDateTime.getFullYear();
        
        // Adjust age if birthday hasn't occurred this year
        const monthDiff = today.getMonth() - birthDateTime.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateTime.getDate())) {
            age--;
        }
        
        return age >= requiredAge;
    }

    async create(data:Prisma.studentCreateInput, formData:Prisma.StudentFormUncheckedCreateInput, classId?:string[]):Promise<genericPrivateStudentReturn>{
        const theresAnyStudentWithTheSameUniqueValues = await this._prisma.student.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { CPF: data.CPF },
                    ]
            }
        })
        
        //Retorna um erro se as informações do responsável nao forem informadas
        if(!this.validateStudentAge(new Date(data.birthDate),18) && !data.parentContact){
            throw new prohibitedAction()
        }

        if(theresAnyStudentWithTheSameUniqueValues){
            throw new entityAlreadyExistsError()
        }


        log("Creating student with data:", data, "and formData:", formData);
        const _student = await this._prisma.student.create({
            data
        })

        log("Student created in database:", _student);
        const _studenForm = await this._prisma.studentForm.create({
            data:{
                Rank:formData.Rank,
                Comments:formData.Comments,
                Presence:formData.Presence,
                studentId:_student.id,
                Rating:formData.Rating,
            }
        })
        var __classes:Class[] = []
        for(let i=0;i<classId.length;i++){
            const doesTheClassExists = await this._prisma.class.findUnique({
                where:{
                    id:classId[i]
                }
            })
            if(!doesTheClassExists){
                throw new entityDoesNotExists()
            }
            await this._prisma.studentClasses.create({
                    data:{
                        classId:classId[i],
                        studentId:_student.id
                    }
            })

             __classes.push(doesTheClassExists)     
        }

        
        return{
            student:{
                nickname:_student.nickname,
                email:_student.email,
                personal:{
                    gender:_student.gender,
                    name:_student.name,
                    CPF:_student.CPF,
                    contact:_student.Contact,
                    birthDate:_student.birthDate,
                },
                createdAt:_student.createdAt,
                form:_studenForm,
                classes:__classes
            }
        }
    }

    async delete(id:string):Promise<student>{
        const doesTheStudentExists = await this._prisma.student.findUnique({
            where:{
                id
            }
        })
    
        if(!doesTheStudentExists){
            throw new entityDoesNotExists()
        }

        const _deleteForm = await this._prisma.studentForm.delete({
            where:{
                studentId:id
            }
        })

        const deleteStudent = await this._prisma.student.delete({
            where:{
                id
            }
        })

        return deleteStudent;
    
    }

    async updatePersonal(data:Prisma.studentUpdateInput, id:string):Promise<student>{
        const {CPF,Contact,birthDate,email,name,nickname} = data
        
        const _studentpersonalUpdate = await this._prisma.student.update({
            where:{
                id
            },
            data
        })

        return _studentpersonalUpdate
    }

    async studentFormUpdate(formData:Prisma.StudentFormUpdateInput,id:string):Promise<StudentForm>{
        const {Comments,Presence,Rank,Rating} = formData;
        

        const updateFormdata = await this._prisma.studentForm.update({
            where:{
                studentId:id
            },
            data:formData
        })

        return updateFormdata
    }

    async getStudent(id:string){
        const doesTheStudentExists = await this._prisma.student.findUnique({
            where:{
                id
            }
        })
        
        if(!doesTheStudentExists){
            throw new entityDoesNotExists()
        }

        const {CPF,Contact,birthDate,createdAt,email,name,nickname,parentContact,parentName} = doesTheStudentExists
        console.log("but got here")
        const studentForm = await this._prisma.studentForm.findUnique({
            where:{
                studentId:id
            }
        })

        const __classes:Class[] = []
        const studentClasses = await this._prisma.studentClasses.findMany({
            where:{
                studentId:id
            }
        })

        studentClasses.forEach(async(studentClass)=>{
            const classInfo = await this._prisma.class.findUnique({
                where:{
                    id:studentClass.classId
                }
            })
            __classes.push(classInfo)
        })

        console.log(doesTheStudentExists)
        return{
            student:{
                nickname:nickname,
                email:email,
                personal:{
                    name:name,
                    CPF:CPF,
                    contact:Contact,
                    birthDate:birthDate,
                    gender:doesTheStudentExists.gender,
                    age: Math.floor((new Date().getTime() - new Date(birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25)),
                },
                parents:{
                    parentName:parentName,
                    parentContact:parentContact
                },
                classes:__classes, //TODO: implementar retorno de classes
                createdAt:createdAt,
                form:studentForm,

            },
            
        }

    }

    async joinClass(studentId:string,classId:string):Promise<StudentClasses>{
        const doesTheStudentExists = await this._prisma.student.findUnique({
            where:{
                id:studentId
            }
        })

        if(!doesTheStudentExists){
            throw new entityDoesNotExists()
        }

        const doesTheClassExists = await this._prisma.class.findUnique({
            where:{
                id:classId
            }
        })

        if(!doesTheClassExists){
            throw new entityDoesNotExists()
        }

        if(!this.validateStudentAge(doesTheStudentExists.birthDate,doesTheClassExists.minAge)){
            throw new prohibitedAction()
        }
        return await this._prisma.studentClasses.create({
            data:{
                classId,
                studentId
            }
        })

    }

    async leaveClass(studentId:string,classId:string):Promise<Prisma.BatchPayload>{
        const doesTheStudentExists = await this._prisma.student.findUnique({
            where:{
                id:studentId
            }
        })

        if(!doesTheStudentExists){
            throw new entityDoesNotExists()
        }

        const doesTheClassExists = await this._prisma.class.findUnique({
            where:{
                id:classId
            }
        })

        if(!doesTheClassExists){
            throw new entityDoesNotExists()
        }


        const relationshipExists = await this._prisma.studentClasses.findFirst({
            where:{
                classId,
                studentId
            }
        })

        if(!relationshipExists){
            throw new entityDoesNotExists()
        }

        return await this._prisma.studentClasses.deleteMany({
            where:{
                classId,
                studentId
            }
        })
    }
    
    async queryStudent(filters?: QueryStudentFilters): Promise<genericStudentReturn[]> {
        const now = new Date();
        
        const students = await this._prisma.student.findMany({
            where: {
                AND: [
                    // Text search filters
                    filters?.query ? {
                        OR: [
                            { name: { contains: filters.query, mode: 'insensitive' } },
                            { email: { contains: filters.query, mode: 'insensitive' } },
                            { nickname: { contains: filters.query, mode: 'insensitive' } }
                        ]
                    } : {},
                    
                    // Exact match filters
                    filters?.CPF ? { CPF: filters.CPF } : {},
                    filters?.email ? { email: filters.email } : {},
                    
                    // Age filter using birthDate
                    filters?.minAge || filters?.maxAge ? {
                        birthDate: {
                            // If maxAge is 20, person must be born after (now - 20 years)
                            gte: filters?.maxAge ? new Date(now.getFullYear() - filters.maxAge - 1, now.getMonth(), now.getDate()) : undefined,
                            // If minAge is 10, person must be born before (now - 10 years)
                            lte: filters?.minAge ? new Date(now.getFullYear() - filters.minAge, now.getMonth(), now.getDate()) : undefined,
                        }
                    } : {},

                    // Class relationship filter
                    filters?.class ? {
                        classes: {
                            some: {
                                classId: filters.class
                            }
                        }
                    } : {},
                ]
            },
            include: {
                formData: true,
                classes: true
            }
        });

        // Additional filtering for form-related filters that might be complex for Prisma
        let filteredStudents = students;
        
        if (filters?.Presence) {
            filteredStudents = filteredStudents.filter(student => 
                student.formData?.Presence === filters.Presence
            );
        }

        if (filters?.Rank) {
            filteredStudents = filteredStudents.filter(student => 
                student.formData?.Rank === filters.Rank
            );
        }


        

        // Map to return format
        return filteredStudents.map(student => ({
            student: {
                id:student.id,
                nickname: student.nickname,
                email: student.email,
                personal: {
                    name: student.name,
                    CPF: student.CPF,
                    contact: student.Contact,
                    birthDate: student.birthDate,
                    gender: student.gender
                },
                createdAt: student.createdAt,
                form: student.formData
            }
        }));
}
}