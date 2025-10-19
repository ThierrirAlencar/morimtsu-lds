import { Module } from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { PrismaService } from 'src/infra/database/prisma.service';
import { userController } from '../controllers/user.controller';

@Module({
  controllers:[userController],
  providers: [UserService,PrismaService],
})
export class UserModule {}
