import { resolve } from "path";
import { cwd } from "process";
import { isAccessiblePath } from "src/utils/basic.util";
import { mailer as mailerConfig } from "../../../../config.json";

export function templateExist(templateName: string) {
  if (
    !isAccessiblePath(resolve(cwd(), mailerConfig.templatesDir, templateName))
  ) {
    return false;
  }
  return true;
}
