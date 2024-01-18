import { accessSync } from "fs";
import { constants } from "fs/promises";
import { Obj } from "src/types/common-types";
import { v4 as uuidv4 } from "uuid";

export function generateRandomString(sequenceLength?: number): string {
  if (!sequenceLength) return uuidv4();
  const strArray = new Array<string>(sequenceLength);
  for (let index = 0; index < sequenceLength; index++) {
    strArray[index] = uuidv4();
  }
  return strArray.join("-");
}

export function isAccessiblePath(path: string) {
  try {
    accessSync(path);
    return true;
  } catch {
    return false;
  }
}

export function isWritablePath(path: string) {
  try {
    accessSync(path, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

export function obfuscateTextData<T extends string | number | Obj>(
  data: T
): string {
  return Buffer.from(JSON.stringify(data), "utf8").toString("base64");
}

export function deobfuscateTextData<T extends string | number | Obj>(
  data: string
): T {
  return JSON.parse(Buffer.from(data, "base64").toString("utf8"));
}

