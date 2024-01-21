import { generateKeyPairSync } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { isAccessiblePath, isWritablePath } from "src/helpers/common.helper";

export function readJwtPrivateKey(keyDir: string, keyFileName: string) {
  const keyPath = join(keyDir, keyFileName);

  if (!isAccessiblePath(keyPath)) {
    throw new Error(
      `[jwt-key-reader]: invalid jwt private key path: ${keyPath}`
    );
  }

  try {
    const privateKey = readFileSync(keyPath, "utf8");
    return privateKey.replace(/\\n/gm, "\n");
  } catch (error) {
    throw new Error(`[jwt-key-reader]: error to load private key: ${error}`);
  }
}

export function generateRsaJwtKeys({
  secret,
  privateKeyFileName,
  publicKeyFileName,
  keyDir,
}: {
  secret: string;
  privateKeyFileName: string;
  publicKeyFileName: string;
  keyDir: string;
}) {
  const publicKeyPath = join(keyDir, publicKeyFileName);
  const privateKeyPath = join(keyDir, privateKeyFileName);

  if (!isWritablePath(publicKeyPath) || !isWritablePath(privateKeyPath)) {
    throw new Error(`[key-file-generator]: key file is not accessible`);
  }

  if (rsaKeysArefound(publicKeyPath, privateKeyPath)) return;

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
      cipher: "aes-256-cbc",
      passphrase: secret,
    },
  });

  try {
    writeFileSync(publicKeyPath, publicKey, { encoding: "utf-8" });
    writeFileSync(privateKeyPath, privateKey, { encoding: "utf-8" });
  } catch (error) {
    throw new Error(
      `[key-file-generator]: error to write in key file: ${error}`
    );
  }
}

// TODO: Create a real rsa keys checker
function rsaKeysArefound(
  publicKeyPath: string,
  privateKeyPath: string
): boolean {
  const privateKey = readFileSync(privateKeyPath, "utf-8");
  const publicKey = readFileSync(publicKeyPath, "utf-8");

  if (privateKey.length >= 100 && publicKey.length >= 100) return true;
  return false;
}
