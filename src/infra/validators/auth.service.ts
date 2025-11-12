import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'generated/prisma';

interface user{id:string, role: Role}
@Injectable()
export class AuthService {
  constructor(private jwtservice: JwtService) {
    // console.log("jwtservice:", this.jwtservice);
  }

  async generateToken({id, role}:user): Promise<string> {
    const payload = { sub:id, role };
    // console.log(payload)
    return this.jwtservice.sign(payload,{
      secret:process.env.JWT_SECRET,
      expiresIn:"7d"
    });
  }

  // async validateUser(payload: any): Promise<user> {
  //   // Aqui você pode implementar a lógica de validação do usuário
  //   return { id: payload.sub};
  // }
}