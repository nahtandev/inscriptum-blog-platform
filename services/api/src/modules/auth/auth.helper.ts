import { compareSync, hash } from "bcrypt";
import { generateRandomString } from "src/helpers/common.helper";
import { unixTimestamp } from "src/helpers/date.helper";

export function generateResetPasswordToken() {
  const randomString = generateRandomString(5);
  return Buffer.from(JSON.stringify(randomString)).toString("base64");
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
