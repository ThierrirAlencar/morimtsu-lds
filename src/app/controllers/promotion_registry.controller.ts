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
    @ApiResponse({status:200, description:"Retornado com sucesso"})
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