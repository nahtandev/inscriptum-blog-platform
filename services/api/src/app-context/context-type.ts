import { KeyType } from "crypto";
import { Algorithm } from "jsonwebtoken";
import { Transporter } from "nodemailer";
import { JwtBlackList } from "./redis-config";

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
  jwtConfig: JwtConfig;
  apiUrl: string;
}

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface JwtConfig {
  secret: string;
  privateKey: string;
  publicKey: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
  algorithm: Algorithm;
  asymmetricKeyType: KeyType;
  jwtBlackList: JwtBlackList;
}
