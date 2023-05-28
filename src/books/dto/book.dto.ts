import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Length, IsInt, IsEnum, IsArray, ArrayNotEmpty } from "class-validator";

type Visibility = "PUBLIC" | "PRIVATE";

export class BookDTO {
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    title: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 255)
    synopsis: string;

    @IsString()
    @IsOptional()
    @Length(10, 10000)
    notes: string;

    @Transform(obj => Number(obj.value))
    @IsInt()
    pages: number;

    @IsEnum([ "PUBLIC", "PRIVATE" ])
    visibility: Visibility;

    @IsArray()
    @ArrayNotEmpty()
    @Length(3, 15, { each: true })
    genders: string[];
}