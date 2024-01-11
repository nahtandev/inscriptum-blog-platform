import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { config as initDotenv } from "dotenv";
import { AppModule } from "./app.module";

async function bootstrap() {
  initDotenv();
  const port = process.env.LISTEN_PORT || 3000;
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
}

bootstrap();
