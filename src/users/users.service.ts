import { Injectable } from '@nestjs/common';
import { PrismaService } from "src/prisma/prisma.service";
import { hash } from "argon2";

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService
    ) {}

    async findByEmail(email: string) {
        const user = await this.prisma.user.findFirst({
            where: { email }
        });
        return user;
    }

    async create({ email, username, password, bio, pictureFilePath }: {
        username: string,
        email: string,
        password: string,
        bio: string,
        pictureFilePath: string
    }) {
        const pwdHash = await hash(password);
        const user = await this.prisma.user.create({
            data: {
                username,
                email,
                password: pwdHash,
                bio,
                pictureFilePath
            }
        });
        return user;
    }
}
