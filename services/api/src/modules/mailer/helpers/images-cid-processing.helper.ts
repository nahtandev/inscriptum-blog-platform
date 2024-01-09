import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";
import { JSDOM } from "jsdom";
import { join } from "path";

config();

// TODO: handle duplicate locale assets
export async function localeImagesProcessing(
  html: string,
  currentTemplateDir: string
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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
