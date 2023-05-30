import { Body, Controller, Get, Param, Post, Request, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookDTO } from "./dto/book.dto";
import { BooksService } from "./books.service";
import { imageFileFilter, pdfFileFilter } from "src/config/multer.config";
import { FilesFieldsInterceptor } from "src/interceptors/fileName.interceptor";
import { TransformFormDataPipe } from "./books-form-data.pipe";

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
        @Body(new TransformFormDataPipe(), new ValidationPipe()) dto: BookDTO,
        @UploadedFiles() files: {
            cover: Express.Multer.File[];
            file: Express.Multer.File[];
        }
    ) {
        const coverFilePath = files.cover[0].filename;
        const filePath = files.file[0].filename;
        return this.service.uploadBook({...dto, uploadedById: request.user.sub, coverFilePath, filePath});
    }

    @Get(":id")
    async getBook(
        @Request() request,
        @Param("id") id: number
    ) {
        return this.service.getBook({ id, requesterId: request.user });
    }
}
