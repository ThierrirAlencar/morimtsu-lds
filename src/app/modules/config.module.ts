import { Module } from '@nestjs/common';
import { ConfigService } from 'src/core/services/config.service';
import { PrismaService } from 'src/infra/database/prisma.service';
import { ConfigController } from '../controllers/config.controller';

@Module({
    imports:[],
    providers:[PrismaService, ConfigService],
    exports:[],
    controllers: [ConfigController]
})
export class ConfigModule{}