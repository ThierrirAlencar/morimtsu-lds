import { Module } from '@nestjs/common';
import { UserService } from '../../core/services/user.service';
import { PrismaService } from 'src/infra/database/prisma.service';
import { userController } from '../controllers/user.controller';
import { AuthService } from 'src/infra/validators/auth.service';
import { JwtService } from '@nestjs/jwt';
import { mailService } from 'src/core/services/mail.service';

@Module({
  controllers:[userController],
  providers: [UserService,PrismaService,AuthService,JwtService,mailService],
  exports:[UserService]
})
export class UserModule {}
