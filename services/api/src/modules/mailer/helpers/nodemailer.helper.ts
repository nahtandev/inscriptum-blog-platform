import { createTransport } from "nodemailer";
import { join } from "path";

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

    try {
        await transporter.sendMail({
            from: { address: "inscriptum@hellonathan.dev", name: "Inscriptum" },
            to: { name: "Nathan", address: "gnankadjanathan@gmail.com" },
            subject: "Inscription sutr la plateforme",
            html: "Inscription de compte",
            attachments: [
                { filename: "text.txt", path: join("data", "text.txt") },
            ],
        });
        console.log("Mail send succeful");
    } catch (error) {
        console.log("Error To send mail", error);
    }
}
