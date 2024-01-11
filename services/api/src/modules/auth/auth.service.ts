import {
  BadGatewayException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { MailerService } from "../mailer/mailer.service";
import { UserService } from "../user/user.service";
import { SignupDto } from "./auth.dto";
import {
  generateResetPasswordToken,
  generateTokenExpireAt,
  hashPassword,
  makeAccountActivationUrl,
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

    if (user?.isActive) {
      throw new ConflictException("This email address is linked and account.", {
        description:
          "The email provided is linked an account. Try to signin or use another email",
      });
    }

    try {
      const passwordEncrypted = await hashPassword(password);
      const resetPasswordToken = generateResetPasswordToken();
      const accountActivationUrl = makeAccountActivationUrl(resetPasswordToken);

      if (user) {
        await this.userService.updateOneUser(user.id, {
          email,
          firstName,
          lastName,
          password: passwordEncrypted,
          resetPasswordToken,
          tokenExpireAt: generateTokenExpireAt(),
          roles: ["publisher"],
          isActive: false,
        });
      } else {
        await this.userService.createUser({
          email,
          firstName,
          lastName,
          password: passwordEncrypted,
          resetPasswordToken,
          tokenExpireAt: generateTokenExpireAt(),
          roles: ["publisher"],
          isActive: false,
        });
      }

      this.mailerService.sendAccountActivationMail({
        firstName,
        lastName,
        email,
        activationLink: accountActivationUrl,
      });
    } catch (error) {
      throw new BadGatewayException("Signup process failed, please retry", {
        cause: `[signup]: error to register a new user. Error: ${error}`,
      });
    }

    return {
      success: true,
      message: "Account created succeful. Please, confirm email",
    };
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
