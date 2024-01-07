import { mailer as mailerConfig } from "config.json";
import { Liquid } from "liquidjs";
import { join, resolve } from "path";
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

export async function readLiquidTemplate(
  templateName: string
): Promise<string> {
  if (!templateExist(templateName)) {
    throw new Error(`invalid template name or directory: ${templateName}`);
  }

  const templatesDir = join(cwd(), mailerConfig.templatesDir);
  const liquidEngine = new Liquid({
    cache: true,
    root: templatesDir,
    extname: ".liquid",
    // outputEscape: "escape",
  });

  const html = await liquidEngine.renderFile(
    `${templateName}/main.liquid`,
    {},
    {}
  );
  return `${html}`;
}
// TODO: Init liquid JS to read a template. Setup template with partials to don't reapeat header and footer
