import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transporter } from "nodemailer";
import { CloudinaryConfig, MailConf } from "src/app-context/context-type";
import { Address, sendMailFromTemplate } from "./helpers/mailer.helper";

interface SendAccountActivationMailPayload {
  firstName: string;
  lastName: string;
  email: string;
  activationLink: string;
}

@Injectable()
export class MailerService {
  constructor(private configService: ConfigService) {}

  async sendMail(
    template: string,
    htmlContent: string,
    options: { to: Address; subject: string }
  ) {
    const { sender, templatesDir } =
      this.configService.get<MailConf>("mailConf");

    const mailTransporter =
      this.configService.get<Transporter>("mailTransporter");

    const cloudinaryConf =
      this.configService.get<CloudinaryConfig>("cloudinaryConf");

    return await sendMailFromTemplate({
      cloudinaryOption: cloudinaryConf,
      transporter: mailTransporter,
      templateName: template,
      templatesDir,
      variables: { htmlContent, platformEmail: sender.email },
      mailOptions: {
        from: {
          name: sender.name,
          address: sender.email,
        },
        ...options,
      },
    });
  }

  async sendAccountActivationMail({
    firstName,
    lastName,
    email,
    activationLink,
  }: SendAccountActivationMailPayload) {
    const { sender, templatesDir } =
      this.configService.get<MailConf>("mailConf");

    const transporter = this.configService.get<Transporter>("mailTransporter");

    const cloudinaryConf =
      this.configService.get<CloudinaryConfig>("cloudinaryConf");

    return await sendMailFromTemplate({
      cloudinaryOption: cloudinaryConf,
      transporter,
      templateName: "account-activation",
      templatesDir,
      variables: {
        firstName,
        activationLink,
        platformEmail: sender.email,
      },
      mailOptions: {
        to: { name: `${firstName} ${lastName}`, address: email },
        from: {
          name: sender.name,
          address: sender.email,
        },
        subject: `[Welcome ${firstName} 👋️👋️] Please confirm your email`,
      },
    });
  }
}
