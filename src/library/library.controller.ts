import { Body, Controller, Get, HttpCode, Param, Post, Request, UseInterceptors } from '@nestjs/common';
import { LibraryService } from "./library.service";
import { BookInstance } from "src/common/decorators/book.decorator";
import { LibraryInstance } from "src/common/decorators/library.decorator";
import { Book, Library } from "@prisma/client";
import { BindUrlInterceptor } from "../common/interceptors/bind-url.interceptor";

@Controller('library')
export class LibraryController {
    constructor(private service: LibraryService) {}

    @Get(":id")
    async getLibrary(
        @Param("id") libraryId: number,
        @Request() request
    ) {
        return this.service.getLibrary({ libraryId, requesterId: request.user.sub })
    }

    @Post()
    async createLibrary(
        @Body() { name, description, visibility }: any,
        @Request() request
    ) {
        return this.service.createLibrary({ 
            name, 
            description, 
            visibility,
            createdById: request.user.sub
        });
    }

    @Post(":id/books/:bookId")
    @HttpCode(204)
    async addBookToLibrary(
        @BookInstance("bookId") book: Book,
        @LibraryInstance("id") library: Library,
        @Request() request
    ) {
        await this.service.addBookToLibrary({
            book,
            library,
            requesterId: request.user.id
        });
    }

    @Get(":id/books")
    @UseInterceptors(BindUrlInterceptor)
    async getBooksFromLibrary(
        @Param("id") libraryId: number,
        @Request() request
    ) {
        return this.service.getBooksFromLibrary({ libraryId, requesterId: request.user.sub });
    }
}
