import { Module } from "@nestjs/common";
import { MailerService } from "./mailer.service";

@Module({ exports: [MailerService] })
export class Mailer {}
