import { Body, Controller, Delete, HttpCode, Post } from "@nestjs/common";
import { ConfirmSignupDto, SignupDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @HttpCode(201)
  async signup(@Body() payload: SignupDto) {
    return await this.authService.signup(payload);
  }

  @Post("signup/confirm")
  @HttpCode(200)
  signupConfirm(@Body() payload: ConfirmSignupDto) {
    return this.authService.signupConfirm(payload);
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
