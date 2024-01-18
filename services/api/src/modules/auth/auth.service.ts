import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ApiConf } from "src/app-context/context-type";
import { deobfuscateTextData } from "src/helpers/common.helper";
import { MailerService } from "../mailer/mailer.service";
import { UserService } from "../user/user.service";
import { ConfirmSignupDto, SignupDto } from "./auth.dto";
import {
  generateResetPasswordToken,
  generateRowPublicId,
  generateTokenExpireAt,
  hashPassword,
  makeAccountActivationUrl,
  makeDefaultUsername,
  makeResetPasswordPayloadObfuscated,
  validationTokenHasExpired,
} from "./auth.helper";

@Injectable()
export class AuthService {
  constructor(
    private mailerService: MailerService,
    private userService: UserService,
    private configService: ConfigService
  ) {}

  async signup(payload: SignupDto) {
    const { webAppUrl } = this.configService.get<ApiConf>("apiConf");
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
      const publicId = generateRowPublicId();
      const accountActivationUrl = makeAccountActivationUrl({
        token: resetPasswordToken,
        webAppUrl,
        userPublicId: publicId,
      });

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
          publicId,
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
          publicId,
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

  async signupConfirm({ payload }: ConfirmSignupDto) {
    const { webAppUrl } = this.configService.get<ApiConf>("apiConf");
    let payloadDecoded: string;

    const invalidPayloadException = () => {
      throw new BadRequestException({
        success: false,
        message: "Invalid payload",
      });
    };

    try {
      payloadDecoded = decodeURIComponent(payload);
    } catch {
      return invalidPayloadException();
    }

    const payloadDeobfuscate =
      deobfuscateTextData<string>(payloadDecoded).split("::");

    if (payloadDeobfuscate.length !== 2) return invalidPayloadException();

    const [userPublicId, token] = payloadDeobfuscate;

    // Check if the payload sent is the same as that received
    const payloadObfuscated = makeResetPasswordPayloadObfuscated(
      userPublicId,
      token
    );
    if (payloadObfuscated !== payloadDecoded) return invalidPayloadException();

    const user = await this.userService.getOneUserByPublicId(userPublicId);

    if (!user || user.resetPasswordToken !== token) {
      return invalidPayloadException();
    }

    if (validationTokenHasExpired(user.tokenExpireAt)) {
      const resetPasswordToken = generateResetPasswordToken();

      await this.userService.updateOneUser(user.id, {
        resetPasswordToken,
        tokenExpireAt: generateTokenExpireAt(),
      });

      const activationLink = makeAccountActivationUrl({
        token: resetPasswordToken,
        webAppUrl,
        userPublicId: user.publicId,
      });

      this.mailerService.sendAccountActivationMail({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        activationLink,
      });

      return {
        success: false,
        message:
          "The validation link has expired. A new validation link  is sent; please confirm",
      };
    }

    await this.userService.updateOneUser(user.id, {
      resetPasswordToken: null,
      tokenExpireAt: null,
      isActive: true,
    });

    const defaultUsername = makeDefaultUsername(user.firstName, user.lastName); // TODO: Manage doublon

    await this.userService.createPublisher({
      user,
      userName: defaultUsername,
      publicId: generateRowPublicId(),
    });

    return {
      success: true,
      message: "Account verified successful",
      isAuth: false,
    };
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
