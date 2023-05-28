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
        genders 
    }: BookDTO) {
        return "funfou"
    }
}
