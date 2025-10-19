import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000;
  const HOST = process.env.HOST ?? "0.0.0.0"
  const app = await NestFactory.create(AppModule);
  
  await app.listen(PORT,HOST,()=>{
      console.log(`Server running in: http://${HOST}:${PORT}`)
  });
}
bootstrap();
