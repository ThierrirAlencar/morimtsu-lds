import { Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { log } from "console";
import { Response } from "express";
import { UserService } from "src/core/services/user.service";
import { AuthRequest } from "src/infra/interfaces/AuthRequest";
import { entityAlreadyExistsError, entityDoesNotExists, InvalidPasswordError, triedToUpdateForbidenValue } from "src/infra/utils/errors";
import { AuthService } from "src/infra/validators/auth.service";
import z, { email } from "zod";


@Controller("user")
export class userController{
    constructor(
        private userService:UserService,
        private authService:AuthService
    ){}

    @Post("/")
    async post(@Req() req:Request, @Res() res:Response){
        const {email,name,password,role} = z.object({
            name:z.string(),
            email:z.string().email(),
            password:z.string(),
            role:z.enum(["ADMIN","USER"]).optional().default("USER")
        }).parse(req.body)
    
        try{

            const _user = await this.userService.create({
                email,name,password,role
            })

            res.send({
                status:201, 
                description:"User created with success",
                body:{
                    name,email,role
                },
                _user
            })
        }catch(err){
            if(err instanceof entityAlreadyExistsError){
                res.status(err.http_status).send(err)
            }else{
                res.status(500).send({
                    description:"erro desconhecido"
                })
            }
        }
    }

    @UseGuards(AuthGuard("jwt"))
    @Put("/:id")
    async put(@Req() req: AuthRequest, @Res() res: Response){
        const {id} = z.object({
            id:z.string().uuid()
        }).parse(req.user)
        const body = z.object({
            name: z.string().optional(),
            password: z.string().optional(),
            role: z.enum(["ADMIN","USER"]).optional(),
            email: z.string().email().optional()
        }).parse(req.body)

        try{
            const _user = await this.userService.update(id, body as any)
            res.send({
                status:200,
                description:"User updated with success",
                body:_user
            })
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

    @UseGuards(AuthGuard("jwt"))
    @Delete("/:id")
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
    
    @UseGuards(AuthGuard("jwt"))
    @Get("/:id/profile")
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
 
    @Post('login')
    async login(@Req() req: Request, @Res() res:Response) {
      const { Email, Password } = z
        .object({
          Email: z
            .string({ message: 'Por favor informe um Email' })
            .email('Por favor informe um Email válido'),
          Password: z.string({ message: 'Informe a senha' }),
        })
        .parse(req.body);
  
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

}