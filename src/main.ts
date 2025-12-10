import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HOST, PORT } from './infra/lib/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', 
    methods: 'GET,POST,PUT,DELETE,PATCH',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('MorimitsuLDS-api')
    .setDescription('')
    .setVersion('1.0')
    .addTag("user","rotas de criação e gerenciamento de usuários")
    .addTag("auth","rotas de autenticação de usuários")
    .addTag("class","rotas de criação e gerenciamento de turmas")
    .addTag("students","rotas de criação e gerenciamento de estudantes")
    .addTag("frequency","rotas para criação e gerenciamente da frequencia dos alunos")
    .addTag("config","rotas para criação e gerenciamento das configurações de promoção")
    .addTag("events","rotas para gerenciamento de eventos")
    .addTag("promotion_registry","rota para receber o histórico de promoções")
    .addBearerAuth(
      {
        description:"JWT Authorization header using the Bearer scheme. Example: 'Bearer {token}'",
        name:"Authorization",
        in:"header",
        type: 'http',
        scheme: 'bearer',
      }
    )
    .build();
    
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(PORT,HOST,()=>{
      console.log(`Server running in: http://${HOST}:${PORT}`)
  });
}
bootstrap();
