import { Body, Controller, Delete, Get, Param, Post, Put, Res } from "@nestjs/common";
import { Response } from "express";
import { classService } from "src/core/services/class.service";
import { baseError, entityDoesNotExists } from "src/infra/utils/errors";
import z from "zod";
import { createClassDTO } from "../dto/class";
import { ApiResponse } from "@nestjs/swagger";


@Controller("/class")
export class classController{
    constructor(
        private _classService:classService
    ){

    }


    @ApiResponse({status:201, description:"class criada com sucesso"})
    @ApiResponse({status:404, description:"Usuário administrador ou professor nao foi encontrado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Post("/")
    async create(@Body() body:createClassDTO, @Res() res:Response) {
        const {name,description,coachId} = z.object({
            name: z.string(),
            description: z.string().optional(),
            coachId:z.string().uuid().optional().nullable()
        }).parse(body)
    
        try{
            const _response = await this._classService.create({
                name,description
            },coachId)

            res.status(201).send({
                description:"Class created and add to any ADMIN user",
                _response
            })
        }catch(err){
            if(err instanceof baseError){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send(err)
            }
        }
    }

    // PUT /class/:id
    @ApiResponse({status:200, description:"class atualizada com sucesso"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Put("/:id")
    async update(@Param("id") id:string, @Body() body:any, @Res() res:Response){
        const parsed = z.object({
            name: z.string().optional(),
            description: z.string().optional()
        }).parse(body)

        try{
            const _class = await this._classService.update(parsed as any, id)
            res.status(200).send({
                status:200,
                description:"Class updated with success",
                _class
            })
        }catch(err){
            res.status(500).send(err)
        }
    }

    // DELETE /class/:id
    @ApiResponse({status:200, description:"class removida com sucesso"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Delete("/:id")
    async remove(@Param("id") id:string, @Res() res:Response){
        try{
            const _response = await this._classService.delete(id)
            res.status(200).send({
                status:200,
                description:"Class deleted with success",
                ..._response
            })
        }catch(err){
            if(err instanceof entityDoesNotExists){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send(err)
            }
        }
    }

    // GET /class/:id
    @ApiResponse({status:200, description:"class retornada com sucesso"})
    @ApiResponse({status:404, description:"Classe não encontrada"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Get("/:id")
    async getOne(@Param("id") id:string, @Res() res:Response){
        try{
            const _response = await this._classService.getOne(id)
            res.status(200).send({
                status:200,
                description:"Class fetched with success",
                ..._response
            })
        }catch(err){
            if(err instanceof entityDoesNotExists){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send(err)
            }
        }
    }

}