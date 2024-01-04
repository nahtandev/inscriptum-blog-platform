import { readFileSync } from "fs";
import { createTransport } from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";
import { join, resolve } from "path";
import { cwd } from "process";
import { mailer as mailerConfig } from "../../../../config.json";
import { cidProcessing } from "./images-cid-processing.helper";

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

export type Address = {
  address: string;
  name?: string; // If undefined, send mail just this email and left name
};

export interface SimpleMailOptions {
  from: Address;
  to: Address;
  subject: string;
  html: string;
  attachements: Attachement[];
}

export interface SendSimpleMailResponse {}

export async function sendSimpleMail() {
  const transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const templateDir = resolve(cwd(), mailerConfig.templatesDir, "blank");

  try {
    const html = readFileSync(join(templateDir, "index.html")).toString(
      "utf-8"
    );

    const formatted = cidProcessing(html, templateDir);

    const attachements: Attachment[] = formatted.cidImages.map((el) => {
      return {
        path: resolve(templateDir, el.oldSrc),
        cid: el.cid,
      };
    });

    // console.log(getImagesElementFromHtml(html));
    await transporter.sendMail({
      from: { address: "inscriptum@hellonathan.dev", name: "Inscriptum" },
      to: { name: "Nathan", address: "gnankadjanathan@gmail.com" },
      subject: "Test des images",
      html: formatted.html,
      attachments: attachements,
    });
    console.log("Mail send succeful");
  } catch (error) {
    console.log("Error To send mail", error);
  }
}
