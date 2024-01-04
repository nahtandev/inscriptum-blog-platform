import { JSDOM } from "jsdom";
import { resolve } from "path";
import { generateRandomString, isAccessiblePath } from "src/utils/basic.util";

export function cidProcessing(html: string, currentTemplateDir: string) {
  const dom = new JSDOM(html);
  let cidImages: { cid: string; oldSrc: string }[] = [];

  const imageElements = dom.window.document.getElementsByTagName("img");
  const imagesSrc = Array.from(imageElements).map((element) => element.src);

  for (const src of imagesSrc) {
    if (isAccessiblePath(resolve(currentTemplateDir, src))) {
      cidImages.push({
        cid: generateRandomString(),
        oldSrc: src,
      });
    } else continue;
  }

  for (let i = 0; i < imageElements.length; i++) {
    const img = imageElements[i];
    const cid = cidImages.find((el) => el.oldSrc === img.src);
    img.setAttribute("src", `cid:${cid.cid}`);
  }

  return { html: dom.serialize(), cidImages };
}
