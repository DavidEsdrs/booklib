import { ExceptionFilter, HttpException, ArgumentsHost, Catch } from "@nestjs/common";
import { Response } from "express";

@Catch(HttpException)
export class ApiExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        const status_code = exception.getStatus();
        const message = exception.message || "Internal Server Error";

        return response.status(status_code).json({
            message,
            status_code
        });
    }
}