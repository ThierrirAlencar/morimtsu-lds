import { ApiProperty } from "@nestjs/swagger";

export class createClassDTO{

    @ApiProperty({
        description:"Nome da turma"
    })
    name: string

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
}