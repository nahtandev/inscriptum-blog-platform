import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { ApiConf } from "./app-context/context-type";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const apiConf = configService.get<ApiConf>("apiConf");

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(apiConf.listenPort);

  console.log(`Server is running on port ${apiConf.listenPort}`);
}

bootstrap();
