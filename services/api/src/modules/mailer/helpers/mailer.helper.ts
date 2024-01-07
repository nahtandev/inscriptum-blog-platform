import { mailer as mailerConfig } from "config.json";
import { createTransport } from "nodemailer";
import { resolve } from "path";
import { cwd } from "process";
import { isAccessiblePath } from "src/utils/basic.util";
import { readLiquidTemplate } from "./liquidjs.helper";

/**
 * Todo
 * - Récupérer les fichiers joints: fileName?, path.
 * - Configurer Liquid pour générer du html à partir d"un template.
 * - Ne pas ommettre aussi la gestion des images intégrés.
 */

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
  attachements?: Attachement[];
  embeddedImages?: EmbeddedImage[];
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
  attachements,
  embeddedImages,
}: SimpleMailOptions): Promise<SendSimpleMailResponse> {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  // const allAttachement: NodeMailerAttachment[] = [...embeddedImages];

  // for (const file of attachements) {
  //   if (file.fileName)
  //     allAttachement.push({ filename: file.fileName, path: file.filePath });
  //   else allAttachement.push({ path: file.filePath });
  // }

  try {
    const sentMessageInfo = await transporter.sendMail({
      from: from.name
        ? { name: from.name, address: from.address }
        : from.address,
      to: to.name ? { name: to.name, address: to.address } : to.address,
      subject,
      html,
      // attachments: allAttachement,
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
  templateName: string
  // mailOptions: SendMailOptions
) {
  const templateDir = resolve(cwd(), mailerConfig.templatesDir, templateName);

  if (!isAccessiblePath(templateDir)) {
    throw new Error(`invalid template, ${templateDir}`);
  }

  const html = await readLiquidTemplate(templateName);
  console.log(html);

  const sendMail = await sendSimpleMail({
    from: { name: "Inscriptum", address: "inscriptum@hellonathan.dev" },
    to: { name: "Nathan", address: "gnankadjanathan@gmail.com" },
    html,
    subject: "Implémentation d'un template liquid",
  });
  // const html = readFileSync(join(templateDir, "index.html")).toString(
  //   "utf-8"
  // );
  // const formatted = cidProcessing(html, templateDir);
  // const embeddedImages: Attachment[] = formatted.cidImages.map((el) => {
  //   return {
  //     path: resolve(templateDir, el.oldSrc),
  //     cid: el.cid,
  //   };
  // });
  // console.log(getImagesElementFromHtml(html));
  // attachements.map<NodeMailerAttachment>((file) => {
  //   if (file.fileName) {
  //     return {
  //       filename: file.fileName,
  //       path: file.filePath,
  //     };
  //   }
  //   return {
  //     path: file.filePath,
  //   };
  // });

  return sendMail;
}
