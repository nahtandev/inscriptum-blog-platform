import { compareSync, hash } from "bcrypt";
import {
  generateRandomString,
  obfuscateTextData,
} from "src/helpers/common.helper";
import { unixTimestamp } from "src/helpers/date.helper";
import { v4 as uuidv4 } from "uuid";

export function generateResetPasswordToken() {
  return generateRandomString(2);
}

export async function hashPassword(password: string) {
  return await hash(password, 10);
}

export function isSamePassword(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compareSync(plainTextPassword, hashedPassword);
}

export function generateTokenExpireAt() {
  const validityPeriod = 86400; // 24h in second
  return unixTimestamp() + validityPeriod;
}

export function makeAccountActivationUrl({
  token,
  userPublicId,
  webAppUrl,
}: {
  token: string;
  userPublicId: string;
  webAppUrl: string;
}) {
  const payload = obfuscateTextData(`${userPublicId}::${token}`);
  return `${webAppUrl}/auth/signup/activate/${encodeURIComponent(payload)}`;
}

export function makeResetPasswordUrl(token: string, webAppUrl: string) {
  return `${webAppUrl}/account`; // TODO: Finalize it in next task
}

export function generateRowPublicId(): string {
  return uuidv4();
}
