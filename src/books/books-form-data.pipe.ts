import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { BookDTO } from "./dto/book.dto";

export class TransformFormDataPipe implements PipeTransform {
    async transform(value: any, metadata: ArgumentMetadata) {
        const val = plainToInstance(BookDTO, value);
        return val;
    }
}