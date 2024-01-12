import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import { join } from "path";
import { cwd } from "process";
import { DatabaseConf } from "./context-type";

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private configService: ConfigService<{
      databaseConf: DatabaseConf;
      isDevEnv: boolean;
    }>
  ) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const dbConfig = await this.configService.get("databaseConf", {
      infer: true,
    });
    const isDevEnv = await this.configService.get("isDevEnv", { infer: true });

    return {
      type: "sqlite",
      database: join(cwd(), dbConfig.dbDir, dbConfig.dbName),
      logging: "all",
      logger: "advanced-console",
      manualInitialization: true,
      entities: [join(__dirname, "../", "/modules/**/*model.js")],
      synchronize: isDevEnv,
    };
  }
}
