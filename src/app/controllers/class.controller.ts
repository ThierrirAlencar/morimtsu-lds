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
            "description": "Class created and add to any ADMIN user",
            "_response": {
                "assigned_admin": {
                "name": "admin",
                "email": "admin@gmail.com"
                },
                "class": {
                "id": "cmhm17rw60000ck2l639gnmui",
                "name": "Turma de Vitoria",
                "description": "Turma de Jiu-Jitsu para crianças",
                "icon_url": "https://example.com/icon.png",
                "startTime": "1970-01-01T17:00:00.000Z",
                "endTime": "1970-01-01T18:00:00.000Z",
                "maxAge": 12,
                "minAge": 6
                }
            }
            }
        `)})
    @ApiResponse({status:404, description:"Usuário administrador ou professor nao foi encontrado. Se não for fornecido o ID a classe será atribuída a um usuário ADMIN aleatório"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiResponse({status:409, description:"Valor único violado. Provavelmente o nome da classe já existe"})
    @Post("/")
    async create(@Body() body:createClassDTO, @Res() res:Response) {
        const {name,description,coachId,iconURL,maxAge,minAge,endTime,startTime} = body
    
        try{
            console.log("Creating class with coachs", coachId);
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
    "id": "cmhy5tyxt0001if22bm42s0fb",
    "name": "Turma 4",
    "description": null,
    "icon_url": "/src/assets/presets/capaturma8.png",
    "startTime": "1970-01-01T00:00:00.000Z",
    "endTime": "1970-01-01T00:00:00.000Z",
    "maxAge": 120,
    "minAge": 10
  },
  "students": [
    {
      "personal": {
        "id": "7b672b8e-d683-4b2d-b3bd-1c76d33fbb7f",
        "name": "Pedro Guilherme",
        "nickname": "Guy",
        "Contact": "43246523164521364",
        "birthDate": "2001-01-21T00:00:00.000Z",
        "gender": "male",
        "email": "guy123@gmail.com",
        "CPF": "5623456872734658",
        "parentName": "",
        "parentContact": "",
        "createdAt": "2025-11-05T13:14:26.058Z"
      },
      "form": {
        "id": "cmhm0rvfa0001aq22vbd703mu",
        "Rating": 1,
        "Presence": 6,
        "Comments": "Aluno excelente. Só é um pouco impaciente.",
        "Rank": "ROXA",
        "IFCE_student_registration": null,
        "Health_issues": null,
        "Medication_usage": null,
        "Allergies": null,
        "studentId": "7b672b8e-d683-4b2d-b3bd-1c76d33fbb7f",
        "userId": "ce506827-1b35-4632-9a6a-c1a01a43b576"
      }
    },
    {
      "personal": {
        "id": "0573e283-b6f0-4088-8f41-f7d184de9e4b",
        "name": "Raimundo José de Matos",
        "nickname": "",
        "Contact": "6542676537653767435",
        "birthDate": "2015-11-12T00:00:00.000Z",
        "gender": "female",
        "email": "Raimundo1@gmail.com",
        "CPF": "8965438735435",
        "parentName": "Olivia",
        "parentContact": "452564561532451234",
        "createdAt": "2025-11-05T14:05:54.070Z"
      },
      "form": {
        "id": "cmhm2m23v000jck2lmwedb5fz",
        "Rating": 1,
        "Presence": 6,
        "Comments": "",
        "Rank": "CINZA",
        "IFCE_student_registration": null,
        "Health_issues": null,
        "Medication_usage": null,
        "Allergies": null,
        "studentId": "0573e283-b6f0-4088-8f41-f7d184de9e4b",
        "userId": null
      }
    },
    {
      "personal": {
        "id": "45d1b87e-913c-4d72-a045-edaf04a4b8ef",
        "name": "Raimundo",
        "nickname": "Rai",
        "Contact": "342341241434324",
        "birthDate": "2001-11-10T00:00:00.000Z",
        "gender": "female",
        "email": "rai123@gmail.com",
        "CPF": "54154313124324214234124",
        "parentName": "",
        "parentContact": "",
        "createdAt": "2025-11-05T14:03:36.289Z"
      },
      "form": {
        "id": "cmhm2j3sy000fck2lhte8lk9x",
        "Rating": 1,
        "Presence": 6,
        "Comments": "",
        "Rank": "VERMELHA",
        "IFCE_student_registration": null,
        "Health_issues": null,
        "Medication_usage": null,
        "Allergies": null,
        "studentId": "45d1b87e-913c-4d72-a045-edaf04a4b8ef",
        "userId": "90edb66e-fde3-46e8-a201-975e4acc75c5"
      }
    },
    {
      "personal": {
        "id": "18717f01-55ec-4cbf-ab37-f08fabb4b83c",
        "name": "julia3",
        "nickname": "julia do Ceara",
        "Contact": "+2345677",
        "birthDate": "2007-05-20T00:00:00.000Z",
        "gender": "female",
        "email": "56@example.com",
        "CPF": "456521",
        "parentName": null,
        "parentContact": null,
        "createdAt": "2025-11-05T13:58:13.119Z"
      },
      "form": {
        "id": "cmhm2c6gc000dck2l6v11l8dz",
        "Rating": 1,
        "Presence": 6,
        "Comments": "Mulher",
        "Rank": "AMARELA",
        "IFCE_student_registration": null,
        "Health_issues": null,
        "Medication_usage": null,
        "Allergies": null,
        "studentId": "18717f01-55ec-4cbf-ab37-f08fabb4b83c",
        "userId": null
      }
    }
  ],
  "coachs": [
    {
      "id": "beb23b8c-3e26-4156-a54c-2ea0bed5b097",
      "password": "$2y$09$LWRKIL4eJguDe5EqmgD5GO5tRVMjCxm7e7t9nuEA3rL5EWJ9nVGSe",
      "role": "ADMIN",
      "name": "Saulo",
      "email": "admin@gmail.com"
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
            minAge: z.coerce.number().min(0).optional(),
            maxAge: z.coerce.number().min(0).optional()
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

    @ApiResponse({status:201, description:"Coach atribuído à turma com sucesso",example:JSON.parse(`
        {
            "status": 201,
            "description": "Coach assigned to class successfully",
            "_response": {
                "classId": "cmhm17rw60000ck2l639gnmui",
                "userId": "beb23b8c-3e26-4156-a54c-2ea0bed5b097"
            }
        }
    `)})
    @ApiResponse({status:404, description:"Turma ou usuário não encontrado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @UseGuards(AuthGuard("jwt"))
    @Post("/:classId/assign-coach/:coachId")
    async assignCoach(@Param("classId") classId:string, @Param("coachId") coachId:string, @Res() res:Response){
        try{
            const _response = await this._classService.assignCoachsToClass(classId, coachId)
            res.status(201).send({
                status: 201,
                description: "Coach assigned to class successfully",
                _response
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