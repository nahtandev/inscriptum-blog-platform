import { Injectable } from "@nestjs/common";
import { MailerService } from "../mailer/mailer.service";

@Injectable()
export class AuthService {
    constructor(private mailerService: MailerService) {}

    signup(): string {
      // Test Mailer Module
      const html = `<h2>Bonjour Hello Test </h2>`;
      this.mailerService.sendMail("blank", html, {
        to: { name: "Nathan", address: "gnankadjanathan@gmail.com" },
        subject: "Test du service mail",
      });
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
