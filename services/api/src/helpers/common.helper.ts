import { accessSync } from "fs";
import { constants } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

export function generateRandomString(sequenceLength?: number): string {
  if (sequenceLength) return new Array(sequenceLength).fill(uuidv4()).join();
  return uuidv4();
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
