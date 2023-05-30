import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { UsersModule } from "src/users/users.module";
import { PrismaModule } from "src/prisma/prisma.module";
import { FileSystemModule } from "src/file-system/file-system.module";

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [UsersModule, PrismaModule, FileSystemModule]
})
export class BooksModule {}
