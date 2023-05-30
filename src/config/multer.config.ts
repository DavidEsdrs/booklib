import { FileFilterCallback } from "multer";
import { extname } from "path";
import { Request } from "express";

export const imageFileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(null, false);
    }
    callback(null, true);
};

export const ebookFileFilter = (req: Request, file: Express.Multer.File, callback: FileFilterCallback) => {
    if (!file.originalname.match(/\.(pdf|epub)$/)) {
      return callback(null, false);
    }
    callback(null, true);
};

export const editFileName = (req: Request, file: Express.Multer.File, callback: (...args: any) => any) => {
    const fileExtName = extname(file.originalname);
    const name = Date.now();
    callback(null, `${name}${fileExtName}`);
};