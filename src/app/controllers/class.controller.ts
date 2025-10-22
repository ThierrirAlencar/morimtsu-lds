import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { classService } from "src/core/services/class.service";
import { baseError, entityDoesNotExists } from "src/infra/utils/errors";
import z from "zod";
import { createClassDTO, QueryClassParams, updateClassDTO } from "../dto/class";
import { ApiResponse } from "@nestjs/swagger";
import { timeStringToDate } from "src/infra/utils/toDateTimeString";
import { Prisma } from "generated/prisma";
import { AuthGuard } from "@nestjs/passport";
import { AuthRequest } from "src/infra/interfaces/AuthRequest";


@Controller("/class")
export class classController{
    constructor(
        private _classService:classService
    ){

    }


    @ApiResponse({status:201, description:"class criada com sucesso",example:JSON.parse(`
    {
    "status": 200,
    "description": "Classes filtered with success",
    "classes": [
        {
        "id": "cmh2dj2ze0009fa22yyybsh38",
        "name": "ysad gysagvbdya",
        "description": null,
        "icon_url": "/src/assets/presets/capaturma3.png",
        "startTime": null,
        "endTime": null,
        "maxAge": 0,
        "minAge": 1
        }
    ]
    }
        `)})
    @ApiResponse({status:404, description:"Usuário administrador ou professor nao foi encontrado. Se não for fornecido o ID a classe será atribuída a um usuário ADMIN aleatório"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiResponse({status:409, description:"Valor único violado. Provavelmente o nome da classe já existe"})
    @Post("/")
    async create(@Body() body:createClassDTO, @Res() res:Response) {
        const {name,description,coachId,iconURL,maxAge,minAge,endTime,startTime} = body
    
        try{
            const _response = await this._classService.create({
                name,description,icon_url:iconURL,maxAge,minAge,
                endTime:timeStringToDate(endTime),
                startTime:timeStringToDate(startTime)
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
    @ApiResponse({status:201, description:"class atualizada com sucesso",example:JSON.parse(`
            {
  "status": 200,
  "description": "Class updated with success",
  "_class": {
    "id": "cmh0lx2fe0000ildk9cbn0s0p",
    "name": "Test Class REST - without coach v1",
    "description": "Descrição atualizada"
  }
}
        `)})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Put("/:id")
    async update(@Param("id") id:string, @Body() body:updateClassDTO, @Res() res:Response){
        const {startTime,description,name,iconURL:icon_url,endTime,maxAge,minAge} = body

        try{
            const _class = await this._classService.update({
                description,icon_url,maxAge,minAge,name,
                endTime:endTime?timeStringToDate(endTime):undefined,
                startTime:startTime?timeStringToDate(startTime):undefined
            } as Prisma.ClassUpdateInput, id)
            res.status(201).send({
                status:201,
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
    @ApiResponse({status:200, description:"class retornada com sucesso",example:JSON.parse(`
        {
  "status": 200,
  "description": "Class fetched with success",
  "class": {
    "id": "cmh0lx2fe0000ildk9cbn0s0p",
    "name": "Test Class REST - without coach v1",
    "description": "Descrição atualizada"
  },
  "students": [],
  "coachs": [
    {
      "id": "81b6ea92-734d-40d2-8f0d-7003e3546933",
      "password": "$2b$09$zu1y9GFGpj2tNtIfWyIahOdCCi6ZsbiUc8WyiSl78sLFm0ufrH3wG",
      "role": "ADMIN",
      "name": "ts",
      "email": "s@gmail.com"
    }
  ]
}
            `)})
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
    
    @ApiResponse({status:200, description:"Classes filtradas retornadas com sucesso", example: JSON.parse(`
        {
            "status": 200,
            "description": "Classes filtered with success",
            "classes": [
                {
                    "id": "example-id-1",
                    "name": "Swimming Class",
                    "description": "Swimming lessons for beginners",
                    "minAge": 5,
                    "maxAge": 12
                }
            ]
        }
    `)})
    
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @UseGuards(AuthGuard("jwt"))
    @Get("/")
    async getMany(@Query() query: QueryClassParams, @Req() req:AuthRequest, @Res() res:Response) {
        const filters = z.object({
            query: z.string().optional().default(""),
            minAge: z.number().min(0).optional(),
            maxAge: z.number().min(0).optional()
        }).parse(query);


        const userId = req.user.id

        try {
            const classes = await this._classService.getManyWithFilters({
                query: filters.query,
                minAge: filters.minAge,
                maxAge: filters.maxAge
            },userId);

            res.status(200).send({
                status: 200,
                description: "Classes filtered with success",
                classes
            });
        } catch(err) {
            res.status(500).send({
                description: "erro desconhecido"
            });
        }
    }
}