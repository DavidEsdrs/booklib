import { ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Book, Library, User, Visibility } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LibraryService {
    logger: any;

    constructor(private prisma: PrismaService) {
        this.logger = new Logger();
    }

    async getLibrary({ requesterId, libraryId }: { requesterId: number, libraryId: number }) {
        const library = await this.prisma.library.findUnique({
            where: {
                id: libraryId
            }
        });
        if(!this.canAccessLibrary(library, requesterId)) {
            throw new UnauthorizedException();
        }
        return library;
    }

    async createLibrary({
        name, 
        description, 
        visibility,
        createdById
    }: {
        name: string, 
        description: string,
        visibility: Visibility,
        createdById: number
    }) {
        const library = await this.prisma.library.create({
            data: {
                name,
                description,
                visibility,
                createdById
            }
        });
        this.logger.log(`Created new library - requester:${createdById}`);
        return library;
    }


    async addBookToLibrary({
        library,
        book,
        requesterId
    }: {
        library: Library,
        book: Book,
        requesterId: number
    }) {
        const user = await this.prisma.user.findFirst({
            where: { id: requesterId }
        });

        if(!user) {
            throw new UnauthorizedException();
        }

        if(!this.canAccessLibraryAndBook(library, book, user)) {
            this.logger.warn(`Not set relationship: (library:${library.id})-[:HAS]->(book:${book.id}). Requester doesn't have permision.`)
            throw new UnauthorizedException();
        }

        try {
            await this.prisma.booksOnLibraries.create({
                data: {
                    bookId: book.id,
                    libraryId: library.id
                }
            });

            this.logger.log(`Set relationship: (library:${library.id})-[:HAS]->(book:${book.id})`)
        } catch(err) {
            this.logger.warn(`Not set relationship: (library:${library.id})-[:HAS]->(book:${book.id}). A relationship with same params already exists.`)
            throw new ConflictException("The association between the specified library and book already exists!");
        }
    }

    private canAccessLibraryAndBook(library: Library, book: Book, user: User) {
        if(
            library.createdById === user.id 
            && (book.visibility === "PUBLIC" || book.uploadedById === user.id)
        ) {
            return true;
        }

        return false;
    }
    
    async getBooksFromLibrary({ libraryId, requesterId }: { libraryId: number, requesterId: number }) {
        const library = await this.prisma.library.findUnique({
            where: { id: libraryId },
            include: {
                books: {
                    select: {
                        book: true
                    }
                }
            }
        });
        if(!this.canAccessLibrary(library, requesterId)) {
            throw new UnauthorizedException();
        }
        return library.books.map(bookRel => bookRel.book);
    }

    private canAccessLibrary = (library: Library, requesterId: number) => library.visibility === "PUBLIC" || library.createdById === requesterId;
}