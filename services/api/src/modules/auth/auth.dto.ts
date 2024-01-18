import { IsDefined, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class SignupDto {
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsDefined()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsDefined()
  @IsString()
  password: string;
}

export class ConfirmSignupDto {
  @IsNotEmpty()
  @IsDefined()
  @IsString()
  payload: string;
}