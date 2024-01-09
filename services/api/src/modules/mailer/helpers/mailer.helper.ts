import { mailer as mailerConfig } from "config.json";
import { resolve } from "path";
import { cwd } from "process";
import { isAccessiblePath } from "src/utils/basic.util";
import { localeImagesProcessing } from "./images-cid-processing.helper";
import { readLiquidTemplate } from "./liquidjs.helper";
import transporter from "./transporter";

export interface Attachement {
  fileName?: string;
  filePath: string;
}

export interface EmbeddedImage {
  path: string;
  cid: string;
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

export async function sendSimpleMail({
  from,
  to,
  subject,
  html,
  medias,
}: SimpleMailOptions): Promise<SendSimpleMailResponse> {
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

export async function sendMailFromTemplate(
  templateName: string,
  variables: { [key: string]: any },
  mailOptions: { from: Address; to: Address; subject: string }
): Promise<SendSimpleMailResponse> {
  const templateDir = resolve(cwd(), mailerConfig.templatesDir, templateName);

  if (!isAccessiblePath(templateDir)) {
    throw new Error(`invalid template, ${templateDir}`);
  }

  const template = await readLiquidTemplate(templateName, variables);
  const { html } = await localeImagesProcessing(template, templateDir);

  const sendMail = await sendSimpleMail({
    from: mailOptions.from,
    to: mailOptions.to,
    subject: mailOptions.subject,
    html,
  });

  return sendMail;
}
