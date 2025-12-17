import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { get } from "http";
import { PromotionRegistryService } from "src/core/services/promotion_registry.service";
import { baseError } from "src/infra/utils/errors";

@ApiTags("promotion_registry")
@Controller("promotion_registry")
export class PromotionRegistryController{
    constructor(
        private service: PromotionRegistryService
    ){

    }
    @ApiResponse({status:200, description:"Retornado com sucesso", example:JSON.parse(`
            {
  "description": "Sucessfully returned promotion history",
  "response": [
    {
      "id": "cmj0cj3r60001ilroi7wgv8e3",
      "date": "2025-12-10T18:32:01.214Z",
      "student_id": "2e1dfb8b-6dc4-4cab-b894-ecff99742742",
      "coach_id": "beb23b8c-3e26-4156-a54c-2ea0bed5b097",
      "from_rank": "AMARELA",
      "to_rank": "AMARELA",
      "student_name": "julia3"
    }]
    }
        `)})
    @Get("/")
    @UseGuards(AuthGuard("jwt"))
    async getAll(@Res() res:Response){
        try{   
            const response = await this.service.getAll()
            
            res.status(200).send({
                description:"Sucessfully returned promotion history",
                response
            })
        }catch(err){
            if(err instanceof baseError){
                res.status(err.http_status).send(err)
            }else
            {
                res.status(500).send({
                    description:"Erro desconhecido",
                    error:err
                })
            }
        }
    }
}