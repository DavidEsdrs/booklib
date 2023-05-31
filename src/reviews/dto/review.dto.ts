import { IsInt, IsNotEmpty, IsString, Length, Max, Min } from "class-validator";

export class ReviewDTO {
    @IsString()
    @IsNotEmpty()
    @Length(0, 10000)
    content: string;

    @IsInt()
    @Min(0)
    @Max(10)
    rating: number;
}