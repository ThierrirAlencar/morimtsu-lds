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