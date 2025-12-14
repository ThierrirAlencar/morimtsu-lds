import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { DataService } from "src/core/services/data.service";
import { AuthRequest } from "src/infra/interfaces/AuthRequest";
import { baseError } from "src/infra/utils/errors";
import z from "zod";
import { Response } from "express";
@ApiTags("info")
@Controller('dashboard')
export class dashboardController{
    constructor(
        private _dataService:DataService
    ){

    }

    @Get("/")
    @UseGuards(AuthGuard('jwt'))
    @ApiResponse({
        status:200,
        description:"Dados gerais da aplicação",
        example:{
            totalStudents:150,
            totalCoaches:10,
            totalClasses:5,
            totalEvents:20
        }
    })
    async getDashboardData(@Res() res:Response, @Req() req:AuthRequest){
        
        const {id:admin_id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)

        try{
            const a =  await this._dataService.getAplicationData(admin_id);
            res.status(200).send({
                description:"Data fetched",
                response:a
            })
        }catch(err){
            if(err instanceof baseError){
                res.status(err.http_status).send(err);
            }else{
                res.status(500).send({
                    description:"Erro desconhecido. Reportar para devs",
                    error:err
                })
            }
        }
    }
}