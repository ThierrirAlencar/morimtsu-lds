import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './lib/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);



  await app.listen(env.API_PORT,env.API_HOST,()=>{
    console.log("Server running on http://"+env.API_HOST+":"+env.API_PORT);
  });  
}
bootstrap();
