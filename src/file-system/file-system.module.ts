import { Module } from '@nestjs/common';
import { FileSystemService } from './file-system.service';

@Module({
  exports: [FileSystemService],
  providers: [FileSystemService]
})
export class FileSystemModule {}
