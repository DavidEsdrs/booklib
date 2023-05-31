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

    async getReviewsFromBook({ book, requesterId }: { book: Book, requesterId: number }) {
        if(!this.canAccessBook(book, requesterId)) {
            throw new UnauthorizedException();
        }

        const reviews = await this.prisma.review.findMany({
            where: {
                bookId: book.id
            }, 
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        return reviews;
    }

    private canAccessBook = (book: Book, requesterId: number) => book.visibility === "PUBLIC" || book.uploadedById === requesterId;
}