import { Module } from "@nestjs/common";
import { MailerService } from "../mailer/mailer.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
    providers: [AuthService, MailerService],
    controllers: [AuthController],
})
export class AuthModule {}
