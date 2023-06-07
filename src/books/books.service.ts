import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { BookDTO, UpdateBookDTO } from "./dto/book.dto";
import { Book } from "@prisma/client";
import { UnauthorizedError } from "type-graphql";
import { FileSystemService } from "src/file-system/file-system.service";
import { IsNotEmpty } from "class-validator";
import { IntersectionType } from "@nestjs/graphql";

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
        this.logger.log(`Book created: Requester ${uploadedById}`);
        return book;
    }

    async getBooks({ requester_id }: { requester_id: number }) {    
        const books = await this.prisma.book.findMany({
            where: {
                visibility: "PUBLIC",
                NOT: {
                    uploadedById: requester_id
                }
            }
        });
        this.logger.log(`Requester ${requester_id}: Get books`);
        return books;
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
            this.logger.log(`Requester ${requesterId}: Couldn't get book ${book.id}`);
            throw new UnauthorizedError();
        }
        this.logger.log(`Requester ${requesterId}: Get book ${book.id}`);
        return book;
    }

    private canAccessBook = (book: Book, requesterId: number) => book.visibility === "PUBLIC" || book.uploadedById === requesterId;

    async getBookContent({ id, requesterId }: { id: number, requesterId: number }) {
        const book = await this.prisma.book.findUnique({
            where: { id }
        });
        if(!book) {
            this.logger.log(`Requester ${requesterId}: Couldn't get book ${book.id} - Book doesn't exist`);
            throw new NotFoundException();
        }
        if(!this.canAccessBook(book, requesterId)) {
            this.logger.log(`Requester ${requesterId}: Couldn't get book ${book.id} - Requester doesn't have access`);
            throw new UnauthorizedException();
        }
        const stream = await this.fileSystemService.createReadStream(book.filePath, ["books", "content"]);
        this.logger.log(`Requester ${requesterId}: Get book ${book.id}`);
        return { book, stream, contentType: this.getContentType(book.filePath) };
    }

    // TODO: get content type by a more reliable process (as epub should be 'application/epub+zip')
    private getContentType = (path: string) => `${path.split('.').pop()}`

    async deleteBook({ book, requesterId }: { book: Book, requesterId: number }) {
        if(book.uploadedById !== requesterId) {
            this.logger.log(`Requester ${requesterId}: Couldn't delete book ${book.id} - Requester doesn't have access`);
            throw new ForbiddenException();
        }

        await this.prisma.book.delete({
            where: { id: book.id }
        });

        const deleteContentFilePromise = this.fileSystemService.deleteFile(book.filePath, ["books", "content"]);
        const deleteCoverFilePromise = this.fileSystemService.deleteFile(book.coverFilePath, ["books", "cover"]);

        this.logger.log(`Requester ${requesterId}: ${book.id} deleted`);
        await Promise.all([deleteContentFilePromise, deleteCoverFilePromise]);
    }

    async updateBook({ dto, book, requesterId, cover, file }: { dto: UpdateBookDTO, book: Book, requesterId: number, cover: Express.Multer.File[], file: Express.Multer.File[] }) {
        if(book.uploadedById !== requesterId) {
            this.logger.log(`Requester ${requesterId}: Couldn't update book ${book.id} - Requester doesn't have access`);
            throw new ForbiddenException();
        }

        const updateQuery = await this.mountUpdateQuery(book, file, cover);

        await this.prisma.book.update({
            where: { id: book.id },
            data: {
                ...dto,
                ...updateQuery
            }
        });

        this.logger.log(`Requester ${requesterId}: ${book.id} updated`);
    }

    private async mountUpdateQuery(book: Book, file: Express.Multer.File[], cover: Express.Multer.File[]) {
        // Is this a antipattern (In nestjs context)?
        class UpdateQuery {
            query: { coverFilePath?: string, filePath?: string };

            constructor() {
                this.query = {};
            }
        
            cover(coverFilePath: string) {
                this.query.coverFilePath = coverFilePath;
                return this;
            }
        
            file(filePath: string) {
                this.query.filePath = filePath;
                return this;
            }
        
            build() {
                return this.query;
            }
        }

        const updateQuery = new UpdateQuery();

        if (Array.isArray(cover) && cover.length > 0) {
            await this.fileSystemService.deleteFile(book.coverFilePath, ["books", "cover"]);
            updateQuery.cover(cover[0].filename);
            this.logger.log(`File cover ${book.coverFilePath} of book ${book.id} deleted`)
        }
        
        if (Array.isArray(file) && file.length > 0) {
            await this.fileSystemService.deleteFile(book.filePath, ["books", "content"]);
            updateQuery.file(file[0].filename);
            this.logger.log(`File content ${book.filePath} of book ${book.id} deleted`)
        }

        return updateQuery.build();
    }

    async getBookCover({ book, requesterId }: { book: Book, requesterId: number }) {
        if(!this.canAccessBook(book, requesterId)) {
            this.logger.log(`Requester ${requesterId}: Couldn't get book ${book.id} cover - Requester doesn't have access`);
            throw new UnauthorizedException();
        }
        const readStream = await this.fileSystemService.createReadStream(book.coverFilePath, ["books", "cover"]);
        const contentType = this.getContentType(book.coverFilePath);
        this.logger.log(`Requester ${requesterId}: Get book ${book.id} cover`);
        return { readStream, contentType };
    }
}