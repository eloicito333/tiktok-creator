import { JSDOM } from "jsdom"
import { openai } from "#src/apiClients/openai.js"

export const fetchWebImageUrl = async (prompt) => {
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

export const fetchAiImageUrl = async (prompt) => {
  const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
  });

  return response.data[0].url // image url
}