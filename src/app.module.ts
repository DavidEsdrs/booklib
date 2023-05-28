import { Module } from '@nestjs/common';
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from './users/users.module';
import { AuthModule } from "./auth/auth.module";
import { FileSystemModule } from './file-system/file-system.module';
import { BooksModule } from './books/books.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    FileSystemModule, 
    BooksModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
