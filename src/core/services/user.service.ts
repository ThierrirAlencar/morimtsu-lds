import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import { log } from 'console';
import { Prisma, Role } from 'generated/prisma';
import { PrismaService } from 'src/infra/database/prisma.service';
import { entityAlreadyExistsError, entityDoesNotExists, InvalidPasswordError, notEnoughPermissions, triedToUpdateForbidenValue } from 'src/infra/utils/errors';
import { string } from 'zod';
import { _includes } from 'zod/v4/core';

interface safe_user {
  name: string;
  email: string;
}
interface full_user{
  name:string,
  role:Role,
  email:string
}

@Injectable()
export class UserService {
  constructor(private __prisma: PrismaService) {}

  async create(data:Prisma.UserCreateInput): Promise<safe_user> {
    const {email,name,password,role} = data
    const doesAnyUserWithTheSameEmailAdressExists = await this.__prisma.user.findUnique({
      where:{
        email:data.email
      }
    })
    if(doesAnyUserWithTheSameEmailAdressExists){
      throw new entityAlreadyExistsError();
    }
    const doesAnyUserWithTheSameNameExists = await this.__prisma.user.findUnique({
      where:{
        name:data.name
      }
    })
    if(doesAnyUserWithTheSameNameExists){
      throw new entityAlreadyExistsError();
    }
    const _password = await hash(password,9);
    const _user = await this.__prisma.user.create({data:{email,name,password:_password,role:role || "USER"}});
    
    return {
      email:_user.email,
      name:_user.name,
    }
  }

  async update(id:string,data:Prisma.UserUpdateInput):Promise<safe_user>{
    const {email,password,name,role} = data
    
    const doesTheUserExists = await this.__prisma.user.findUnique({
      where:{
        id
      }
    })
    if(!doesTheUserExists){
      throw new entityDoesNotExists()
    }
    if(email){throw new triedToUpdateForbidenValue()}
    var _password = String(password);
    if(password){
      _password = await hash(String(password),9)
    }else{
      _password = doesTheUserExists.password;
    }

    const _user = await this.__prisma.user.update({
      data:{
        password:_password,
        name,
        role
      },
      where:{
        id
      }
    })

    return{
      email:_user.email,
      name:_user.name
    }
  }

  async delete(id:string):Promise<safe_user>{
    const doesTheUserExists = await this.__prisma.user.findUnique({
      where:{
        id
      }
    })
    if(!doesTheUserExists){
      throw new entityDoesNotExists()
    }

    const _user = await this.__prisma.user.delete({
      where:{
        id
      }
    })
    return{
      email:_user.email,
      name:_user.name
    }
  }

  async getProfile(id:string):Promise<full_user>{
    const doesTheUserExists = await this.__prisma.user.findUnique({
      where:{
        id
      }
    })
    if(!doesTheUserExists){
      throw new entityDoesNotExists()
    }

    const _user = await this.__prisma.user.findUnique({
      where:{
        id
      }
    })


    return{
      role:_user.role,
      email:_user.email,
      name:_user.name
    }
  }

  async login(email:string, password:string){
        const doesTheUserExists = await this.__prisma.user.findUnique({
            where:{
                email
            }
        })
        if(!doesTheUserExists){
            throw new entityDoesNotExists()
        }
        
        const doesThePasswordMatch = await compare(password,doesTheUserExists.password)

        if(!doesThePasswordMatch){
            throw new InvalidPasswordError()
        }
        
        return{
            userId:doesTheUserExists.id
        }
  }

  async getAllUsers(id:string){
    const doesTheUserExists = await this.__prisma.user.findUnique({
      where:{
        id
      }
    })

    if(!doesTheUserExists){
      throw new entityDoesNotExists()
    }

    if(doesTheUserExists.role !== "ADMIN"){
      throw new notEnoughPermissions()
    }

    const users = await this.__prisma.user.findMany({
        where: {
            role: 'USER'
        },
        include: {
            studentData: {
                include: {
                    student: true
                }
            }
        }
    });
    
    return{users}
  }


}
