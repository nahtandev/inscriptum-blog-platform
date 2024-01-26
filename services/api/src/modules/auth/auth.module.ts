import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { ApiConf } from "src/app-context/context-type";
import { MailerModule } from "../mailer/mailer.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const { jwtConfig, webAppUrl, apiUrl } =
          configService.get<ApiConf>("apiConf");

        return {
          publicKey: jwtConfig.publicKey,
          privateKey: {
            asymmetricKeyType: jwtConfig.asymmetricKeyType,
            passphrase: jwtConfig.secret,
            key: jwtConfig.privateKey,
          },
          global: true,
          signOptions: {
            algorithm: jwtConfig.algorithm,
            issuer: apiUrl,
            audience: [webAppUrl],
          },
          verifyOptions: {
            ignoreExpiration: false,
          },
        };
      },
    }),
    MailerModule,
  ],
  providers: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
