import { ApiProperty } from "@nestjs/swagger"
import { Rank } from "generated/prisma"



export class CreateStudentDTO{

        @ApiProperty({
            description:"O nome do estudante"
        })
        name:string

        @ApiProperty({
            description:"O email do estudante"
        })
        email: string

        @ApiProperty({
            description:"O CPF do estudante"
        })
        CPF: string

        @ApiProperty({
            description:"O telefone de contato do estudante"
        })
        contact: string

        @ApiProperty({
            description:"O dia de aniversário do estudante"
        })
        birthDate:Date

        @ApiProperty({
            description:"O apelido do estudante",
            nullable:true
        })
        nickname?: string

        @ApiProperty({
            description:"A faixa do estudante",
            enum:Rank
        })
        rank:Rank

        @ApiProperty({
            description:"Informações extras sobre o estudante",
            nullable:true
        })
        comments?: string
        
        @ApiProperty({
            description:"A presença do estudante, Por padrão 0",
            nullable:true
        })
        presence?: number

        @ApiProperty({
            description:"A avaliação do estudante, por padrão 0"
        })
        rating?: number
        
}

export class UpdateStudentFormDTO{
        @ApiProperty({
            description:"A faixa do estudante",
            enum:Rank
        })
        rank:Rank

        @ApiProperty({
            description:"Informações extras sobre o estudante",
            nullable:true
        })
        comments?: string
        
        @ApiProperty({
            description:"A presença do estudante, Por padrão 0",
            nullable:true
        })
        presence?: number

        @ApiProperty({
            description:"A avaliação do estudante, por padrão 0"
        })
        rating?: number
}

export class UpdateStudentPersonalDTO{
            @ApiProperty({
            description:"O nome do estudante"
        })
        name:string

        @ApiProperty({
            description:"O email do estudante"
        })
        email: string

        @ApiProperty({
            description:"O CPF do estudante"
        })
        CPF: string

        @ApiProperty({
            description:"O telefone de contato do estudante"
        })
        contact: string

        @ApiProperty({
            description:"O dia de aniversário do estudante"
        })
        birthDate:Date

        @ApiProperty({
            description:"O apelido do estudante",
            nullable:true
        })
        nickname?: string
}