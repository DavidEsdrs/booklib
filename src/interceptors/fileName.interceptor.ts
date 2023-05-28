import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import multer, { diskStorage } from 'multer';
import { editFileName } from "src/config/multer.config";
import { Request } from "express";

type MulterFileFilterCallback = (error: Error | null, acceptFile: boolean) => void;

interface FieldRelation { 
    field: string;
    maxCount?: number;
    dest: string;
    fileFilter: (req: Request, file: Express.Multer.File, callback: MulterFileFilterCallback) => void;
}

@Injectable()
export class FilesFieldsInterceptor implements NestInterceptor {
    constructor(private fields: FieldRelation[]) {}

    async intercept(context: ExecutionContext, next: CallHandler) {
        const multerMiddleware = multer({
            storage: diskStorage({
                destination: (req, file, callback) => {
                    const dest = this.fields.find(fi => fi.field === file.fieldname).dest;
                    callback(null, dest);
                },

                filename: editFileName
            }),
            fileFilter: (req, file, callback) => {
                const fileFilter = this.fields.find(fi => fi.field === file.fieldname).fileFilter;
                return fileFilter(req, file, callback);
            }
        }).fields(this.fields.map(f => ({ name: f.field, maxCount: f.maxCount ?? 1 })));

        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
    
        return new Promise((resolve, reject) => multerMiddleware(request, undefined, (error: any) => error ? reject(error) : resolve(request)))
            .then(() => next.handle())
            .catch(error => {
                throw error;
            });
    }
}