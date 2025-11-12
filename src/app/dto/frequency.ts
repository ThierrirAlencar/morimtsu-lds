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
    Date?: String

    @ApiProperty({
        name:"studentId",
        description:"O id do estudante",
        nullable:false
    })
    studentId:string

}

export class queryDeleteFrequencyDTO{
    @ApiProperty({
        name:"id",
        description:"O id do registro de frequencia"
    })
    id:string
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
    date?:Date

    @ApiProperty({
        name:"coachId",
        description:"Id do professor que realizou a frequência",
        nullable:true
    })  
    coachId?:string
}