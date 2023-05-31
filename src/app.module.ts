import { Module } from '@nestjs/common';
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from './users/users.module';
import { AuthModule } from "./auth/auth.module";
import { FileSystemModule } from './file-system/file-system.module';
import { BooksModule } from './books/books.module';
import { LibraryModule } from './library/library.module';
import { ReviewsModule } from "./reviews/reviews.module";

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    FileSystemModule, 
    BooksModule, 
    LibraryModule,
    ReviewsModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
