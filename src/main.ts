import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, UnprocessableEntityException, ValidationError, ValidationPipe } from "@nestjs/common";
import { ApiExceptionFilter } from "./lib/errorHandler.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory: (errors: ValidationError[]) => {
      const errorMessage = errors.map(error => Object.values(error.constraints)).join(', ');
      return new UnprocessableEntityException(errorMessage);
    }
  }));
  app.useGlobalFilters(new ApiExceptionFilter());
  await app.listen(3000);
}
bootstrap();
