import { Injectable } from "@nestjs/common";

@Injectable()
export class MailerService {
  async sendMail() {
    // await sendSimpleMail();
  }

  async sendAccountActivationMail() {}
}
