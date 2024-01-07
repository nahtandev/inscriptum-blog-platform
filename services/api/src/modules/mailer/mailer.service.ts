import { Injectable } from "@nestjs/common";
import { sendMailFromTemplate } from "./helpers/mailer.helper";

@Injectable()
export class MailerService {
  async sendMail() {
    await sendMailFromTemplate("blank");
  }

  async sendAccountActivationMail() {}
}
