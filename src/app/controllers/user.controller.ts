import { Body, Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Response } from "express";
import { UserService } from "src/core/services/user.service";
import { AuthRequest } from "src/infra/interfaces/AuthRequest";
import { baseError, entityAlreadyExistsError, entityDoesNotExists, InvalidPasswordError, triedToUpdateForbidenValue } from "src/infra/utils/errors";
import { AuthService } from "src/infra/validators/auth.service";
import z, { any, email } from "zod";
import { createUserDTO, LoginDTO, updateUserDTO } from "../dto/user";
import { ApiHeader, ApiParam, ApiResponse } from "@nestjs/swagger";
import {User} from "generated/prisma"
import { mailService } from "src/core/services/mail.service";

@Controller("user")
export class userController{
    constructor(
        private userService:UserService,
        private authService:AuthService,
        private mailService:mailService
    ){}
    
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso',example:
            {
                status:201, 
                description:"User created with success",
                body:{
                    name:"name",email:"email",role:"USER"
                },
                _user: any
            }
    })
    @ApiResponse({status:409, description:"Já existe um usuário com o nome ou email utilizado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiResponse({status:504, description:"Erro no envio do email. Isso nao quer dizer que o usuário não foi criado com sucesso, mas que não foi possível enviar o email de boas vindas, cheque a validade do email."})
    @Post("/")
    async post(@Body() body:createUserDTO, @Res() res:Response){
        const {email,name,password,role} = z.object({
            name:z.string(),
            email:z.string().email(),
            password:z.string(),
            role:z.enum(["ADMIN","USER"]).optional().default("USER")
        }).parse(body)
    
        try{
            
            const _user = await this.userService.create({
                email,name,password,role
            })
            const _mail = await this.mailService.sendWelcomeEmail(name,email)
            res.send({
                status:201, 
                description:"User created with success",
                body:{
                    name,email,role
                },
                _user,
                _mail
            })
        }catch(err){
            if(err instanceof entityAlreadyExistsError){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({
                    description:"erro desconhecido",
                    err
                })
            }
        }
    }

    @ApiResponse({status:201, description: "Update feito com sucesso", example:{
            status:200,
            description:"User updated with success",
            body:any
    }})
    @ApiResponse({status:404, description:"Usuário não encontrado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @UseGuards(AuthGuard("jwt"))
    @Put("/")
    async put(@Req() req: AuthRequest,@Body() body:updateUserDTO, @Res() res: Response){
        const {id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)
        const __body = z.object({
            name: z.string().optional(),
            password: z.string().optional(),
            role: z.enum(["ADMIN","USER"]).optional(),
            email: z.string().email().optional()
        }).parse(body)

        try{
            const _user = await this.userService.update(id, __body as any)
            res.send({
                status:201,
                description:"User updated with success",
                body:_user
            }).status(201)
        }catch(err){
            if(err instanceof entityDoesNotExists){
                res.status(err.http_status).send(err)
            }else if(err instanceof triedToUpdateForbidenValue){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({ description: "erro desconhecido" })
            }
        }
    }

    @ApiResponse({status:200, description:"usuário deletado com sucesso"})
    @ApiResponse({status:404, description:"Usuário não encontrado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiHeader({name:"Authorization", description:"Bearer token de autenticação"})
    @UseGuards(AuthGuard("jwt"))
    @Delete("/")
    async remove(@Req() req: AuthRequest, @Res() res: Response){
        const {id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)
        try{
            const _user = await this.userService.delete(id)
            res.send({
                status:200,
                description:"User deleted with success",
                body:_user
            })
        }catch(err){
            if(err instanceof entityDoesNotExists){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({ description: "erro desconhecido" })
            }
        }
    }

    @ApiResponse({status:200, description:"perfil retornado com sucesso", example:{
            status:200,
            description:"User profile fetched with success",
            body:{
                role:"USER",
                email:"example@gmail.com",
                name:"example Name"
            }
    }})
    @ApiResponse({status:404, description:"Usuário não encontrado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiHeader({name:"Authorization", description:"Bearer token de autenticação"})
    @UseGuards(AuthGuard("jwt"))
    @Get("/profile")
    async profile(@Req() req: AuthRequest, @Res() res: Response){
        const {id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)
        try{
            const profile = await this.userService.getProfile(id)
            res.send({
                status:200,
                description:"User profile fetched with success",
                body:profile
            })
        }catch(err){
            if(err instanceof entityDoesNotExists){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({ description: "erro desconhecido" })
            }
        }
    }
    
    @ApiResponse({status:404, description:"Usuário não encontrado"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiResponse({status: 200, description:"Login efetuado com sucesso", example:{
            statusCode: 200,
          description: 'Login realizado com sucesso',
          userId: "Token JWT",
    }})
    @ApiResponse({status:409,description:"Senha inválida"})
    @Post('login')
    async login(@Req() req: Request, @Body() body:LoginDTO,@Res() res:Response) {
      const { Email, Password } = z
        .object({
          Email: z
            .string({ message: 'Por favor informe um Email' })
            .email('Por favor informe um Email válido'),
          Password: z.string({ message: 'Informe a senha' }),
        })
        .parse(body);
  
      try {
        
        const response = await this.userService.login(Email, Password);
        
        const token = await this.authService.generateToken({id:response.userId});

        res.status(200).send({
          statusCode: 200,
          description: 'Login realizado com sucesso',
          userId: token,
        });

      } catch (err) {
        if (err instanceof entityDoesNotExists) {
            res.status(err.http_status).send(err)
        }else if (err instanceof InvalidPasswordError) {
            res.status(err.http_status).send(err)
        }
        res.status(500).send( {
            description: 'Erro desconhecido',
            error: err.message,
          },)
      }
    }

    @ApiResponse({status:200, description:"Lista de usuários retornada com sucesso"})
    @ApiResponse({status:403, description:"Usuário não tem permissão para executar essa ação"})
    @ApiResponse({status:500, description:"Erro desconhecido. Reportar para devs"})
    @ApiHeader({name:"Authorization", description:"Bearer token de autenticação"})
    @UseGuards(AuthGuard("jwt"))
    @Get("/all")
    async getAllUser(@Req() req: AuthRequest, @Res() res: Response){
        const {id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)

        try{
            const __service = await this.userService.getAllUsers(id);

            res.send({
                status:200,
                description:"All users fetched with success",
                body:__service
            })
        }catch(err){
            if(err instanceof baseError){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({ description: "erro desconhecido", error:err})
            }
        }
    }

}