import { Body, Controller, Get, Param, Post, Request, Response, StreamableFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookDTO } from "./dto/book.dto";
import { BooksService } from "./books.service";
import { imageFileFilter, ebookFileFilter } from "src/config/multer.config";
import { FilesFieldsInterceptor } from "src/interceptors/fileName.interceptor";
import { TransformFormDataPipe } from "./books-form-data.pipe";
import { Readable } from "node:stream";
import { Public } from "src/decorators/public.decorator";

@Controller('books')
export class BooksController {
    constructor(private service: BooksService) {}

    @Post()
    @UseInterceptors(
        new FilesFieldsInterceptor([
            { dest: "./uploads/books/cover", field: "cover", fileFilter: imageFileFilter },
            { dest: "./uploads/books/content", field: "file", fileFilter: ebookFileFilter }
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

    @Public()
    @Get(":id/content")
    async getBookContent(
        @Request() request,
        @Response({ passthrough: true }) res,
        @Param("id") id: number,
    ) {
        const { book, stream, contentType } = await this.service.getBookContent({ id, requesterId: request.user?.id });
        res.set({
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${book.filePath}"`
        });
        return new StreamableFile(stream);
    }
}
