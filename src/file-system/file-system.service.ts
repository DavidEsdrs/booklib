import { Injectable } from '@nestjs/common';
import fs from "fs";
import path from "path";

@Injectable()
export class FileSystemService {
    async deleteFile(fileName: string, pathJoin: string[]) {
        const filePath = path.resolve(__dirname, "..", "..", "uploads", ...pathJoin, fileName);
        return fs.promises.unlink(filePath);
    }

    async createReadStream(fileName: string, pathJoin: string[]) {
        const filePath = path.resolve(__dirname, "..", "..", "uploads", ...pathJoin, fileName);
        const readStream = fs.createReadStream(filePath);
        return readStream;
    }
}
