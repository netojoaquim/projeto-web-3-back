import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express'; // <- Import correto

async function bootstrap() {
  // Criar a app como NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Validação global
  app.useGlobalPipes(new ValidationPipe());

  // Configuração CORS
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Servir arquivos estáticos da pasta 'uploads'
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL: http://localhost:5000/uploads/nome_da_imagem.jpg
  });

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API endpoints for CaronaFC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Start do servidor
  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
