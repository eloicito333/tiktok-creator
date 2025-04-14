import path from "path"
import fs from "fs"
import { fetchWebImageUrl, fetchAiImageUrl } from "./imageCreation.js"

const imageUrlFetchers = {
    web: fetchWebImageUrl,
    ai: fetchAiImageUrl
}

export const imageSubPipeline = async (part, index, { imageFolderPath }) => {
    const { source, prompt } = part

    const imageUrlFetcher = imageUrlFetchers?.[source]
    if(!imageUrlFetcher) {
      throw new Error(`Unsuported source value: ${source}`)
    }

    console.log(`⏳ Fetching image for index ${index}...`)
    const imageUrl = await imageUrlFetcher(prompt)

    if(!imageUrl) {
      throw new Error("No image url found")
    }

    // image fetching and downloading
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
    }

    // get image type from content-type header
    const contentType = imageResponse.headers.get('content-type');
    if(!contentType) {
      throw new Error("Unknown image type (missing content-type header)")
    }
    const imageType = contentType.split('/')[1] // Extract type from content-type
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageFilePath = path.join(imageFolderPath, `${index}_${source}_image.${imageType}`);
    
    fs.writeFileSync(imageFilePath, Buffer.from(imageBuffer));
    console.log(`✅ Image saved to ${imageFilePath}`);

    return {
        imageFilePath
    }
}