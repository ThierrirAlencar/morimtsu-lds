import { ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery } from "@nestjs/swagger";
import { IsString, Matches } from "class-validator"; 

export class createClassDTO{

    @ApiProperty({
        description:"Nome da turma"
    })
    name: string


    @IsString()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: "O horário de início deve estar no formato HH:mm",
    })
    @ApiProperty({
        description:"O horário de início de uma aula",
        nullable:true,
        example: "8:00"
    })
    startTime: string;

    @ApiProperty({
        description: "Horário de finalização da aula nesta turma (HH:mm)",
        example: "10:00",
    })
    @IsString()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: "O horário de fim deve estar no formato HH:mm",
    })
    endTime: string;

    @ApiProperty({
        description:"URl da imagem de ícone da turma",
        nullable:true
    })
    iconURL?: string

    @ApiProperty({
        description:"Descrição da turma",
        nullable:true
    })
    description:string | null

    @ApiProperty({
        description:"Id de uma lista de professores. Por padrão o usuário ADMIN será adicionado se este campo estiver em branco",
        nullable:true,
        isArray:true,
        example: ["cmh0lx2fe0000ildk9cbn0s0p"]
    })
    coachId?:string[]

    @ApiProperty({
        description:"A idade máxima de um aluno da turma",
        nullable:true,
    })
    maxAge: number
    
    @ApiProperty({
        description:"A idade mínima de um aluno da turma",
        nullable:true,
    })
    minAge: number
}

export class updateClassDTO{

    @ApiProperty({
        description:"Nome da turma",
        nullable:true
    })
    name?: string

    @IsString()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: "O horário de início deve estar no formato HH:mm",
    })
    @ApiProperty({
        description:"O horário de início de uma aula",
        nullable:true,
        example: "8:00"
    })
    startTime?: string;

    @ApiProperty({
        description: "Horário de finalização da aula nesta turma (HH:mm)",
        example: "10:00",
        nullable:true
    })
    @IsString()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/, {
        message: "O horário de fim deve estar no formato HH:mm",
    })
    endTime: string;

    @ApiProperty({
        description:"Descrição da turma",
        nullable:true
    })
    description?:string

    @ApiProperty({
        description:"URl da imagem de ícone da turma",
        nullable:true
    })
    iconURL?: string

        @ApiProperty({
        description:"A idade máxima de um aluno da turma",
        nullable:true,
    })
    maxAge: number
    
    @ApiProperty({
        description:"A idade mínima de um aluno da turma",
        nullable:true,
    })
    minAge: number
}


export class QueryClassParams {
    @ApiPropertyOptional({
        name: 'query',
        required: false,
        type: String,
        description: 'Search text to filter classes by name or description'
    })
    query?: string;

    @ApiPropertyOptional({
        name: 'minAge',
        required: false,
        type: Number,
        description: 'Minimum age filter for classes'
    })
    minAge?: number;

    @ApiPropertyOptional({
        name: 'maxAge',
        required: false,
        type: Number,
        description: 'Maximum age filter for classes'
    })
    maxAge?: number;
}

export class AssignCoachToClass{
    @ApiProperty({
        description:"Lista de Ids dos professores",
        isArray:true,
        nullable:false,
    })
    coachIds: string[]
}

