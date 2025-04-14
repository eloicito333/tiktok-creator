import path from "path"
import fs from "fs"
import { JSDOM } from "jsdom"
import { openai } from "#src/apiClients/openai.js"

const fetchWebImageUrl = async (prompt) => {
    const searchUrl = new URL("https://www.google.com/search")
        searchUrl.searchParams.append("udm", 2) // set to image search
        searchUrl.searchParams.append("as_q", prompt) // search query
        searchUrl.searchParams.append("imgsz", "xga") // image size = 1024x768
        
        const response = await fetch(searchUrl.href);
        const html = await response.text();

        // get 1st image url from html
        const dom = new JSDOM(html);
        const document = dom.window.document
        const imageUrl = (new URL(document.querySelector("#rso > div > div > div.wH6SXe.u32vCb > div > div > div:nth-child(1) > div.czzyk.XOEbc > h3 > a").href)).searchParams.get("imgurl");

        return imageUrl
}

const fetchAiImageUrl = async (prompt) => {
    const response = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024",
    });

    return response.data[0].url // image url
}

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