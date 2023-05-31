import { Body, Controller, Get, Post, Request } from "@nestjs/common";
import { ReviewDTO } from "./dto/review.dto";
import { BookInstance } from "src/common/decorators/book.decorator";
import { Book } from "@prisma/client";
import { ReviewsService } from "./reviews.service";

@Controller("books/:bookId/reviews")
export class ReviewsController {
    constructor(private service: ReviewsService) {}

    @Post()
    async createReview(
        @Body() dto: ReviewDTO,
        @BookInstance("bookId") book: Book,
        @Request() request
    ) {
        return this.service.createReview({ dto, book, requesterId: request.user.sub });
    }

    @Get()
    async getReviewsFromBook(
        @BookInstance("bookId") book: Book,
        @Request() request
    ) {
        return this.service.getReviewsFromBook({ book, requesterId: request.user.sub });
    }
}
