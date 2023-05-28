
import { Body, Controller, Post, HttpCode, HttpStatus, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from "src/config/multer.config";
import { AuthDTO, SignInDTO } from "./dto/auth.dto";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDTO) {
    const accessToken = await this.authService.signIn(signInDto.email, signInDto.password);
    return { accessToken };
  }

  @Post("signup")
  @UseInterceptors(
    FileInterceptor("picture", {
      storage: diskStorage({
        destination: "./uploads/users/picture",
        filename: editFileName
      }),
      fileFilter: imageFileFilter
    })
  )
  signUp(
    @Body() signUpDto: AuthDTO,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.authService.signUp({
        username: signUpDto.username,
        email: signUpDto.email,
        password: signUpDto.password,
        bio: signUpDto.bio,
        pictureFilePath: file.filename
    });
  }
}