import { Body, Controller, HttpCode, Param, Post, Request, UsePipes, ValidationPipe } from '@nestjs/common';
import { LibraryService } from "./library.service";
import { BookIdToObjectPipe } from "src/common/pipes/bookIdToObject.pipe";
import { LibraryIdToObjectPipe } from "src/common/pipes/libraryIdToObject.pipe";
import { BookInstance } from "src/common/decorators/book.decorator";
import { LibraryInstance } from "src/common/decorators/library.decorator";
import { Book, Library } from "@prisma/client";

@Controller('library')
export class LibraryController {
    constructor(private service: LibraryService) {}

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
}
