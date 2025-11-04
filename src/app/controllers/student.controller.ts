
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res } from "@nestjs/common";
import { ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Prisma, Rank } from "generated/prisma";
import { studentServices } from "src/core/services/students.service";
import { baseError, entityAlreadyExistsError, entityDoesNotExists } from "src/infra/utils/errors";
import { CreateStudentDTO, QueryStudentFiltersDTO, UpdateStudentFormDTO, UpdateStudentPersonalDTO } from "../dto/student";
import z from "zod";
import { log } from "console";


@ApiTags('students')
@Controller("student")
export class StudentController {
    constructor(
        private studentService: studentServices
    ){}

    @Post("/")
    @ApiResponse({ status: 201, description: "Student created successfully" })
    @ApiResponse({ status: 409, description: "Já existe um estudante com este email ou CPF." })
    @ApiResponse({ status: 500, description: "Internal server error" })
    @ApiResponse({ status: 405, description: "Student is below 18 and needs to inform a parent contact" })
    async create(@Body() body: CreateStudentDTO, @Res() res: Response) {
        try {
            log("Creating student:", body);
            const student = await this.studentService.create(
                {
                    name: body.name,
                    email: body.email,
                    CPF: body.CPF,
                    Contact: body.contact,
                    birthDate: new Date(body.birthDate),
                    nickname: body.nickname,
                    gender: body.gender,
                    parentContact: body.parentsContact,
                    parentName: body.parentName
                },
                {   
                    studentId:"000000",
                    Rank: body.rank as Rank,
                    Comments: body.comments,
                    Presence: body.presence,
                    Rating: body.rating,
                    userId: "000000", // Temporary userId, adjust as necessary (when updating the student to coach, update this value to the user id)
                    Allergies:body.allergies,
                    Health_issues:body.health_issue,
                    IFCE_student_registration:body.ifce_registration,
                    Medication_usage:body.medicament_usage
                },
                body.classId
            );
            log("Student created successfully:", student);
            return res.status(201).json({
                message: "Student created successfully",
                data: student
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error", error });
        }
    }

    @Delete("/:id")
    @ApiResponse({ status: 200, description: "Student deleted successfully" })
    @ApiResponse({ status: 404, description: "Student not found" })
    async delete(@Param("id") id: string, @Res() res: Response) {
        try {
            const student = await this.studentService.delete(id);
            return res.status(200).json({
                message: "Student deleted successfully",
                data: student
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Put("/:id/personal")
    @ApiResponse({ status: 200, description: "Student personal info updated successfully" })
    @ApiResponse({ status: 404, description: "Student not found" })
    async updatePersonal(@Param("id") id: string, @Body() body: UpdateStudentPersonalDTO, @Res() res: Response) {
        try {
            const student = await this.studentService.updatePersonal(body, id);
            return res.status(200).json({
                message: "Student personal info updated successfully",
                data: student
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Put("/:id/form")
    @ApiResponse({ status: 200, description: "Student form updated successfully" })
    @ApiResponse({ status: 404, description: "Student not found" })
    async updateForm(@Param("id") id: string, @Body() body: UpdateStudentFormDTO, @Res() res: Response) {
        const {rank,comments,presence,rating} = body
        
        try {
            const form = await this.studentService.studentFormUpdate({
                Comments:comments,Presence:presence,Rating:rating,Rank:rank
            }, id);
            return res.status(200).json({
                message: "Student form updated successfully",
                data: form
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Get("/:id")
    @ApiResponse({ status: 200, description: "Student found successfully" , example:JSON.parse(`
            {
                "message": "Student found successfully",
                "data": {
                    "student": {
                    "nickname": "Julinha do Grau",
                    "email": "AnaJulia@example.com",
                    "personal": {
                        "name": "Ana Júlia",
                        "CPF": "123343439121838234547656",
                        "contact": "+55119912119299999",
                        "birthDate": "2000-05-20T00:00:00.000Z",
                        "gender": "female",
                        "age": 25
                    },
                    "parents": {
                        "parentName": null,
                        "parentContact": null
                    },
                    "classes": [
                        {
                        "id": "cmhcdqnxl0000ilv8zj32ekta",
                        "name": "Test Class With Coach Sla",
                        "description": "Classe com coach fornecido",
                        "icon_url": "https://example.com/icon.png",
                        "startTime": null,
                        "endTime": null,
                        "maxAge": 18,
                        "minAge": 10
                        }
                    ],
                    "createdAt": "2025-10-29T19:44:30.414Z",
                    "form": {
                        "id": "cmhcemjvb0001ilv8fvvdbws6",
                        "Rating": 2,
                        "Presence": 89,
                        "Comments": "Mulher",
                        "Rank": "BRANCA",
                        "studentId": "6411223c-a1ab-4adc-9624-d7a8a89a8f19"
                    }
                    }
                }
                }
    `)})
    @ApiResponse({ status: 200, description: "Student found successfully" })
    @ApiResponse({ status: 404, description: "Student not found" })
    async getOne(@Param("id") id: string, @Res() res: Response) {
        try {
            const student = await this.studentService.getStudent(id);
            return res.status(200).json({
                message: "Student found successfully",
                data: student
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error",error });
        }
    }

    @Post("/:id/join/:classId")
    @ApiResponse({ status: 200, description: "Student joined class successfully" })
    @ApiResponse({ status: 404, description: "Student or class not found" })
    @ApiResponse({ status: 405, description: "Student is too young or old to join this class" })
    async joinClass(@Param("id") id: string, @Param("classId") classId: string, @Res() res: Response) {
        try {
            const relation = await this.studentService.joinClass(id, classId);
            return res.status(200).json({
                message: "Student joined class successfully",
                data: relation
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Delete("/:id/leave/:classId")
    @ApiResponse({ status: 200, description: "Student left class successfully" })
    @ApiResponse({ status: 404, description: "Student or class not found or student is not even assigned to this class"  })
    @ApiResponse({ status: 405, description: "Student is too young or old to join this class" })
    async LeaveClass(@Param("id") id: string, @Param("classId") classId: string, @Res() res: Response) {
        try {
            const relation = await this.studentService.leaveClass(id, classId);
            return res.status(200).json({
                message: "Student left class successfully",
                data: relation
            });
        } catch (error) {
            if (error instanceof baseError) {
                return res.status(error.http_status).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Get()
    @ApiResponse({ status: 200, description: "Students filtered successfully", example:JSON.parse(`

{
  "message": "Students filtered successfully",
  "count": 3,
  "data": [
    {
      "student": {
        "id": "6411223c-a1ab-4adc-9624-d7a8a89a8f19",
        "nickname": "Julinha do Grau",
        "email": "AnaJulia@example.com",
        "personal": {
          "name": "Ana Júlia",
          "CPF": "123343439121838234547656",
          "contact": "+55119912119299999",
          "birthDate": "2000-05-20T00:00:00.000Z",
          "gender": "female",
          "rank": "BRANCA",
          "comments": "Mulher",
          "presence": 89,
          "rating": 2
        },
        "createdAt": "2025-10-29T19:44:30.414Z",
        "form": {
          "id": "cmhcemjvb0001ilv8fvvdbws6",
          "Rating": 2,
          "Presence": 89,
          "Comments": "Mulher",
          "Rank": "BRANCA",
          "studentId": "6411223c-a1ab-4adc-9624-d7a8a89a8f19"
        }
      }
    },
    {
      "student": {
        "id": "9a9d3bc6-0400-4176-9fb3-cee20dfbbe77",
        "nickname": "nao",
        "email": "annajuliasousa644@gmail.com",
        "personal": {
          "name": "Anna as",
          "CPF": "09976754454",
          "contact": "88992564083",
          "birthDate": "2000-03-21T00:00:00.000Z",
          "gender": "female"
        },
        "createdAt": "2025-10-30T19:55:03.947Z",
        "form": null
      }
    },
    {
      "student": {
        "id": "bbd9c409-1ac4-4d2d-999a-240f9a6308f7",
        "nickname": "ju",
        "email": "annajs@gmail.com",
        "personal": {
          "name": "ANNA JULIA DE SOUSA FELIX",
          "CPF": "9094837474",
          "contact": "8893746589",
          "birthDate": "2008-04-21T00:00:00.000Z",
          "gender": "female",
          "rank": "AMARELA",
          "comments": "",
          "presence": 9,
          "rating": 2
        },
        "createdAt": "2025-10-30T20:09:01.408Z",
        "form": {
          "id": "cmhduxxd30006d222pmjxaczp",
          "Rating": 2,
          "Presence": 9,
          "Comments": "",
          "Rank": "AMARELA",
          "studentId": "bbd9c409-1ac4-4d2d-999a-240f9a6308f7"
        }
      }
    }
  ]
}
        `)})
    @ApiQuery({ name: 'query', required: false, type: String, description: 'Search in name, email or nickname' })
    @ApiQuery({ name: 'minAge', required: false, type: Number, description: 'Minimum age filter' })
    @ApiQuery({ name: 'maxAge', required: false, type: Number, description: 'Maximum age filter' })
    @ApiQuery({ name: 'CPF', required: false, type: String, description: 'Filter by exact CPF match' })
    @ApiQuery({ name: 'email', required: false, type: String, description: 'Filter by exact email match' })
    @ApiQuery({ name: 'Presence', required: false, type: Number, description: 'Filter by student form presence' })
    @ApiQuery({ name: 'Rank', required: false, enum: Rank, description: 'Filter by student rank' })
    @ApiQuery({ name: 'class', required: false, type: String, description: 'Filter by class ID' })
    async query(@Query() queryParams: QueryStudentFiltersDTO, @Res() res: Response) {
        try {
            const filters: QueryStudentFiltersDTO = {
                query: queryParams.query,
                minAge: queryParams.minAge ? Number(queryParams.minAge) : undefined,
                maxAge: queryParams.maxAge ? Number(queryParams.maxAge) : undefined,
                CPF: queryParams.CPF,
                email: queryParams.email,
                Presence: queryParams.Presence ? Number(queryParams.Presence) : undefined,
                Rank: queryParams.Rank as Rank,
                class: queryParams.class
            };

            const students = await this.studentService.queryStudent(filters);
            
            return res.status(200).json({
                message: "Students filtered successfully",
                count: students.length,
                data: students
            });
        } catch (error) {
            return res.status(500).json({ 
                message: "Internal server error",
                error: error.message 
            });
        }
    }
}