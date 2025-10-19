import { Module } from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { PrismaService } from 'src/infra/database/prisma.service';
import { userController } from '../controllers/user.controller';
import { AuthService } from 'src/infra/validators/auth.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers:[userController],
  providers: [UserService,PrismaService,AuthService,JwtService],
})
export class UserModule {}
