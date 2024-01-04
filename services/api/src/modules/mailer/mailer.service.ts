import { Injectable } from "@nestjs/common";
import { sendSimpleMail } from "./helpers/nodemailer.helper";

@Injectable()
export class MailerService {
    async sendMail() {
        await sendSimpleMail();
    }

    async sendAccountActivationMail() {}
}
