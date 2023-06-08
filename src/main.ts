import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, UnprocessableEntityException, ValidationError, ValidationPipe } from "@nestjs/common";
import { ApiExceptionFilter } from "./lib/errorHandler.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const errorMessage = errors.map(error => Object.values(error.constraints)).join(', ');
      return new UnprocessableEntityException(errorMessage);
    },
    transform: true
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(process.env.SERVER_PORT || 3001);
}
bootstrap();
