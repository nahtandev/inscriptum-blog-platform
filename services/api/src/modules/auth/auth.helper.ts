import { compareSync, hash } from "bcrypt";
import { Request } from "express";
import {
  deobfuscateTextData,
  generateRandomString,
  obfuscateTextData,
} from "src/helpers/common.helper";
import { unixTimestamp } from "src/helpers/date.helper";
import {
  EncodedRefreshTokenPayload,
  RefreshTokenPayload,
} from "src/types/common-types";
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

export function generateJwtId() {
  return generateRandomString();
}

export function decodeRefreshToken(
  refreshTokenPayloadEncoded: EncodedRefreshTokenPayload
): RefreshTokenPayload {
  const [publicId, lastRefreshTokenId] = deobfuscateTextData<string>(
    refreshTokenPayloadEncoded.subtoken
  ).split("::");

  return {
    userPublicId: publicId,
    lastRefreshTokenId,
  };
}

export function tokenExpires(expiresIn: number) {
  return expiresIn <= unixTimestamp();
}

export function extractTokenFromHeader(request: Request): string | undefined {
  const [type, token] = request.headers.authorization?.split(" ") ?? [];
  return type === "Bearer" ? token : undefined;
}
