import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infra/database/prisma.service";
import { DashboardData } from "src/infra/interfaces/generalData";
import { prohibitedAction } from "src/infra/utils/errors";


@Injectable()
export class DataService{

    constructor(private _prisma:PrismaService){

    }

    async getAplicationData(admin_id:string):Promise<DashboardData>{
        const admin = await this._prisma.user.findUnique({
            where:{
                id:admin_id
            }
        });

        if(!admin || admin.role !== "ADMIN"){
            throw new prohibitedAction("Not enough permissions");
        }

        const totalStudents = await this._prisma.student.count();
        const totalCoaches = await this._prisma.user.count({
            where:{
                role:"USER"
            }
        });
        const totalClasses = await this._prisma.class.count();
        const totalEvents = await this._prisma.events.count();

        return{
            totalClasses: totalClasses,
            totalCoaches: totalCoaches,
            totalEvents: totalEvents,
            totalStudents: totalStudents
        }

    }
}