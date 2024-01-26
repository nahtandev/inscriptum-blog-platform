import { KeyType } from "crypto";
import { config as loadEnvVariables } from "dotenv";
import { Algorithm } from "jsonwebtoken";
import { createTransport } from "nodemailer";
import { join } from "path";
import { cwd, env } from "process";
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
  JwtConfig,
  MailConf,
  MailSender,
  SmtpConf,
} from "./context-type";
import {
  generateRsaJwtKeys,
  readJwtRsaKey,
} from "./jwt/jwt-rsa-keys-reader-writer";
import { readConfigFile } from "./load-configuration";
import { JwtBlackList, RedisClientConfig } from "./redis-config";

loadEnvVariables();

export async function buildAppContext(): Promise<AppContext> {
  const { mailer, database, jwt } = readConfigFile();

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

  const jwtConf: {
    keyDir: string;
    privateKeyFileName: string;
    publicKeyFileName: string;
    algorithm: Algorithm;
    asymmetricKeyType: KeyType;
  } = {
    keyDir: toStringValue(jwt.keyDir),
    privateKeyFileName: toStringValue(jwt.privateKeyFileName),
    publicKeyFileName: toStringValue(jwt.publicKeyFileName),
    algorithm: toStringValue<Algorithm>(jwt.algorithm),
    asymmetricKeyType: toStringValue<KeyType>(jwt.asymmetricKeyType),
  };

  const jwtKeyDir = join(cwd(), jwtConf.keyDir);
  const jwtSecret = toStringValue(env.JWT_SECRET);

  generateRsaJwtKeys({
    secret: jwtSecret,
    keyDir: jwt.keyDir,
    privateKeyFileName: jwtConf.privateKeyFileName,
    publicKeyFileName: jwt.publicKeyFileName,
  });

  const redisConf: RedisClientConfig = {
    host: toStringValue(env.REDIS_HOST),
    password: toStringValue(env.REDIS_PASSWORD),
    port: toNumberValue(env.REDIS_PORT),
  };

  const jwtBlackList = new JwtBlackList(redisConf);
  const { privateKey, publicKey } = readJwtRsaKey(
    jwtKeyDir,
    jwtConf.privateKeyFileName,
    jwtConf.publicKeyFileName
  );

  const jwtConfig: JwtConfig = {
    jwtBlackList,
    privateKey,
    publicKey,
    secret: jwtSecret,
    algorithm: jwtConf.algorithm,
    asymmetricKeyType: jwtConf.asymmetricKeyType,
    accessTokenExpiresIn: toNumberValue(env.JWT_ACCESS_TOKEN_EXPIRES_IN),
    refreshTokenExpiresIn: toNumberValue(env.JWT_REFRESH_TOKEN_EXPIRES_IN),
  };

  const apiConf: ApiConf = {
    jwtConfig,
    listenPort: toStringValue(env.LISTEN_PORT),
    nodeEnv: toStringValue(env.NODE_ENV),
    webAppUrl: toStringValue(env.WEB_APP_URL),
    apiUrl: toStringValue(env.API_URL),
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
