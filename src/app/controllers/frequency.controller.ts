import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { frequencyService } from 'src/core/services/frequency.service';
import { AuthRequest } from 'src/infra/interfaces/AuthRequest';
import {
  createFrequencyDTO,
  queryDeleteFrequencyDTO,
  queryGetManyFrequencyDTO,
  updateFrequencyDTO,
} from '../dto/frequency';
import z from 'zod';
import { baseError, entityDoesNotExists } from 'src/infra/utils/errors';
import { ApiHeader, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { frequencyListResponseJSON } from 'src/infra/utils/jsons/frequency/json';

@Controller('frequency')
export class frequencyController {
  constructor(private service: frequencyService) {}

  @ApiResponse({ status: 201, description: 'Criado com sucesso' })
  @ApiResponse({
    status: 404,
    description:
      'Alguma das entidades nao foi encontrada, forneça o token, o id da turma e o id do estudante corretamente e verifique sua existencia',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido reportar a desenvolvedores.',
  })
  @ApiResponse({
    status: 401,
    description: 'O valor de studentIDs foi indefinido ou nulo',
  })
  @UseGuards(AuthGuard('jwt'))
  @ApiHeader({ name: 'Autorization', description: 'O token jwt do usuário' })
  @Post('/')
  async post(
    @Req() req: AuthRequest,
    @Res() res: Response,
    @Body() Body: createFrequencyDTO,
  ) {
    const { classId: class_id, studentIDs: studentsIDs, Date:str_date } = Body;
    const { id: coach_id } = z
      .object({
        id: z.string().uuid(),
      })
      .parse(req.user);
    try {
      const __service = await this.service.create({
        class_id,
        coach_id,
        studentsIDs,
        date: str_date? new Date(str_date) : new Date()
      });

      res.status(201).send({
        description: 'Frequencia registrada com sucesso!',
        body: __service,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({ description: 'Erro desconhecido', error: err });
      }
    }
  }

  @ApiResponse({ status: 201, description: 'Criado com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Verfique se o registro de frequencia realmente existe',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido reportar a desenvolvedores.',
  })
  @Delete('/')
  async delete(@Query() query: queryDeleteFrequencyDTO, @Res() res: Response) {
    const { ids } = z
      .object({
        ids: z.array(z.string().cuid()),
      })
      .parse(query);
    
    try {
      const __service = await this.service.delete(ids);

      res.status(200).send({
        description: 'Deletado com sucesso',
        body: __service,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: 'Erro desconhecido',
          error: err,
        });
      }
    }
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiResponse({
    status: 200,
    description: 'Informações retornadas com sucesso',
    example: frequencyListResponseJSON,
  })
  @ApiResponse({
    status: 404,
    description:
      'Alguma das entidades nao foi encontrada, forneça o token, o id da turma e o id do estudante corretamente e verifique sua existencia',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido reportar a desenvolvedores.',
  })
  @ApiHeader({
    name: 'Authetication',
    description:
      'Token JWT do usuário (opcional) se o token for fornecido, irá filtrar a partir do professor que está logado',
    allowEmptyValue: true,
    required: false,
  })
  @Get('/')
  async getAll(
    @Query() query: queryGetManyFrequencyDTO,
    @Res() res: Response,
    @Req() req: AuthRequest,
  ) {
    const { classId, coachId, date:str_date, studentId } = query;
    const { id } = z
      .object({
        id: z.string().uuid().optional(),
      })
      .parse(req.user);

    const date = str_date ? new Date(str_date) : undefined;

    try {
      const _service = await this.service.filterFrequencyByQuery({
        classId,
        date,
        studentId,
        coachId: id || coachId,
      });

      res.status(200).send({
        description: 'Query feita com sucesso!!',
        body: _service,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          Description: 'Erro desconhecido',
          error: err,
        });
      }
    }
  }

  @ApiResponse({ status: 200, description: 'Frequências retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Aluno não encontrado' })
  @ApiResponse({ status: 500, description: 'Erro desconhecido reportar a desenvolvedores.' })
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'studentId', description: 'ID do estudante' })
  @Get('/student/:studentId')
  async getFrequencyFromStudent(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
    try {
      const frequencies = await this.service.getFrequencyFromStudent(studentId);

      res.status(200).send({
        description: 'Frequências do estudante retornadas com sucesso',
        body: frequencies,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: 'Erro desconhecido',
          error: err,
        });
      }
    }
  }

  @ApiResponse({ status: 200, description: 'Frequências retornadas com sucesso' })
  @ApiResponse({ status: 404, description: 'Turma não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro desconhecido reportar a desenvolvedores.' })
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'classId', description: 'ID da turma' })
  @Get('/class/:classId')
  async getFrequencyFromClass(@Param('classId') classId: string, @Res() res: Response) {
    try {
      const frequencies = await this.service.getFrequencyFromClass(classId);

      res.status(200).send({
        description: 'Frequências da turma retornadas com sucesso',
        body: frequencies,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: 'Erro desconhecido',
          error: err,
        });
      }
    }
  }

  @ApiResponse({ status: 200, description: 'Frequência atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Frequência não encontrada' })
  @ApiResponse({ status: 500, description: 'Erro desconhecido reportar a desenvolvedores.' })
  @UseGuards(AuthGuard('jwt'))
  @ApiParam({ name: 'id', description: 'ID da frequência' })
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body:updateFrequencyDTO,
    @Res() res: Response,
  ) {

    const {date:str_date} = z.object({
      date: z.string(),
    }).parse(body)
    const date = new Date(str_date);

    try {

      const updatedFrequency = await this.service.update(id, date);

      res.status(200).send({
        description: 'Frequência atualizada com sucesso',
        body: updatedFrequency,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send({
          description: 'Erro desconhecido',
          error: err,
        });
      }
    }
  }
}
