import { Body, Controller, Delete, Get, Param, Post, Put, Query, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { EventsService } from "src/core/services/events.service";
import { baseError, entityDoesNotExists } from "src/infra/utils/errors";
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import z from "zod";
import { CreateEventDTO, UpdateEventDTO } from "../dto/event";


@ApiTags("events")
@Controller("/events")
export class EventsController {
  constructor(private _eventsService: EventsService) {}

  @ApiResponse({
    status: 201,
    description: "Evento criado com sucesso",
    example: {
      status: 201,
      description: "Event created successfully",
      event: {
        id: "cmhm17rw60000ck2l639gnmui",
        title: "Aula de Jiu-Jitsu",
        event_date: "2025-12-20T10:00:00.000Z",
        class_id: "cmhm17rw60000ck2l639gnmui",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Turma não encontrada" })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @Post("/")
  async create(@Body() body: CreateEventDTO, @Res() res: Response) {
    
    const { title, event_date:str_date, class_id } = body;

    const event_date = new Date(str_date)

    try {
      const event = await this._eventsService.create({
        title,
        event_date: new Date(event_date),
        class_id,
      });

      res.status(201).send({
        status: 201,
        description: "Event created successfully",
        event,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: "Unknown error",
          error: err,
        });
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: "Evento retornado com sucesso",
    example: {
      status: 200,
      description: "Event fetched successfully",
      event: {
        id: "cmhm17rw60000ck2l639gnmui",
        title: "Aula de Jiu-Jitsu",
        event_date: "2025-12-20T10:00:00.000Z",
        class_id: "cmhm17rw60000ck2l639gnmui",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Evento não encontrado" })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({ name: "id", description: "ID do evento" })
  @Get("/:id")
  async getById(@Param("id") id: string, @Res() res: Response) {
    try {
      const event = await this._eventsService.getById(id);

      res.status(200).send({
        status: 200,
        description: "Event fetched successfully",
        event,
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: "Unknown error",
          error: err,
        });
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: "Evento atualizado com sucesso",
    example: {
      status: 200,
      description: "Event updated successfully",
      event: {
        id: "cmhm17rw60000ck2l639gnmui",
        title: "Aula de Jiu-Jitsu - Atualizado",
        event_date: "2025-12-20T10:00:00.000Z",
        class_id: "cmhm17rw60000ck2l639gnmui",
      },
    },
  })
  @ApiResponse({ status: 404, description: "Evento não encontrado" })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({ name: "id", description: "ID do evento" })
  @Put("/:id")
  async update(
    @Param("id") id: string,
    @Body() body: UpdateEventDTO,
    @Res() res: Response,
  ) {
    const { title, event_date, class_id } = body;

    try {
      const event = await this._eventsService.updateById(id, {
        title,
        event_date: event_date ? new Date(event_date) : undefined,
        class_id,
      });

      res.status(200).send({
        status: 200,
        description: "Event updated successfully",
        event,
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: "Unknown error",
          error: err,
        });
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: "Evento deletado com sucesso",
  })
  @ApiResponse({ status: 404, description: "Evento não encontrado" })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({ name: "id", description: "ID do evento" })
  @Delete("/:id")
  async delete(@Param("id") id: string, @Res() res: Response) {
    try {
      await this._eventsService.delete(id);

      res.status(200).send({
        status: 200,
        description: "Event deleted successfully",
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: "Unknown error",
          error: err,
        });
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: "Eventos da turma retornados com sucesso",
    example: {
      status: 200,
      description: "Events fetched successfully",
      events: [
        {
          id: "cmhm17rw60000ck2l639gnmui",
          title: "Aula de Jiu-Jitsu",
          event_date: "2025-12-20T10:00:00.000Z",
          class_id: "cmhm17rw60000ck2l639gnmui",
        },
      ],
    },
  })
  @ApiResponse({ status: 404, description: "Turma não encontrada" })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @ApiParam({ name: "classId", description: "ID da turma" })
  @Get("/class/:classId")
  async listByClass(@Param("classId") classId: string, @Res() res: Response) {
    try {
      const events = await this._eventsService.listByClass(classId);

      res.status(200).send({
        status: 200,
        description: "Events fetched successfully",
        events,
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: "Unknown error",
          error: err,
        });
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: "Eventos no intervalo de data retornados com sucesso",
    example: {
      status: 200,
      description: "Events fetched successfully",
      events: [
        {
          id: "cmhm17rw60000ck2l639gnmui",
          title: "Aula de Jiu-Jitsu",
          event_date: "2025-12-20T10:00:00.000Z",
          class_id: "cmhm17rw60000ck2l639gnmui",
        },
      ],
    },
  })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @ApiQuery({ name: "startDate", description: "Data inicial (ISO 8601)" })
  @ApiQuery({ name: "endDate", description: "Data final (ISO 8601)" })
  @Get("/")
  async listByDateRange(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Res() res: Response,
  ) {
    try {
      const parsedFilters = z
        .object({
          startDate: z.string().datetime(),
          endDate: z.string().datetime(),
        })
        .parse({ startDate, endDate });

      const events = await this._eventsService.listByDateRange(
        new Date(parsedFilters.startDate),
        new Date(parsedFilters.endDate),
      );

      res.status(200).send({
        status: 200,
        description: "Events fetched successfully",
        events,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).send({
          description: "Invalid date format",
          errors:err,
        });
      } else {
        res.status(500).send({
          description: "Unknown error",
          error: err,
        });
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: "Todos os eventos retornados com sucesso",
    example: {
      status: 200,
      description: "All events fetched successfully",
      events: [
        {
          id: "cmhm17rw60000ck2l639gnmui",
          title: "Aula de Jiu-Jitsu",
          event_date: "2025-12-20T10:00:00.000Z",
          class_id: "cmhm17rw60000ck2l639gnmui",
        },
      ],
    },
  })
  @ApiResponse({ status: 500, description: "Erro desconhecido" })
  @UseGuards(AuthGuard("jwt"))
  @Get("/all")
  async listAll(@Res() res: Response) {
    try {
      const events = await this._eventsService.listAll();

      res.status(200).send({
        status: 200,
        description: "All events fetched successfully",
        events,
      });
    } catch (err) {
      res.status(500).send({
        description: "Unknown error",
        error: err,
      });
    }
  }
}
