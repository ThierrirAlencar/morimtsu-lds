import { ApiProperty } from "@nestjs/swagger";

export class CreateEventDTO {
    @ApiProperty({
        name:"title",
        nullable:false,
        description:"O nome do evento"
    })
    title: string;

    @ApiProperty({
        name:"event_date",
        nullable:false,
        description:"A data do evento"
    })
    event_date: string;

    @ApiProperty({
        name:"class_id",
        nullable:false,
        description:"O id da turma aonde o evento ocorre"
    })
    class_id: string;
}

export class UpdateEventDTO {
    @ApiProperty({
        name:"title",
        nullable:true,
        description:"O nome do evento"
    })
    title?: string;

    @ApiProperty({
        name:"event_date",
        nullable:true,
        description:"A data do evento"
    })
    event_date?: string;

    @ApiProperty({
        name:"class_id",
        nullable:true,
        description:"O id da turma aonde o evento ocorre"
    })
    class_id?: string;
}