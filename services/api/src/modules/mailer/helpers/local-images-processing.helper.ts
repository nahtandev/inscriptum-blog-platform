import { v2 as cloudinary } from "cloudinary";
import { JSDOM } from "jsdom";
import { join } from "path";
import { CloudinaryConfig } from "src/app-context/context-type";

// TODO: handle duplicate locale assets
export async function localeImagesProcessing(
  html: string,
  currentTemplateDir: string,
  { apiKey, apiSecret, cloudName }: CloudinaryConfig
) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  const dom = new JSDOM(html);
  const imageElements = dom.window.document.getElementsByTagName("img");
  for (const element of Array.from(imageElements)) {
    if (
      element.dataset.localImageProccess &&
      element.dataset.localImageProccess === "upload"
    ) {
      const response = await cloudinary.uploader.upload(
        join(currentTemplateDir, element.src)
      );
      element.setAttribute("src", response.secure_url);
    }
  }
  return { html: dom.serialize() };
}
