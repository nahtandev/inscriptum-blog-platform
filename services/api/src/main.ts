import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
    const port = 3000;
    const app = await NestFactory.create(AppModule);
    await app.listen(port);
    console.log(`Server is running on port ${port}`);
}

bootstrap();
