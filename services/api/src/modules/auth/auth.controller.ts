import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { SignupDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  async signup(
    @Body() payload: SignupDto,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.signup(payload);
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Account created succeful",
    });
  }

  @Post("signup/confirm")
  signupConfirm() {
    return this.authService.signupConfirm();
  }

  @Post("login")
  login() {
    return this.authService.login();
  }

  @Delete("logout")
  logout() {
    return this.authService.logout();
  }

  @Post("password-reset")
  resetPassword() {
    return this.authService.resetPassword();
  }
}
