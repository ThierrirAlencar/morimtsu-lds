import { Injectable } from "@nestjs/common";
import { error } from "console";
import { frequency, Prisma, student } from "@prisma/client"
import { throwError } from "rxjs";
import { PrismaService } from "src/infra/database/prisma.service";
import { entityDoesNotExists, valueNotProvided } from "src/infra/utils/errors";
import { string, stringFormat } from "zod";

interface frequencyFilters{
    classId?:string
    studentId?:string
    date?:Date
    coachId?:string
}
interface createFrequency{
    class_id:string
    coach_id:string
    studentsIDs:string[],
    date?:Date
}
@Injectable()
export class frequencyService{
    constructor(private _prisma:PrismaService){}

    async create(data:createFrequency){
        const {class_id,studentsIDs,date,coach_id} = data
    
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

        if(!doesTheCoachExists || !doesTheClassExists){
            throw new entityDoesNotExists()
        }
        if(!studentsIDs){
            throw new valueNotProvided()
        }
        const existingStudents = await this._prisma.student.findMany({
            where: {
                id: {
                    in:studentsIDs
                }
            }
        });

        console.log(existingStudents)
        // // Opcional: Checar se algum aluno não foi encontrado
        // if (existingStudents.length != studentsIDs.length) {
        //     throw new entityDoesNotExists()
        // }
        console.log("Existing students exists on lenght")
        // 2. Preparar as Promises de criação de frequência e atualização de formulário
        const operations = existingStudents.map(async (_student_exists) => {
            // a) Cria a frequência
            const createdFrequency = this._prisma.frequency.create({
                data: {
                    class_id,
                    coach_id,
                    student_id: _student_exists.id,
                    Date: date 
                }
            });

            // b) Calcula o novo total de presenças (Esta consulta AINDA é problemática, veja o Ponto 3)
            // Para simplificar, vamos mover o cálculo da presença para DEPOIS do Promise.all de criação
            
            return createdFrequency;
        });

        // 3. Executa a criação de todas as frequências em paralelo
        const createdFrequencies = await Promise.all(operations);

        // 4. (Opcional) Executa as atualizações de formulário (agora que as novas presenças foram criadas)
        const updateOperations = createdFrequencies.map(async (freq) => {
            // Agora o cálculo está correto: conta a nova frequência
            const totalPresences = await this._prisma.frequency.count({
                where: {
                    student_id: freq.student_id
                }
            });
            const _theres_a_form = await this._prisma.studentForm.findUnique({
                where:{
                    studentId:freq.student_id
                }
            })
            if(_theres_a_form){
                // Atualiza o formulário
                return this._prisma.studentForm.update({
                    where: {
                        studentId: freq.student_id
                    },
                    data: {
                        Presence: totalPresences
                    }
                });
            }
        });

        await Promise.all(updateOperations);

        // Retorno (ajustado para createdFrequencies)
        return {
            frequency: {
                names: existingStudents.map(e => e.name),
                date: createdFrequencies.map(e => e.Date)
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

    async delete(ids: string[]): Promise<frequency[]> {
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            throw new entityDoesNotExists();
        }

        // Find the frequency records to be deleted
        const frequencies = await this._prisma.frequency.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        if (!frequencies || frequencies.length === 0) {
            throw new entityDoesNotExists();
        }

        // Collect affected student IDs
        const affectedStudentIds = Array.from(new Set(frequencies.map((f) => f.student_id)));

        // Delete the frequency records in bulk
        await this._prisma.frequency.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });

        // Recalculate and update Presence for each affected student
        const updatePromises = affectedStudentIds.map(async (studentId) => {
            const totalPresences = await this._prisma.frequency.count({
                where: { student_id: studentId },
            });

            // Update studentForm if exists
            const form = await this._prisma.studentForm.findUnique({
                where: { studentId },
                select: { studentId: true },
            });

            if (form) {
                return this._prisma.studentForm.update({
                    where: { studentId },
                    data: { Presence: totalPresences },
                });
            }

            return null;
        });

        await Promise.all(updatePromises);

        // Return the records that were deleted
        return frequencies;
    }

    async filterFrequencyByQuery(filters:frequencyFilters){
        const frequencies = await this._prisma.frequency.findMany({
        where: {
            AND: [
                // Filter by classId if provided
                filters.classId ? { class_id: filters.classId } : {},
                
                // Filter by studentId if provided
                filters.studentId ? { student_id: filters.studentId } : {},
                
                // Filter by coachId if provided
                filters.coachId ? { coach_id: filters.coachId } : {},
                
                // Filter by date if provided
                filters.date ? {
                    Date: {
                        gte: new Date(filters.date.getFullYear(), filters.date.getMonth(), filters.date.getDate()),
                        lt: new Date(filters.date.getFullYear(), filters.date.getMonth(), filters.date.getDate() + 1)
                    }
                } : {}
            ]
        },
            include: {
                Student: true,
                Class: true,
                Coach: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                Date: 'desc'
            }
        });

        return Promise.all(frequencies.map(async (freq) => {
            const studentForm = await this._prisma.studentForm.findUnique({
                where: {
                    studentId: freq.student_id
                }
            })
            
            return {
                ...freq,
                StudentForm: studentForm || null
            };
        }
        ));
    }
    
    async update(id:string,date:Date):Promise<frequency>{
        const doesTheFrequencyExists = await this._prisma.frequency.findUnique({
            where:{
                id
            }
        })

        if(!doesTheFrequencyExists){
            throw new entityDoesNotExists()
        }
        return await this._prisma.frequency.update({
            where:{
                id
            },
            data:{
                Date:date
            }})
    }
}