import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { buildAppContext } from "./app-context/app-context";
import { ApiConf } from "./app-context/context-type";
import { TypeOrmConfigService } from "./app-context/type-orm-config";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { PostModule } from "./modules/post/post.module";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      ignoreEnvVars: true,
      load: [buildAppContext],
    }),

    // TODO: This is a temporary solution to make Jwt Module globale
    // Check this issue to setup a core module, to make properly
    // https://github.com/nestjs/jwt/issues/103
    {
      ...JwtModule.registerAsync({
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
      global: true,
    },

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    AuthModule,
    PostModule,
  ],
})
export class AppModule {
  constructor(
    private dataSource: DataSource,
    private configService: ConfigService
  ) {
    this.#init();
  }

  async #init() {
    const jwtBlackList =
      await this.configService.get<ApiConf>("apiConf").jwtConfig.jwtBlackList;
    await this.#initDatabaseConnection();
    await jwtBlackList.init();
  }

  async #initDatabaseConnection() {
    await this.dataSource
      .initialize()
      .then(() => console.log("[type-orm] database mounted successful"))
      .catch((error) =>
        console.error("[type-orm] failed to mount database", error)
      );
  }
}
