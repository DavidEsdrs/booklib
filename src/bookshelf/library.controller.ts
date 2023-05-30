import { Body, Controller, Post, Request } from '@nestjs/common';
import { LibraryService } from "./library.service";

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
}
