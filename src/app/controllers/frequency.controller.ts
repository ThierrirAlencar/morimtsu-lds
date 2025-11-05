import { Body, Controller, Delete, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { frequencyService } from "src/core/services/frequency.service";
import { AuthRequest } from "src/infra/interfaces/AuthRequest";
import { createFrequencyDTO, queryDeleteFrequencyDTO } from "../dto/frequency";
import z from "zod";
import { baseError } from "src/infra/utils/errors";
import { ApiHeader, ApiQuery, ApiResponse } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";


@Controller("frequency")
export class frequencyController{
    constructor(
        private service: frequencyService
    ){}

    @ApiResponse({status:201, description:"Criado com sucesso"})
    @ApiResponse({status:404,description:"Alguma das entidades nao foi encontrada, forneça o token, o id da turma e o id do estudante corretamente e verifique sua existencia"})
    @ApiResponse({status:500, description:"Erro desconhecido reportar a desenvolvedores."})
    @UseGuards(AuthGuard("jwt"))
    @ApiHeader({name:"Autorization", description:"O token jwt do usuário"})
    @Post("/")
    async post(@Req() req:AuthRequest, @Res() res:Response, @Body() Body:createFrequencyDTO){
        const {classId:class_id,studentId:student_id,Date} = Body;
        const {id:coach_id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)
        try{
            const __service = await this.service.create({
                class_id,coach_id,student_id
            })

            res.status(201).send({
                description:"Frequencia registrada com sucesso!",
                body:__service
            })
        }catch(err){
            if(err instanceof baseError){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({description:"Erro desconhecido", error:err})
            }
        }
    }

    @ApiResponse({status:201, description:"Criado com sucesso"})
    @ApiResponse({status:404,description:"Verfique se o registro de frequencia realmente existe"})
    @ApiResponse({status:500, description:"Erro desconhecido reportar a desenvolvedores."})
    @ApiQuery({name:"Id", description:"o id da classe"})
    @Delete("/")
    async delete(@Query() query:queryDeleteFrequencyDTO, @Res() res:Response){
        try{
            const __service = await this.service.delete(query.id)

            res.status(200).send({
                description:"Deletado com sucesso",
                body:__service
            })
        }catch(err){
            if(err instanceof baseError){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({
                    description:"Erro desconhecido",
                    error:err
                })
            }
        }
    }

    
}
