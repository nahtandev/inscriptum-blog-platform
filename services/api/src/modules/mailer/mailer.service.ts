import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import { Address, sendMailFromTemplate } from "./helpers/mailer.helper";

config();

@Injectable()
export class MailerService {
  async sendMail(
    template: string,
    htmlContent: string,
    options: { to: Address; subject: string }
  ) {
    return await sendMailFromTemplate(
      template,
      { htmlContent, platformEmail: process.env.SENDER_EMAIL },
      {
        from: {
          name: process.env.SENDER_NAME,
          address: process.env.SENDER_EMAIL,
        },
        ...options,
      }
    );
  }

  async sendAccountActivationMail() {}
}
