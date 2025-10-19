import { Controller, Patch, Put, Req, Res} from '@nestjs/common';
import { Response, Request } from 'express';
import { mailService } from 'src/core/services/mail.service';
import { entityDoesNotExists, InvalidInformationProvided } from 'src/infra/utils/errors';
import { z } from 'zod';

@Controller('auth')
export class AuthController {
    constructor(private mailService:mailService){}
    @Patch("")
    async sendCode(@Req() req:Request, @Res() res: Response){
        const {email} = z.object({
            email:z.string().email()
        }).parse(req.body)
    
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

    @Put("")
    async updateUserPassword(@Req() req:Request, @Res() res: Response){
        const {newPassword,passport,refString} = z.object({
            passport:z.string(),
            refString:z.string(),
            newPassword:z.string(),
        }).parse(req.body)
    
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