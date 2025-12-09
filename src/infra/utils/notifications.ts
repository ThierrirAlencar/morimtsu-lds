import { student } from "generated/prisma";
import { PrismaService } from "../database/prisma.service";
import { notification } from "../interfaces/notification";

interface BirthdayNotification {
    studentId: string;
    studentName: string;
    birthDate: Date;
    daysUntilBirthday: number;
    message: string;
}

export class NotificationChecker{
    private CurrentDate = new Date();

    constructor(private prisma: PrismaService){

    }

    /**
     * Calcula quantos dias faltam para o próximo aniversário
     * @param birthDate Data de nascimento do aluno
     * @returns Número de dias até o próximo aniversário
     */
    private calculateDaysUntilBirthday(birthDate: Date): number {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Próximo aniversário este ano
        let nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

        // Se o aniversário já passou este ano, use o do próximo ano
        if (nextBirthday < today) {
            nextBirthday = new Date(today.getFullYear() + 1, birthDate.getMonth(), birthDate.getDate());
        }

        // Calcula a diferença em milissegundos e converte para dias
        const differenceInTime = nextBirthday.getTime() - today.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));

        return differenceInDays;
    }

    /**
     * Verifica se um aluno tem aniversário nos próximos 7 dias
     * @param student Objeto do aluno
     * @returns Notificação se o aluno tiver aniversário nos próximos 7 dias, null caso contrário
     */
    private checkStudentBirthday(student: student): BirthdayNotification | null {
        const daysUntil = this.calculateDaysUntilBirthday(student.birthDate);

        // Verifica se o aniversário está entre hoje e 7 dias
        if (daysUntil >= 0 && daysUntil <= 7) {
            return {
                studentId: student.id,
                studentName: student.name,
                birthDate: student.birthDate,
                daysUntilBirthday: daysUntil,
                message: daysUntil === 0 
                    ? `${student.name} está fazendo aniversário hoje!` 
                    : `${student.name} faz aniversário em ${daysUntil} dia(s)`
            };
        }

        return null;
    }

    /**
     * Verifica aniversários de todos os alunos de uma turma nos próximos 7 dias
     * @param classId ID da turma
     * @returns Array de notificações de aniversário
     */
    async checkBirthDatesOfClass(classId: string): Promise<BirthdayNotification[]> {
        // Busca todas as relações de alunos com a turma
        const studentClassRelations = await this.prisma.studentClasses.findMany({
            where: {
                classId: classId
            }
        });

        // Busca os dados de cada aluno
        const students: student[] = [];
        for (const relation of studentClassRelations) {
            const student = await this.prisma.student.findUnique({
                where: {
                    id: relation.studentId
                }
            });

            if (student) {
                students.push(student);
            }
        }

        // Verifica aniversários e cria notificações
        const birthdayNotifications: BirthdayNotification[] = [];
        for (const student of students) {
            const notification = this.checkStudentBirthday(student);
            if (notification) {
                birthdayNotifications.push(notification);
            }
        }

        return birthdayNotifications;
    }

    /**
     * Verifica aniversários de todos os alunos da escola nos próximos 7 dias
     * @returns Array de notificações de aniversário
     */
    async checkBirthDatesOfAllStudents(): Promise<BirthdayNotification[]> {
        // Busca todos os alunos
        const allStudents = await this.prisma.student.findMany();

        // Verifica aniversários e cria notificações
        const birthdayNotifications: BirthdayNotification[] = [];
        for (const student of allStudents) {
            const notification = this.checkStudentBirthday(student);
            if (notification) {
                birthdayNotifications.push(notification);
            }
        }

        return birthdayNotifications;
    }
}

