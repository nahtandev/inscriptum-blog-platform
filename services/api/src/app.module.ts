import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { buildAppContext } from "./app-context/app-context";
import { ApiConf } from "./app-context/context-type";
import { TypeOrmConfigService } from "./app-context/type-orm-config";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      ignoreEnvVars: true,
      load: [buildAppContext],
    }),

    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),

    AuthModule,
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

