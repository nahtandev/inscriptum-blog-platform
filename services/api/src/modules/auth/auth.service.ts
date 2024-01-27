import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JsonWebTokenError, JwtService, TokenExpiredError } from "@nestjs/jwt";
import { ApiConf } from "src/app-context/context-type";
import { deobfuscateTextData } from "src/helpers/common.helper";
import {
  AccessTokenPayload,
  EncodedRefreshTokenPayload,
  JwtTokenDecoded,
} from "src/types/common-types";
import { MailerService } from "../mailer/mailer.service";
import { UserEntity } from "../user/user.model";
import { UserService } from "../user/user.service";
import { ConfirmSignupDto, LoginDto, RenewJwtDto, SignupDto } from "./auth.dto";
import {
  decodeRefreshToken,
  generateJwtId,
  generateResetPasswordToken,
  generateRowPublicId,
  generateTokenExpireAt,
  hashPassword,
  isSamePassword,
  makeAccountActivationUrl,
  makeDefaultUsername,
  makeRefreshTokenPayload,
  makeResetPasswordPayloadObfuscated,
  tokenExpires,
  validationTokenHasExpired,
} from "./auth.helper";

@Injectable()
export class AuthService {
  constructor(
    private mailerService: MailerService,
    private userService: UserService,
    private configService: ConfigService,
    private jwtService: JwtService
  ) {}

