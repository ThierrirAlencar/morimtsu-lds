import { ApiProperty } from "@nestjs/swagger";
import { Role } from "generated/prisma";

export class createUserDTO{
    @ApiProperty()
    name: String;

    @ApiProperty()
    email: String

    @ApiProperty()
    password: String

    @ApiProperty({enum:["ADMIN","USER"]})
    role: Role | undefined
}

export class updateUserDTO{
    @ApiProperty()
    name: String;

    @ApiProperty()
    password: String

    @ApiProperty({enum:["ADMIN","USER"]})
    role: Role | undefined
}

export class LoginDTO{
    @ApiProperty({})
    Email:string

    @ApiProperty({})
    Password:string
}

export class QueryAllUsersDTO{
    @ApiProperty({enum:["ADMIN","USER"], required:false, description:"Se fornecido, filtra os usuários por esse papel"})
    role?: Role
}

export class QueryUser{
    @ApiProperty({description:"ID do usuário", example:"cmhm17rw60000ck2l639gnmui"})
    id:string
}