import { Module } from '@nestjs/common';
import { PrismaService } from './infra/db/prismaService';


@Module({
  imports: [],
  controllers: [],  
  providers: [PrismaService],
})
export class AppModule {}
