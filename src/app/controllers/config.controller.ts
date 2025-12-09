import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from 'src/core/services/config.service';
import { baseError, entityDoesNotExists } from 'src/infra/utils/errors';
import { createConfigDTO, updateConfigDTO } from '../dto/config';
import { ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Rank } from 'generated/prisma';

@Controller('/config')
export class ConfigController {
  constructor(private _configService: ConfigService) {}

  @ApiResponse({
    status: 201,
    description: 'Configuração de promoção criada com sucesso',
    example: {
      description: 'Config created with success',
      _response: {
        id: 'cmhm17rw60000ck2l639gnmui',
        name: 'Promoção para Faixa Branca',
        ref_rank: 'BRANCA',
        module: 1,
        needed_frequency: 80,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflito: Configuração já existe para esse rank',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  async create(@Body() body: createConfigDTO, @Res() res: Response) {
    const { name, ref_rank, module, needed_frequency } = body;

    try {
      const _response = await this._configService.createConfigIfNotExists({
        name,
        ref_rank,
        module,
        needed_frequency,
      });

      res.status(201).send({
        description: 'Config created with success',
        _response,
      });
    } catch (err) {
      if (err instanceof baseError) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send(err.message);
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Configuração atualizada com sucesso',
    example: {
      status: 200,
      description: 'Config updated with success',
      _config: {
        id: 'cmhm17rw60000ck2l639gnmui',
        name: 'Promoção para Faixa Branca',
        ref_rank: 'BRANCA',
        module: 1,
        needed_frequency: 80,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() body: updateConfigDTO,
    @Res() res: Response,
  ) {
    const { name, ref_rank, module, needed_frequency } = body;

    try {
      const _config = await this._configService.updateConfigById(id, {
        name,
        ref_rank,
        module,
        needed_frequency,
      });

      res.status(200).send({
        status: 200,
        description: 'Config updated with success',
        _config,
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send(err);
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Configuração removida com sucesso',
  })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:id')
  async removeById(@Param('id') id: string, @Res() res: Response) {
    try {
      const _response = await this._configService.deleteConfigById(id);

      res.status(200).send({
        status: 200,
        description: 'Config deleted with success',
        ..._response,
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send(err);
      }
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Configuração por rank retornada com sucesso',
    example: {
      status: 200,
      description: 'Config fetched with success',
      config: {
        id: 'cmhm17rw60000ck2l639gnmui',
        name: 'Promoção para Faixa Branca',
        ref_rank: 'BRANCA',
        module: 1,
        needed_frequency: 80,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Configuração não encontrada para o rank informado',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('/rank/:ref_rank')
  async getByRank(@Param('ref_rank') ref_rank: Rank, @Res() res: Response) {
    try {
      const config = await this._configService.getConfigByRank(ref_rank);

      if (!config) {
        return res.status(404).send({
          status: 404,
          description: 'Config not found for the provided rank',
        });
      }

      res.status(200).send({
        status: 200,
        description: 'Config fetched with success',
        config,
      });
    } catch (err) {
      res.status(500).send({
        description: 'Unknown error',
      });
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Configuração por ID retornada com sucesso',
    example: {
      status: 200,
      description: 'Config fetched with success',
      config: {
        id: 'cmhm17rw60000ck2l639gnmui',
        name: 'Promoção para Faixa Branca',
        ref_rank: 'BRANCA',
        module: 1,
        needed_frequency: 80,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Configuração não encontrada' })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('/:id')
  async getById(@Param('id') id: string, @Res() res: Response) {
    try {
      const config = await this._configService.getConfigById(id);

      if (!config) {
        return res.status(404).send({
          status: 404,
          description: 'Config not found',
        });
      }

      res.status(200).send({
        status: 200,
        description: 'Config fetched with success',
        config,
      });
    } catch (err) {
      res.status(500).send({
        description: 'Unknown error',
      });
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Todas as configurações retornadas com sucesso',
    example: {
      status: 200,
      description: 'All configs fetched with success',
      configs: [
        {
          id: 'cmhm17rw60000ck2l639gnmui',
          name: 'Promoção para Faixa Branca',
          ref_rank: 'BRANCA',
          module: 1,
          needed_frequency: 80,
        },
      ],
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  async getAll(@Res() res: Response) {
    try {
      const configs = await this._configService.getAllConfigs();

      res.status(200).send({
        status: 200,
        description: 'All configs fetched with success',
        configs,
      });
    } catch (err) {
      res.status(500).send({
        description: 'Unknown error',
      });
    }
  }

  @ApiResponse({
    status: 200,
    description: 'Configuração removida com sucesso por rank',
  })
  @ApiResponse({
    status: 404,
    description: 'Nenhuma configuração encontrada para o rank',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro desconhecido. Reportar para devs',
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete('/rank/:ref_rank')
  async removeByRank(@Param('ref_rank') ref_rank: Rank, @Res() res: Response) {
    try {
      const _response = await this._configService.deleteConfigByRank(ref_rank);

      res.status(200).send({
        status: 200,
        description: 'Config deleted with success by rank',
        ..._response,
      });
    } catch (err) {
      if (err instanceof entityDoesNotExists) {
        res.status(err.http_status).send(err);
      } else {
        res.status(500).send(err);
      }
    }
  }
}
