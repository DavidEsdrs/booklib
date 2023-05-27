import { Module } from '@nestjs/common';
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from './users/users.module';
import { AuthModule } from "./auth/auth.module";
import { FileSystemModule } from './file-system/file-system.module';

@Module({
  imports: [
    PrismaModule, 
    UsersModule, 
    AuthModule, 
    FileSystemModule
  ],
  controllers: [],
  providers: []
})
export class AppModule {}
