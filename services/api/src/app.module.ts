import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DataSource } from "typeorm";
import { buildAppContext } from "./app-context/app-context";
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
  constructor(private dataSource: DataSource) {
    this.#initDatabaseConnection();
  }

  async #initDatabaseConnection() {
    await this.dataSource
      .initialize()
      .then(() => console.log("database mounted successful"))
      .catch((error) => console.error("failed to mount database", error));
  }
}

