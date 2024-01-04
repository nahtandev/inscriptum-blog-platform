import { Injectable } from "@nestjs/common";
import { MailerService } from "../mailer/mailer.service";

@Injectable()
export class AuthService {
    constructor(private mailerService: MailerService) {}

    signup(): string {
        this.mailerService.sendMail();
        return "Signup succeful";
    }

    signupConfirm(): string {
        return "Signup confirm succeful";
    }

    login(): string {
        return "Login succeful";
    }

    logout(): string {
        return "Logout succeful";
    }

    resetPassword(): string {
        return "Password reset succeful";
    }
}
