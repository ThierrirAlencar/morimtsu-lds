import { Module } from '@nestjs/common';
import { UserModule } from './app/modules/user.module';
import { PrismaService } from './infra/database/prisma.service';
import { AuthModule } from './app/modules/auth.module';
import { baseController } from './app/base.controller';
import { classModule } from './app/modules/class.module';
import { studentModule } from './app/modules/student.module';
import { frequencyModule } from './app/modules/frequency.module';

@Module({
  imports: [UserModule,AuthModule,classModule,studentModule, frequencyModule],
  controllers: [baseController],
  providers: [PrismaService],
})
export class AppModule {}
