import { ApiParam, ApiProperty, ApiPropertyOptional, ApiQuery } from "@nestjs/swagger";

export class createClassDTO{

    @ApiProperty({
        description:"Nome da turma"
    })
    name: string

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
        description:"Id de um professor. Por padrão o usuário ADMIN será adicionado se este campo estiver em branco",
        nullable:true
    })
    coachId:string | null

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

    @ApiProperty({
        description:"Descrição da turma",
        nullable:true
    })
    description?:string

    @ApiProperty({
        description:"Id de um professor. Por padrão o usuário ADMIN será adicionado se este campo estiver em branco",
        nullable:true
    })
    coachId?:string | null

    
    @ApiProperty({
        description:"URl da imagem de ícone da turma",
        nullable:true
    })
    iconURL?: string
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