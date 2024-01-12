import { Transporter } from "nodemailer";

export interface AppContext {
  mailConf: MailConf;
  mailTransporter: Transporter;
  databaseConf: DatabaseConf;
  apiConf: ApiConf;
  isDevEnv: boolean;
  cloudinaryConf: CloudinaryConfig;
}

export interface MailConf {
  templatesDir: string;
  sender: MailSender;
}

export interface SmtpConf {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
}

export interface MailSender {
  name: string;
  email: string;
}

export interface DatabaseConf {
  dbDir: string;
  dbName: string;
}

export interface ApiConf {
  listenPort: string;
  webAppUrl: string;
  nodeEnv: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}
