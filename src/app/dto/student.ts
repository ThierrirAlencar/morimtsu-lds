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
            description:"O telefone de contato do responsável legal do estudante estudante(Obrigatório se for menor de idade)",
            nullable:true
        })
        parentsContact?: string

        @ApiProperty({
            description:"O nome do responsável legal do estudante (Obrigatório se for menor de idade)",
            nullable:true
        })
        parentName?: string

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

        @ApiProperty({
            description:"A lista de IDs das turmas que o estudante irá entrar ao ser criado",
            nullable:true,
            example:["classId1","classId2"]
        })
        classId?:string[]
        
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


export class QueryStudentFiltersDTO{
    
    @ApiProperty({
        description:"Query de busca através do nome do aluno",
        nullable:true
    })
    query?: string
    @ApiProperty({
        description:"Query de busca através da idade mínima do aluno",
        nullable:true
    })
    minAge?:number
    
    @ApiProperty({
        description:"Query de busca através da idade máxima do aluno",
        nullable:true
    })
    maxAge?:number

    @ApiProperty({
        description:"Query de busca através do CPF do aluno",
        nullable:true
    })
    CPF?:string

    @ApiProperty({
        description:"Query de busca através do email do aluno",
        nullable:true
    })
    email?:string

    @ApiProperty({
        description:"Query de busca através da faixa do aluno",
        nullable:true,
        enumName:"Rank",
        enum:Rank
    })
    Rank?:Rank 
    
    @ApiProperty({
        description:"Query de busca através da turma ao qual o aluni pertence, informar id da turma",
        nullable:true
    })
    class?: string

    @ApiProperty({
        description:"Query de busca através do número de presenças que o aluno possuí",
        nullable:true
    })
    Presence?: number
}