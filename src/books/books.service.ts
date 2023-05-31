import { ForbiddenException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { BookDTO, UpdateBookDTO } from "./dto/book.dto";
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
        const book = await this.prisma.book.findUnique({
            where: { id }
        });
        if(!book) {
            throw new NotFoundException();
        }
        if(!this.canAccessBook(book, requesterId)) {
            throw new UnauthorizedException();
        }
        const stream = await this.fileSystemService.createReadStream(book.filePath, ["books", "content"]);
        return { book, stream, contentType: this.getContentType(book.filePath) };
    }

    // TODO: get content type by a more reliable process (as epub should be 'application/epub+zip')
    private getContentType = (path: string) => `${path.split('.').pop()}`

    async deleteBook({ book, requesterId }: { book: Book, requesterId: number }) {
        if(book.uploadedById !== requesterId) {
            throw new ForbiddenException();
        }

        await this.prisma.book.delete({
            where: { id: book.id }
        });

        const deleteContentFilePromise = this.fileSystemService.deleteFile(book.filePath, ["books", "content"]);
        const deleteCoverFilePromise = this.fileSystemService.deleteFile(book.coverFilePath, ["books", "cover"]);

        await Promise.all([deleteContentFilePromise, deleteCoverFilePromise]);
    }

    async updateBook({ dto, book, requesterId, cover, file }: { dto: UpdateBookDTO, book: Book, requesterId: number, cover: Express.Multer.File[], file: Express.Multer.File[] }) {
        if(book.uploadedById !== requesterId) {
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
        }
    
        if (Array.isArray(file) && file.length > 0) {
            await this.fileSystemService.deleteFile(book.filePath, ["books", "content"]);
            updateQuery.file(file[0].filename);
        }

        return updateQuery.build();
    }

    async getBookCover({ book, requesterId }: { book: Book, requesterId: number }) {
        if(!this.canAccessBook(book, requesterId)) {
            throw new UnauthorizedException();
        }
        const readStream = await this.fileSystemService.createReadStream(book.coverFilePath, ["books", "cover"]);
        const contentType = this.getContentType(book.coverFilePath);
        return { readStream, contentType };
    }
}

