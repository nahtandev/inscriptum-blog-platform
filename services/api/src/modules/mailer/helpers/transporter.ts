import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();

// TODO: setup a global config
export default createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
});
