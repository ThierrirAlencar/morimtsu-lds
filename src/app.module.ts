import { Module } from '@nestjs/common';
import { UserModule } from './app/modules/user.module';
import { PrismaService } from './infra/database/prisma.service';
import { AuthModule } from './app/modules/auth.module';

@Module({
  imports: [UserModule,AuthModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
