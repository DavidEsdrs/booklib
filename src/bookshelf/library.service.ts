import { Injectable } from '@nestjs/common';
import { Visibility } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class LibraryService {
    constructor(private prisma: PrismaService) {}

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
        return library;
    }
}
