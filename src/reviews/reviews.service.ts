import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { ReviewDTO } from "./dto/review.dto";
import { Book } from "@prisma/client";

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) {}

    async createReview({ dto, book, requesterId }: { dto: ReviewDTO, book: Book, requesterId: number }) {
        if(book.uploadedById !== requesterId) {
            throw new UnauthorizedException();
        }

        const review = await this.prisma.review.create({
            data: {
                content: dto.content,
                rating: dto.rating,
                bookId: book.id,
                userId: requesterId
            }
        });

        return review;
    }
}