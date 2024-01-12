import { Liquid } from "liquidjs";
import { resolve } from "path";
import { cwd } from "process";
import { isAccessiblePath } from "src/helpers/common.helper";

export function templateExist(templateName: string, templatesDir: string) {
  if (!isAccessiblePath(resolve(cwd(), templatesDir, templateName))) {
    return false;
  }
  return true;
}

export async function readLiquidTemplate({
  templateName,
  templatesDir,
  variables,
}: {
  templateName: string;
  variables: { [key: string]: any };
  templatesDir: string;
}): Promise<string> {
  if (!templateExist(templateName, templatesDir)) {
    throw new Error(`invalid template name or directory: ${templateName}`);
  }
  const liquidEngine = new Liquid({
    cache: true,
    root: templatesDir,
    extname: ".liquid",
  });
  const html = await liquidEngine.renderFile(
    `${templateName}/main.liquid`,
    variables,
    {}
  );
  return `${html}`;
}
