import { Injectable, NotFoundException, PipeTransform } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LibraryIdToObjectPipe implements PipeTransform {
    constructor(private prisma: PrismaService) {}

    async transform(value: string) {
        const library = await this.prisma.library.findFirst({
            where: { id: Number(value)}
        });

        if(!library) {
            throw new NotFoundException("The given library id was not found!");
        }

        return library;
    }
}
