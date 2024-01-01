import { Controller, Delete, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post("signup")
    signup() {
        return this.authService.signup();
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
