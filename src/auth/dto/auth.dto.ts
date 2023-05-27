import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class AuthDTO {
    @IsNotEmpty()
    @IsEmail()
    email: string;
    
    @IsNotEmpty()
    @IsString()
    @Length(3, 30)
    username: string;
    
    @IsString()
    @Length(1, 255)
    bio: string;

    @IsString()
    @IsNotEmpty()
    @Length(8, 100, { 
        message: (args) => {
            if(args.value.length < 8) {
                return "Password length must be at least 8 characters!";
            }

            else if (args.value.length > 100) {
                return "Password length must to be at most 100 characters!";
            }
        }
    })
    password: string;
}