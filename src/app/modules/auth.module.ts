import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/infra/database/prisma.service';
import { AuthService } from 'src/infra/validators/auth.service';
import { JwtStrategy } from 'src/infra/validators/jwt.strategy';
import { AuthController } from '../controllers/auth.controller';
import { mailService } from 'src/core/services/mail.service';
import { JWT_SECRET } from 'src/infra/lib/env';


@Module({
    imports:[
        PassportModule,
        JwtModule.register({
              secret: JWT_SECRET,
              signOptions: { expiresIn: '30d' },
        }),
    ],
    providers:[AuthService,JwtService,JwtStrategy,PrismaService,mailService],
    exports:[AuthService],
    controllers: [AuthController]
})
export class AuthModule {}