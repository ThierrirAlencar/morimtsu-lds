import { Body, Controller, Patch, Put, Req, Res} from '@nestjs/common';
import { Response, Request } from 'express';
import { mailService } from 'src/core/services/mail.service';
import { entityDoesNotExists, InvalidInformationProvided } from 'src/infra/utils/errors';
import { z } from 'zod';
import { sendCodeDTO, updateUserPassword } from '../dto/auth';
import { ApiResponse } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private mailService:mailService){}

    @ApiResponse({status:200, description:"Email enviado com sucesso", example:{
            DescriptioN:"Successfully sent email",
            codeString:"String enviada para o usuário, armazenar em cookie"      
    }})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Patch("")
    async sendCode(@Body() body:sendCodeDTO, @Res() res: Response){
        const {email} = z.object({
            email:z.string().email()
        }).parse(body)
    
        try{
            const response = await this.mailService.sendRecoveryEmail(email);

            res.status(200).send({
              DescriptioN:"Successfully sent email",
              codeString:response      
            })
        }catch(err){
            res.status(500).send({
                Description:"Email error"
            })
        }
    }


    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @Put("")
    async updateUserPassword(@Req() req:Request,@Body() body:updateUserPassword, @Res() res: Response){
        const {newPassword,passport,refString} = body
    
        try{
            const response = await this.mailService.updateUserPasswordBasedInPassword(refString,passport,newPassword);
            
            res.status(200).send({
              DescriptioN:"Successfully updated email password",
              userUpdated:response.email      
            })
        }catch(err){
            if(err instanceof entityDoesNotExists){
                res.status(404).send(err)
            }else if(err instanceof InvalidInformationProvided){
                res.status(404).send(err)
            }else{
                res.status(500).send({
                    Description:"Email error"
                })
            }

        }
    }

}