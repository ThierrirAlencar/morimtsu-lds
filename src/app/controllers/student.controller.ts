
import { Body, Controller, Delete, Get, Param, Post, Put, Res } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Prisma } from "generated/prisma";
import { studentServices } from "src/core/services/students.service";
import { entityAlreadyExistsError, entityDoesNotExists } from "src/infra/utils/errors";
import { CreateStudentDTO, UpdateStudentFormDTO, UpdateStudentPersonalDTO } from "../dto/student";
import z from "zod";


@ApiTags('Students')
@Controller("student")
export class StudentController {
    constructor(
        private studentService: studentServices
    ){}

    @Post("/")
    @ApiResponse({ status: 201, description: "Student created successfully" })
    @ApiResponse({ status: 409, description: "Student already exists" })
    @ApiResponse({ status: 500, description: "Internal server error" })
    async create(@Body() body: CreateStudentDTO, @Res() res: Response) {
        try {
            const student = await this.studentService.create(
                {
                    name: body.name,
                    email: body.email,
                    CPF: body.CPF,
                    Contact: body.contact,
                    birthDate: new Date(body.birthDate),
                    nickname: body.nickname
                },
                {   
                    studentId:"000000", //this really does not need to exists
                    Rank: body.rank,
                    Comments: body.comments,
                    Presence: body.presence,
                    Rating: body.rating
                }
            );

            return res.status(201).json({
                message: "Student created successfully",
                data: student
            });
        } catch (error) {
            if (error instanceof entityAlreadyExistsError) {
                return res.status(409).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
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
            if (error instanceof entityDoesNotExists) {
                return res.status(404).json(error);
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
            if (error instanceof entityDoesNotExists) {
                return res.status(404).json(error);
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
            if (error instanceof entityDoesNotExists) {
                return res.status(404).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Get("/:id")
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
            if (error instanceof entityDoesNotExists) {
                return res.status(404).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }

    @Post("/:id/join/:classId")
    @ApiResponse({ status: 200, description: "Student joined class successfully" })
    @ApiResponse({ status: 404, description: "Student or class not found" })
    async joinClass(@Param("id") id: string, @Param("classId") classId: string, @Res() res: Response) {
        try {
            const relation = await this.studentService.joinClass(id, classId);
            return res.status(200).json({
                message: "Student joined class successfully",
                data: relation
            });
        } catch (error) {
            if (error instanceof entityDoesNotExists) {
                return res.status(404).json(error);
            }
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}