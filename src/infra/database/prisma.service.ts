import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "generated/prisma";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit{
    async onModuleInit(){
        await this.$connect();
    }

    constructor() {
        super({
        log: ['query', 'info', 'warn', 'error'], // 👈 Mostra tudo no console
        errorFormat:"pretty"
    });
    }
}
