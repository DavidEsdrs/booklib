import { Body, Controller, Delete, Get, HttpCode, Logger, Param, Post, Put, Request, Response, StreamableFile, UploadedFiles, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { BookDTO, UpdateBookDTO } from "./dto/book.dto";
import { BooksService } from "./books.service";
import { imageFileFilter, ebookFileFilter } from "src/config/multer.config";
import { FilesFieldsInterceptor } from "src/interceptors/fileName.interceptor";
import { TransformFormDataPipe } from "./books-form-data.pipe";
import { Readable } from "node:stream";
import { Public } from "src/decorators/public.decorator";
import { BookInstance } from "src/common/decorators/book.decorator";
import { Book } from "@prisma/client";

@Controller('books')
export class BooksController {
    logger: any;

    constructor(private service: BooksService) {
        this.logger = new Logger();
    }

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

    @Get(":id/content")
    async getBookContent(
        @Request() request,
        @Response({ passthrough: true }) res,
        @Param("id") id: number,
    ) {
        const { book, stream, contentType } = await this.service.getBookContent({ id, requesterId: request.user.sub });
        res.set({
            "Content-Type": `application/${contentType}`,
            "Content-Disposition": `inline; filename="${book.filePath}"`
        });
        this.logger.log(`Read stream created for file: ${book.filePath} - Ready for streaming`);
        return new StreamableFile(stream);
    }

    @Delete(":id")
    @HttpCode(204)
    async deleteBook(
        @BookInstance("id") book: Book,
        @Request() request
    ) {
        return this.service.deleteBook({ book, requesterId: request.user.sub });
    }

    @Put(":id")
    @UseInterceptors(
        new FilesFieldsInterceptor([
            { dest: "./uploads/books/cover", field: "cover", fileFilter: imageFileFilter },
            { dest: "./uploads/books/content", field: "file", fileFilter: ebookFileFilter }
        ])
    )
    async updateBook(
        @Body() dto: UpdateBookDTO,
        @BookInstance("id") book: Book,
        @Request() request,
        @UploadedFiles() { cover, file }: {
            cover: Express.Multer.File[];
            file: Express.Multer.File[];
        }
    ) {
        return this.service.updateBook({ dto, book, requesterId: request.user.sub, cover, file });
    }

    @Get(":id/cover")
    async getBookCover(
        @BookInstance("id") book: Book,
        @Request() request,
        @Response({ passthrough: true }) response
    ) {
        const { readStream, contentType } = await this.service.getBookCover({ book, requesterId: request.user.sub });
        response.set({
            "Content-Type": `image/${contentType}`,
            "Content-Disposition": `inline; filename="${book.coverFilePath}"`
        });
        return new StreamableFile(readStream);
    }
}
