import { Body, Controller, Delete, Post } from "@nestjs/common";
import { SignupDto } from "./auth.dto";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  signup(@Body() payload: SignupDto) {
    return this.authService.signup(payload);
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