  async signup(payload: SignupDto) {
    const { webAppUrl } = this.configService.get<ApiConf>("apiConf");
    const { email, firstName, lastName, password } = payload;
    const user = await this.userService.getOneUserByEmail(email);

    if (user?.isActive) {
      throw new ConflictException({
        statusCode: HttpStatus.CONFLICT,
        success: false,
        code: "EMAIL_ALREADY_EXISTS",
        message: "The email provided is already linked to an account",
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
      statusCode: HttpStatus.CREATED,
      success: true,
      message: "Account created succeful. Please, confirm email",
    };
  }

  async signupConfirm({ payload }: ConfirmSignupDto) {
    const { webAppUrl } = this.configService.get<ApiConf>("apiConf");
    let payloadDecoded: string;

    const invalidPayloadException = () => {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        code: "INVALID_PAYLOAD",
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
      await inactiveAccountProccess({
        user,
        userService: this.userService,
        webAppUrl,
        mailerService: this.mailerService,
      });

      return {
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        success: false,
        code: "VALIDATION_PAYLOAD_EXPIRED",
        message: "The validation link has expired.",
      };
    }

    await this.userService.updateOneUser(user.id, {
      resetPasswordToken: null,
      tokenExpireAt: null,
      isActive: true,
    });

    const defaultUsername = makeDefaultUsername(user.firstName, user.lastName); // TODO: Manage duplicate

    await this.userService.createPublisher({
      user,
      userName: defaultUsername,
      publicId: generateRowPublicId(),
    });

    return {
      statusCode: HttpStatus.OK,
      success: true,
      message: "Account verified successful",
      data: {
        isAuth: false,
      },
    };
  }

  async login({ email, password }: LoginDto) {
    const invalidCredentialException = () => {
      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        code: "INVALID_CREDENTIALS",
        message: "Invalid credentials",
      });
    };

    const { webAppUrl, jwtConfig } = this.configService.get<ApiConf>("apiConf");
    const user = await this.userService.getOneUserByEmail(email, true);

    if (!user) return invalidCredentialException();

    if (!isSamePassword(password, user.password)) {
      return invalidCredentialException();
    }

    if (!user.isActive) {
      await inactiveAccountProccess({
        user,
        userService: this.userService,
        webAppUrl,
        mailerService: this.mailerService,
      });

      throw new UnauthorizedException({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        code: "INACTIVE_ACCOUNT",
        message: "Account not activate; a new validation mail is sent",
      });
    }

    const access_token = await this.#generateAccessToken(user);
    const refresh_token = await this.#generateRefreshToken(user);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: {
        access_token,
        refresh_token,
      },
    };
  }

  async logout() {
    return "Logout succeful";
  }

  async resetPassword() {
    return "Password reset succeful";
  }

  async renewJwt({ accessToken, refreshToken }: RenewJwtDto) {
    let decodedAccessToken: JwtTokenDecoded<AccessTokenPayload>;
    let decodedRefreshToken: JwtTokenDecoded<EncodedRefreshTokenPayload>;

    const expiredRefreshTokenException = () => {
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        code: "EXPIRED_REFRESH_TOKEN",
        message: "The refresh token provided has expired",
      });
    };

    const { jwtBlackList } =
      this.configService.get<ApiConf>("apiConf").jwtConfig;

    try {
      decodedRefreshToken = await this.jwtService.verifyAsync(refreshToken, {
        complete: true,
      });
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return expiredRefreshTokenException();
      }

      // If error is not a expire time error, it's probably a token unformatted.
      // Check this: https://github.com/auth0/node-jsonwebtoken?tab=readme-ov-file#errors--codes
      // TODO: Check another error case and handle these cases properly.
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        code: "INVALID_REFRESH_TOKEN",
        message: "The refresh token provided is in the wrong format",
      });
    }

    const { userPublicId, lastRefreshTokenId } = decodeRefreshToken(
      decodedRefreshToken.payload
    );

    const user = await this.userService.getOneUserByPublicId(userPublicId);

    if (user.lastRefreshTokenId !== lastRefreshTokenId) {
      return expiredRefreshTokenException();
    }

    try {
      decodedAccessToken = await this.jwtService.verifyAsync(accessToken, {
        complete: true,
        ignoreExpiration: true, // Not need verify expiration. Just check signature and other format
      });
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          success: false,
          code: "INVALID_ACCESS_TOKEN",
          message: "The access token provided is in the wrong format",
        });
      }
    }

    const expireTime = decodedAccessToken.payload.exp;

    if (!tokenExpires(expireTime)) {
      await jwtBlackList.addToken(decodedAccessToken.payload.jti, expireTime);
    }

    const newRefreshToken = await this.#generateRefreshToken(user);
    const newAccessToken = await this.#generateAccessToken(user);

    return {
      statusCode: HttpStatus.OK,
      success: true,
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    };
  }

  async #generateRefreshToken({
    id: userId,
    publicId: userPublicId,
  }: UserEntity) {
    const jwtConfig =
      await this.configService.get<ApiConf>("apiConf").jwtConfig;
    const refreshTokenId = generateJwtId();
    const refreshTokenPayload = {
      subtoken: makeRefreshTokenPayload({
        userPublicId: userPublicId,
        lastRefreshTokenId: refreshTokenId,
      }),
    };

    await this.userService.updateOneUser(userId, {
      lastRefreshTokenId: refreshTokenId,
    });

    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {
      jwtid: refreshTokenId,
      expiresIn: jwtConfig.refreshTokenExpiresIn,
    });

    return refreshToken;
  }

  async #generateAccessToken(user: UserEntity) {
    const jwtConfig =
      await this.configService.get<ApiConf>("apiConf").jwtConfig;

    const payload = {
      id: user.publicId,
      groups: user.roles,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      jwtid: generateJwtId(),
      expiresIn: jwtConfig.accessTokenExpiresIn,
    });

    return accessToken;
  }
}

async function inactiveAccountProccess({
  userService,
  user,
  webAppUrl,
  mailerService,
}: {
  userService: UserService;
  mailerService: MailerService;
  webAppUrl: string;
  user: UserEntity;
}) {
  const resetPasswordToken = generateResetPasswordToken();

  await userService.updateOneUser(user.id, {
    resetPasswordToken,
    tokenExpireAt: generateTokenExpireAt(),
  });

  const activationLink = makeAccountActivationUrl({
    token: resetPasswordToken,
    webAppUrl,
    userPublicId: user.publicId,
  });

  mailerService.sendAccountActivationMail({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    activationLink,
  });
}
