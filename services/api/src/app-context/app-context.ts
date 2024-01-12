import { config as loadEnvVariables } from "dotenv";
import { createTransport } from "nodemailer";
import { env } from "process";
import {
  toBoolValue,
  toNumberValue,
  toStringValue,
} from "src/helpers/formatter.helper";
import {
  ApiConf,
  AppContext,
  CloudinaryConfig,
  DatabaseConf,
  MailConf,
  MailSender,
  SmtpConf,
} from "./context-type";
import { readConfigFile } from "./load-configuration";

loadEnvVariables();

export async function buildAppContext(): Promise<AppContext> {
  const { mailer, database } = await readConfigFile();

  const smtpConf: SmtpConf = {
    host: toStringValue(env.SMTP_HOST),
    port: toNumberValue(env.SMTP_PORT),
    username: toStringValue(env.SMTP_USERNAME),
    password: toStringValue(env.SMTP_PASSWORD),
    secure: toBoolValue(env.SMTP_SECURE_CONNECTION),
  };

  const cloudinaryConf: CloudinaryConfig = {
    cloudName: toStringValue(env.CLOUDINARY_CLOUD_NAME),
    apiKey: toStringValue(env.CLOUDINARY_API_KEY),
    apiSecret: toStringValue(env.CLOUDINARY_API_SECRET),
  };

  const mailSender: MailSender = {
    name: toStringValue(mailer.senderName),
    email: toStringValue(mailer.senderEmail),
  };

  const databaseConf: DatabaseConf = {
    dbDir: toStringValue(database.dir),
    dbName: toStringValue(database.name),
  };

  const apiConf: ApiConf = {
    listenPort: toStringValue(env.LISTEN_PORT),
    nodeEnv: toStringValue(env.NODE_ENV),
    webAppUrl: toStringValue(env.WEB_APP_URL),
  };

  const mailTransporter = createTransport({
    host: smtpConf.host,
    port: smtpConf.port,
    secure: smtpConf.secure,
    auth: {
      user: smtpConf.username,
      pass: smtpConf.password,
    },
  });

  const mailConf: MailConf = {
    sender: mailSender,
    templatesDir: toStringValue(mailer.templatesDir),
  };

  const isDevEnv = apiConf.nodeEnv === "dev";

  const appContext: AppContext = {
    mailConf,
    databaseConf,
    apiConf,
    isDevEnv,
    mailTransporter,
    cloudinaryConf,
  };

  return appContext;
}
