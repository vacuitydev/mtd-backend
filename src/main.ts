import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ // Comes with Nestjs
        whitelist:true //Discards extra information
        // For example, if the body had DateOfDeath and other keys as well, it would discard them in the SignupDTO
    })
  )
  app.enableCors();
  await app.listen(3001);
}
bootstrap();
