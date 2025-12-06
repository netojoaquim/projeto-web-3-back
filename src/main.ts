import { NestFactory,Reflector } from '@nestjs/core';
import { ValidationPipe ,ClassSerializerInterceptor,Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
process.env.TZ = 'America/Recife';
const logger = new Logger('Bootstrap');
logger.log("Hora atual do NestJS: "+ new Date().toString());



async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/', // URL: http://localhost:5000/uploads/nome_da_imagem.jpg
  });

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('API endpoints Guarashopp')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
