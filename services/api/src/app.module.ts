import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { DataSource } from "typeorm";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";

@Module({
    controllers: [AppController],
    imports: [
        AuthModule,
        TypeOrmModule.forRoot({
            type: "sqlite",
            database: join("data", "database.sqlite"), //TODO: Store a path in a config file
            logging: "all",
            logger: "advanced-console",
            manualInitialization: true,
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

