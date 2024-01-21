import { compareSync, hash } from "bcrypt";
import {
  deobfuscateTextData,
  generateRandomString,
  obfuscateTextData,
} from "src/helpers/common.helper";
import { unixTimestamp } from "src/helpers/date.helper";
import { RefreshTokenPayload } from "src/types/common-types";
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

export function validationTokenHasExpired(tokenExpireAt: number): boolean {
  if (tokenExpireAt <= unixTimestamp()) return true;
  return false;
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
  const payload = makeResetPasswordPayloadObfuscated(userPublicId, token);
  return `${webAppUrl}/auth/signup/activate/${encodeURIComponent(payload)}`;
}

export function makeResetPasswordPayloadObfuscated(
  userPublicId: string,
  token: string
) {
  return obfuscateTextData(`${userPublicId}::${token}`);
}

export function makeResetPasswordUrl(token: string, webAppUrl: string) {
  return `${webAppUrl}/account`; // TODO: Finalize it in next task
}

export function generateRowPublicId(): string {
  return uuidv4();
}

export function makeDefaultUsername(firstName: string, lastName: string) {
  return `${firstName.toLowerCase()}${lastName.toLocaleLowerCase()}`;
}

export function makeRefreshTokenPayload({
  userPublicId,
  lastRefreshTokenId,
}: RefreshTokenPayload) {
  return obfuscateTextData(`${userPublicId}::${lastRefreshTokenId}`);
}

export function makeRefreshTokenId() {
  return generateRandomString(2);
}

export function decodeRefreshToken(refreshToken): RefreshTokenPayload {
  const [publicId, lastRefreshTokenId] =
    deobfuscateTextData<string>(refreshToken).split("::");

  return {
    userPublicId: publicId,
    lastRefreshTokenId,
  };
}
