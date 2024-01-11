import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { database as dbConfig } from "config.json";
import { join } from "path";
import { cwd } from "process";
import { DataSource } from "typeorm";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
  controllers: [AppController],
  imports: [
    AuthModule,
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: join(cwd(), dbConfig.databaseDir, "db.sqlite"), //TODO: Store a path in a config file
      logging: "all",
      logger: "advanced-console",
      manualInitialization: true,
      entities: [join(__dirname, "/modules/**/*model.js")],
      synchronize: process.env.NODE_ENV === "dev" ? true : false,
    }),
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

