import { Injectable } from "@nestjs/common";
import { hash } from "bcryptjs";
import { retry } from "rxjs";
import { PrismaService } from "src/infra/database/prisma.service";
import { EmailType, SendEmail } from "src/infra/lib/nodemailer";
import { entityDoesNotExists, FSMTPError, InvalidInformationProvided } from "src/infra/utils/errors";
import { Gen5digitsValidationCode } from "src/infra/utils/genValidEmailCode";
import { th } from "zod/v4/locales";


@Injectable()
export class mailService{
    constructor(private prisma:PrismaService){}

    async sendRecoveryEmail(userEmail:string){
        const randCode = Gen5digitsValidationCode()
        const email:EmailType = {
            subject:"no-reply email de recuperação de senha",
            html:`
                <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <title>Recuperação de Senha</title>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f6f8;
                        margin: 0;
                        padding: 0;
                        color:1D1E1E
                        }
                        .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        }
                        .header {
                        background-color: #7F1A17;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        }
                        .content {
                        padding: 30px;
                        color: #333333;
                        font-size: 16px;
                        }
                        .button {
                        display: block;
                        width: fit-content;
                        margin: 30px auto;
                        padding: 12px 25px;
                        background-color: #7F1A17;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        }
                        .footer {
                        font-size: 14px;
                        color: #888888;
                        text-align: center;
                        padding: 20px;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="header">
                        <img src="https://github.com/srtaayanamy/Morimitsu/blob/main/src/assets/Logo.png" alt="Logo" width="120" />
                        <h1>Recuperação de Senha</h1>
                        </div>
                        <div class="content">
                        <p>Olá,</p>
                        <p>Recebemos uma solicitação para redefinir sua senha. Se você fez essa solicitação, digite o código abaixo</p>

                            <strong>${randCode}</strong>            

                        <p>Se você não solicitou essa alteração, pode ignorar este e-mail. Sua senha permanecerá a mesma.</p>

                        <p>Atenciosamente,<br/>Equipe ImageForge</p>
                        </div>
                        <div class="footer">
                            Este é um e-mail automático. Não responda diretamente a esta mensagem.
                        </div>
                    </div>
                    </body>
                    </html>

            `,
            text:"Recuperação de Senha da Plataforma Morimitsu",
            to:userEmail
        }
        try{
            //enviar o email
            await SendEmail(email)
            return `${userEmail}-${randCode}`
        }catch(err){
            throw new FSMTPError()
        }
    }

    async updateUserPasswordBasedInPassword(refString:string,passedCode:string,newPassword:string){
        const [email,code] = splitStringAtDash(refString)
        const doesTheUserExists = await this.prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!doesTheUserExists){
            throw new entityDoesNotExists()
        }
        if(code != passedCode){
            throw new InvalidInformationProvided()
        }
        
        const _password = await hash(newPassword,9)
        const response = await this.prisma.user.update({
            data:{
                password:_password
            },
            where:{
                id:doesTheUserExists.id
            }
        })

        return response
    }

    async sendWelcomeEmail(userEmail:string,userName:string){
        const email:EmailType = {
            subject:"Bem-vindo à Plataforma Morimitsu!",
                        html:`
                <!DOCTYPE html>
                    <html lang="pt-BR">
                    <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <title>Recuperação de Senha</title>
                    <style>
                        body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f6f8;
                        margin: 0;
                        padding: 0;
                        color:1D1E1E
                        }
                        .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                        }
                        .header {
                        background-color: #7F1A17;
                        color: #ffffff;
                        padding: 20px;
                        text-align: center;
                        }
                        .content {
                        padding: 30px;
                        color: #333333;
                        font-size: 16px;
                        }
                        .button {
                        display: block;
                        width: fit-content;
                        margin: 30px auto;
                        padding: 12px 25px;
                        background-color: #7F1A17;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        font-weight: bold;
                        }
                        .footer {
                        font-size: 14px;
                        color: #888888;
                        text-align: center;
                        padding: 20px;
                        }
                    </style>
                    </head>
                    <body>
                    <div class="container">
                        <div class="header">
                        <img src="https://github.com/srtaayanamy/Morimitsu/blob/main/src/assets/Logo.png" alt="Logo" width="120" />
                        <h1>Bem vindo à plataforma Morimitsu!</h1>
                        </div>
                        <div class="content">
                        <p>Olá,<strong>${userName}</strong></p>
                        <p>Esté email foi cadastrado na plataforma <a href="https://github.com/srtaayanamy/Morimitsu">Morimitsu</a></p>
                        <p>Se não foi você quem se cadastrou na nossa aplicaçaõ usando este email, por favor entre em contato e solicite a remoção!</p>

                        <p>Atenciosamente,<br/>Equipe Morimitsu</p>
                        </div>
                        <div class="footer">
                            Este é um e-mail automático. Não responda diretamente a esta mensagem.
                        </div>
                    </div>
                    </body>
                    </html>

            `,
            text:"Bem-vindo à Plataforma Morimitsu!",
            to:userEmail
        }

        try{
            //enviar o email
            await SendEmail(email)
            return `Welcome email sent to ${userName}`
        }catch(err){
            throw new FSMTPError()
        }

    }
}

function splitStringAtDash(refString: string): [any, any] {
    throw new Error("Function not implemented.");
}
