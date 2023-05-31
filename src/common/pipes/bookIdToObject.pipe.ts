import { Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class BookIdToObjectPipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}

    async transform(value: string) {
        const book = await this.prisma.book.findFirst({
            where: { id: Number(value) }
        });

        if(!book) {
            throw new NotFoundException("The given book id was not found!");
        }

        return book;
    }
}