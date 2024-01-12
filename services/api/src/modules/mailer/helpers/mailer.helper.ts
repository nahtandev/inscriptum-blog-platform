import { Transporter } from "nodemailer";
import { CloudinaryConfig } from "src/app-context/context-type";
import { isAccessiblePath } from "src/helpers/common.helper";
import { readLiquidTemplate } from "./liquidjs.helper";
import { localeImagesProcessing } from "./local-images-processing.helper";

export interface Attachement {
  fileName?: string;
  filePath: string;
}

export type Address = {
  address: string;
  name?: string;
};

export interface SimpleMailOptions {
  from: Address;
  to: Address;
  subject: string;
  html: string;
  medias?: Attachement[];
}

export interface SendSimpleMailResponse {
  messageId: string;
  response: string;
}

export interface SendMailFromTemplateOptions {
  cloudinaryOption: CloudinaryConfig;
  transporter: Transporter;
  templatesDir: string;
  templateName: string;
  variables: { [key: string]: any };
  mailOptions: { from: Address; to: Address; subject: string };
}

export async function sendSimpleMail(
  transporter: Transporter,
  { from, to, subject, html, medias }: SimpleMailOptions
): Promise<SendSimpleMailResponse> {
  try {
    const sentMessageInfo = await transporter.sendMail({
      from: from.name
        ? { name: from.name, address: from.address }
        : from.address,
      to: to.name ? { name: to.name, address: to.address } : to.address,
      subject,
      html,
      attachments: medias?.map((media) => {
        if (media.fileName) {
          return {
            filename: media.fileName,
            path: media.filePath,
          };
        }
        return { path: media.filePath };
      }),
    });

    return {
      messageId: sentMessageInfo.messageId,
      response: sentMessageInfo.response,
    };
  } catch (error) {
    throw new Error(`failed to send mail ${error}`);
  }
}

export async function sendMailFromTemplate({
  templatesDir,
  templateName,
  variables,
  transporter,
  cloudinaryOption,
  mailOptions,
}: SendMailFromTemplateOptions): Promise<SendSimpleMailResponse> {
  if (!isAccessiblePath(templatesDir)) {
    throw new Error(`invalid template, ${templatesDir}`);
  }

  const template = await readLiquidTemplate({
    templateName,
    variables,
    templatesDir,
  });

  const { html } = await localeImagesProcessing(
    template,
    templatesDir,
    cloudinaryOption
  );

  const sendMail = await sendSimpleMail(transporter, {
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html,
  });

  return sendMail;
}
