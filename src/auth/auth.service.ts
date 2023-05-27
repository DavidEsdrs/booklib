import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import { verify } from "argon2";
import { FileSystemService } from "src/file-system/file-system.service";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private fsService: FileSystemService
    ) {}

    async signIn(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if(!user) {
            throw new UnauthorizedException();
        }
        const pwdMatches = await verify(user.password, password);
        if(!pwdMatches) {
            throw new UnauthorizedException();
        }
        const payload = { sub: user.id, email: user.email };
        const accessToken = await this.jwtService.signAsync(payload);
        return accessToken;
    }

    async signUp(args: {
        username: string,
        email: string,
        password: string,
        bio: string,
        pictureFilePath: string
    }) {
        const userAlreadyExist = await this.usersService.findByEmail(args.email);
        if(userAlreadyExist) {
            // Delete uploaded file as it won't be saved
            await this.fsService.deleteFile(args.pictureFilePath, ["users", "picture"]);
            throw new UnauthorizedException();
        }
        const user = await this.usersService.create(args);
        return user;
    }
}