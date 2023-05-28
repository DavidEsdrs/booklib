import { Body, Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { BookDTO } from "./dto/book.dto";
import { BooksService } from "./books.service";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { editFileName, imageFileFilter, pdfFileFilter } from "src/config/multer.config";
import { diskStorage } from "multer";

@Controller('books')
export class BooksController {
    constructor(private service: BooksService) {}

    @Post()
    @UseInterceptors(
        FileInterceptor("cover", {
            storage: diskStorage({
                destination: "./uploads/books/cover",
                filename: editFileName
            }),
            fileFilter: imageFileFilter
        }),
        FileInterceptor("file", {
            storage: diskStorage({
                destination: "./uploads/books/content",
                filename: editFileName
            }),
            fileFilter: pdfFileFilter
        })
    )
    async createBook(
        @Body() dto: BookDTO,
        @UploadedFiles() files: Array<Express.Multer.File>
    ) {
        const coverFilePath = files[0].filename;
        const filePath = files[1].filename;
        return this.service.uploadBook({...dto, coverFilePath, filePath});
    }
}
