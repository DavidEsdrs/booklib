import { IsNotEmpty, IsOptional, IsString, Length, IsInt, IsEnum, IsArray, ArrayNotEmpty } from "class-validator";

enum Visibility {
    PUBLIC,
    PRIVATE
}

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

    @IsString()
    @IsNotEmpty()
    @Length(1, 30)
    filePath: string;
    
    @IsString()
    @IsNotEmpty()
    @Length(1, 30)
    coverFilePath: string;

    @IsInt()
    pages: number;

    @IsEnum(Visibility)
    visibility: Visibility;

    @IsArray()
    @ArrayNotEmpty()
    @Length(3, 15, { each: true })
    genders: string[];
}