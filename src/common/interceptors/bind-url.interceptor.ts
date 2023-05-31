import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { map } from "rxjs";

@Injectable()
export class BindUrlInterceptor implements NestInterceptor {
    intercept(ctx: ExecutionContext, next: CallHandler<any>) {
        const request = ctx.switchToHttp().getRequest();

        return next.handle().pipe(
            map(data => {
                const baseUrl = request.protocol + '://' + request.get('host');

                const modifiedData = Array.isArray(data) ? data.map((book) => ({
                    ...book,
                    links: {
                        self: `${baseUrl}/books/${book.id}`,
                        content_file_url: `${baseUrl}/books/${book.id}/content`,
                        cover_file_url: `${baseUrl}/books/${book.id}/cover`,
                    }
                })) : ({
                    ...data,
                    links: {
                        self: `${baseUrl}/books/${data.id}`,
                        content_file_url: `${baseUrl}/books/${data.id}/content`,
                        cover_file_url: `${baseUrl}/books/${data.id}/cover`,
                    }
                });

                return modifiedData;
            })
        );
    }
}