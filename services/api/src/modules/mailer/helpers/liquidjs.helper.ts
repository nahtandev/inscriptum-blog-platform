import { mailer as mailerConfig } from "config.json";
import { resolve } from "path";
import { cwd } from "process";
import { isAccessiblePath } from "src/utils/basic.util";

export function templateExist(templateName: string) {
  if (
    !isAccessiblePath(resolve(cwd(), mailerConfig.templatesDir, templateName))
  ) {
    return false;
  }
  return true;
}

// TODO: Init liquid JS to read a template. Setup template with partials to don't reapeat header and footer
