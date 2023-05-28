import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { UsersModule } from "src/users/users.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [UsersModule, PrismaModule]
})
export class BooksModule {}
