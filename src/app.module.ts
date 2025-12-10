import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UserModule } from './app/modules/user.module';
import { PrismaService } from './infra/database/prisma.service';
import { AuthModule } from './app/modules/auth.module';
import { baseController } from './app/base.controller';
import { classModule } from './app/modules/class.module';
import { studentModule } from './app/modules/student.module';
import { frequencyModule } from './app/modules/frequency.module';
import { ConfigModule } from './app/modules/config.module';
import { EventModule } from './app/modules/event.module';
import { dashboardModule } from './app/modules/dashboard.module';
import { LoggerMiddleware } from './app/midleware/logger.middleware';
import { promotionRegistryModule } from './app/modules/promotion_registry.module';

@Module({
  imports: [UserModule,AuthModule,classModule,studentModule, frequencyModule, ConfigModule, EventModule, dashboardModule, promotionRegistryModule],
  controllers: [baseController],
  providers: [PrismaService],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
          .apply(LoggerMiddleware)
          .forRoutes("/")
    }
}
