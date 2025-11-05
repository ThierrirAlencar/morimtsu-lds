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

