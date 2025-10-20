import { ApiProperty } from "@nestjs/swagger";

export class sendCodeDTO{
    @ApiProperty({description:"The Email will be sent to this email adresss"})
    email: string
}

export class updateUserPassword{
    @ApiProperty({description:"The code informed by the user"})
    passport:string
    @ApiProperty({description:"The string provided by the send-code route"})
    refString:string
    @ApiProperty({description:"The new password informed by the user"})
    newPassword:string
}