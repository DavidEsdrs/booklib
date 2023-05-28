import { Injectable } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { BookDTO } from "./dto/book.dto";

@Injectable()
export class BooksService {
    constructor(private prisma: PrismaService) {}

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
        return book;
    }
}
