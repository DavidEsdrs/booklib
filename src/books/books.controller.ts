import { Body, Controller, Post, Request, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookDTO } from "./dto/book.dto";
import { BooksService } from "./books.service";
import { imageFileFilter, pdfFileFilter } from "src/config/multer.config";
import { FilesFieldsInterceptor } from "src/interceptors/fileName.interceptor";

@Controller('books')
export class BooksController {
    constructor(private service: BooksService) {}

    @Post()
    @UseInterceptors(
        new FilesFieldsInterceptor([
            { dest: "./uploads/books/cover", field: "cover", fileFilter: imageFileFilter },
            { dest: "./uploads/books/content", field: "file", fileFilter: pdfFileFilter }
        ])
    )
    async createBook(
        @Request() request,
        @Body() dto: BookDTO,
        @UploadedFiles() files: {
            cover: Array<Express.Multer.File>,
            file: Array<Express.Multer.File>
        }
    ) {
        const coverFilePath = files.cover[0].filename;
        const filePath = files.file[0].filename;

        return this.service.uploadBook({...dto, uploadedById: request.user.sub, coverFilePath, filePath});
    }
}
