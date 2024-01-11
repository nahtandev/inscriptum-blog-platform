import { Injectable } from "@nestjs/common";
import { config } from "dotenv";
import { Address, sendMailFromTemplate } from "./helpers/mailer.helper";

config();

interface SendAccountActivationMailPayload {
  firstName: string;
  lastName: string;
  email: string;
  activationLink: string;
}

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

  async sendAccountActivationMail({
    firstName,
    lastName,
    email,
    activationLink,
  }: SendAccountActivationMailPayload) {
    return await sendMailFromTemplate(
      "account-activation",
      {
        firstName,
        activationLink,
        platformEmail: process.env.SENDER_EMAIL,
      },
      {
        to: { name: `${firstName} ${lastName}`, address: email },
        from: {
          name: process.env.SENDER_NAME,
          address: process.env.SENDER_EMAIL,
        },
        subject: `[Welcome ${firstName} 👋️👋️] Please confirm your email`,
      }
    );
  }
}
