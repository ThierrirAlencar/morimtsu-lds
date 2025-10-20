import { Module } from '@nestjs/common';
import { UserModule } from './app/modules/user.module';
import { PrismaService } from './infra/database/prisma.service';
import { AuthModule } from './app/modules/auth.module';
import { baseController } from './app/base.controller';

@Module({
  imports: [UserModule,AuthModule],
  controllers: [baseController],
  providers: [PrismaService],
})
export class AppModule {}
