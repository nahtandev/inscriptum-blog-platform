import { readFileSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { isAccessiblePath } from "src/helpers/common.helper";
import { Obj } from "src/types/common-types";

export interface RawConfig {
  mailer: Obj;
  database: Obj;
  jwt: Obj;
}

export function readConfigFile(): RawConfig {
  const configFilePath = join(cwd(), "config.json");
  if (!isAccessiblePath(configFilePath)) {
    throw new Error(`[context]: error to access config file`);
  }

  const rawData = new Map<string, any>();
  try {
    const content = readFileSync(configFilePath, "utf-8");
    for (const [key, value] of Object.entries(JSON.parse(content))) {
      rawData.set(key, value);
    }

    checkConfigRawData(["mailer", "database", "jwt"], rawData);

    return {
      mailer: rawData.get("mailer"),
      database: rawData.get("database"),
      jwt: rawData.get("jwt"),
    };
  } catch (error) {
    throw new Error(`[context]: error to load config file. error: ${error}`);
  }
}

function checkConfigRawData(keys: string[], configRawData: Map<string, any>) {
  for (const key of keys) {
    if (!configRawData.has(key)) {
      throw new Error(`[config-check]: missing config "${key}" in config file`);
    }

    if (!configRawData.get(key) === undefined) {
      throw new Error(`[config-check]: config "${key}" has undefined value `);
    }
  }
}
