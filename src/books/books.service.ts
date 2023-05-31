import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { BookDTO } from "./dto/book.dto";
import { Book } from "@prisma/client";
import { UnauthorizedError } from "type-graphql";
import { FileSystemService } from "src/file-system/file-system.service";

@Injectable()
export class BooksService {
    logger: any;

    constructor(private prisma: PrismaService, private fileSystemService: FileSystemService) {
        this.logger = new Logger();
    }

    async uploadBook({ 
        title, 
        coverFilePath, 
        filePath, 
        notes, 
        pages, 
        synopsis, 
        visibility, 
        genders,
        uploadedById
    }: BookDTO & { uploadedById: number, coverFilePath: string, filePath: string }) {
        const book = await this.prisma.book.create({
            data: {
                title,
                coverFilePath,
                filePath,
                pages,
                synopsis,
                notes,
                genders: {
                    create: genders.map(gender => ({ name: gender }))
                },
                uploadedById,
                visibility
            }
        });
        this.logger.log(`Book created: Requester ${uploadedById}`)
        return book;
    }

    async getBook({ id, requesterId }: { id: number, requesterId: number}) {
        const book = await this.prisma.book.findFirst({
            where: { id },
            include: {
                genders: true,
                uploadedBy: true
            }
        });
        if(!this.canAccessBook(book, requesterId)) {
            throw new UnauthorizedError();
        }
        return book;
    }

    private canAccessBook = (book: Book, requesterId: number) => book.visibility === "PUBLIC" || book.uploadedById === requesterId;

    async getBookContent({ id, requesterId }: { id: number, requesterId: number }) {
        const book = await this.prisma.book.findFirst({
            where: { id }
        });
        const stream = await this.fileSystemService.createReadStream(book.filePath, ["books", "content"]);
        return { book, stream, contentType: this.getContentType(book) };
    }

    // TODO: get content type by a more reliable process (as epub should be 'application/epub+zip')
    private getContentType = (book: Book) => `application/${book.filePath.split('.').pop()}`
}
