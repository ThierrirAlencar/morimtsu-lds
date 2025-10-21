import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const PORT = process.env.PORT ?? 3000;
  const HOST = process.env.HOST ?? "0.0.0.0"
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*', // ou especificamente: origin: 'http://192.168.0.7:8082'
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('MorimitsuLDS-api')
    .setDescription('')
    .setVersion('1.0')
    .addTag("user","rotas de criação e gerenciamento de usuários")
    .addTag("Auth","Rotas de autenticação de usuários")
    .addTag("class","rotas de criação e gerenciamento de turmas")
    .addTag("students","rotas de criação e gerenciamento de estudantes")
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);


  await app.listen(PORT,HOST,()=>{
      console.log(`Server running in: http://${HOST}:${PORT}`)
  });
}
bootstrap();
