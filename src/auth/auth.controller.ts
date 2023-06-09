
import { Body, Controller, Post, HttpCode, HttpStatus, UseInterceptors, UploadedFile, UnprocessableEntityException } from '@nestjs/common';
import { AuthService, Authentication } from './auth.service';
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { editFileName, imageFileFilter } from "src/config/multer.config";
import { AuthDTO, SignInDTO } from "./dto/auth.dto";
import { Public } from "src/decorators/public.decorator";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() signInDto: SignInDTO): Promise<Authentication> {
    const authentication = await this.authService.signIn(signInDto.email, signInDto.password);
    return authentication;
  }

  @Public()
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
    // TODO: This check should be in another place (in a pipe, maybe?)
    if(!file) {
      throw new UnprocessableEntityException("There is no file attached to this request!");
    }
    return this.authService.signUp({
        username: signUpDto.username,
        email: signUpDto.email,
        password: signUpDto.password,
        bio: signUpDto.bio,
        pictureFilePath: file.filename
    });
  }
}