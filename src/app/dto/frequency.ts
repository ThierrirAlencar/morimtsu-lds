import { ApiParam, ApiProperty, ApiQuery } from "@nestjs/swagger";


export class createFrequencyDTO{

    @ApiProperty({
        name:"classId",
        description:"O id da turma aonde a frequencia foi registrada",
        example:"askaskjlsjakksaksla",
        nullable:false
    })
    classId:string

    @ApiProperty({
        name:"Date",
        description:"A data aonde o aluno esteve presente, por padrão será o horário aonde a frequencia foi registrada",
        nullable:true
    })
    Date?: string

    @ApiProperty({
        name:"studentIDs",
        description:"A lista de IDs dos estudantes",
        isArray:true,
        nullable:false
    })
    studentIDs:string[]

}

export class queryDeleteFrequencyDTO{
    @ApiProperty({
        name:"id",
        description:"Lista de Ids do registro de frequencia"
    })
    ids:string[]
}

export class queryGetManyFrequencyDTO{
    @ApiProperty({
        name:"classId",
        description:"Id da turma",
        nullable:true
    })
    classId?: string

    @ApiProperty({
        name:"studentId",
        description:"Id do estudante",
        nullable:true
    })
    studentId?:string

    @ApiProperty({
        name:"date",
        description:"Data que se deseja conferir",
        nullable:true,
    })
    date?:string

    @ApiProperty({
        name:"coachId",
        description:"Id do professor que realizou a frequência",
        nullable:true
    })  
    coachId?:string
}

export class updateFrequencyDTO{
    @ApiProperty({
        name:"Data",
        description:"A nova data da frequencia",
        nullable:false
    })
    date:string
}