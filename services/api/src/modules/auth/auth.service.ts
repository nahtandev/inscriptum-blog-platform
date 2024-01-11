import { ConflictException, Injectable } from "@nestjs/common";
import { MailerService } from "../mailer/mailer.service";
import { UserService } from "../user/user.service";
import { SignupDto } from "./auth.dto";
import {
  generateResetPasswordToken,
  generateTokenExpireAt,
  hashPassword,
} from "./auth.helper";
@Injectable()
export class AuthService {
  constructor(
    private mailerService: MailerService,
    private userService: UserService
  ) {}

  async signup(payload: SignupDto) {
    const { email, firstName, lastName, password } = payload;

    const user = await this.userService.getOneUserByEmail(email);
    if (user) {
      if (user.isActive) {
        throw new ConflictException(
          "this email address is linked and account."
        );
      }

      const passwordEncrypted = await hashPassword(password);
      const newResetPasswordToken = generateResetPasswordToken();
      try {
        const updatedUser = await this.userService.updateOneUser(user.id, {
          email,
          firstName,
          lastName,
          password: passwordEncrypted,
          resetPasswordToken: newResetPasswordToken,
          tokenExpireAt: generateTokenExpireAt(),
          roles: ["publisher"],
          isActive: false,
        });

        const validationUrl = "";
        /**
         * TODO: Create a validation url
         * Create sendAccont activation mail
         * Send Mail
         * Send Succeful request
         *  */
      } catch (error) {
        throw new Error(`error to update an user ${error}`);
      }
    }

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
