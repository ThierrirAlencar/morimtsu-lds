import { Controller, Get, Res } from "@nestjs/common";
import { Response } from "express";
@Controller("")
export class baseController{
    @Get("/")
    async get(@Res() res:Response){
        res.redirect("/docs")
    }
}
