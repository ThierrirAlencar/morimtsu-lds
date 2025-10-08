import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "generated/prisma";



@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{
    async onModuleInit(){
        await this.$connect();
    }
}

// Define a generic BaseModel for common operations
export class BaseModel<T> {
  protected client: any;

  constructor(modelClient: any) {
    this.client = modelClient;
  }

  async findById(id: string): Promise<T | null> {
    return this.client.findUnique({ where: { id } });
  }

  async findAll(): Promise<T[]> {
    return this.client.findMany();
  }

  async create(data: any): Promise<T> {
    return this.client.create({ data });
  }

  async update(id: string, data: any): Promise<T> {
    return this.client.update({ where: { id }, data });
  }

  async delete(id: string): Promise<T> {
    return this.client.delete({ where: { id } });
  }
}
