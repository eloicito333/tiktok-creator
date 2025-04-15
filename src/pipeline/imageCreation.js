import { openai } from "#src/apiClients/openai.js"
import puppeteer from "puppeteer";

export const fetchWebImageUrl = async (prompt) => {
  const searchUrl = new URL("https://www.google.com/search");
  searchUrl.searchParams.append("as_q", prompt);
  searchUrl.searchParams.append("imgsz", "xga");
  searchUrl.searchParams.append("udm", 2);
  searchUrl.searchParams.append("tbm", "isch");

  const executablePath = process.env?.CHROME_EXECUTABLE_PATH || undefined;

  const browser = await puppeteer.launch({
    headless: "new",
    ...(executablePath && { executablePath }),
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  await page.goto(searchUrl.href, { waitUntil: "networkidle2" });

  
  const linkSelector = "#rso > div > div > div.wH6SXe.u32vCb > div > div > div:nth-child(1) > div.czzyk.XOEbc > h3 > a";
  const noCookiesSelector = "#W0wltc";

  try{
    // Check for the cookie consent button and click it if present
    const cookieButton = await page.$(noCookiesSelector);
    if (cookieButton) {
      await cookieButton.click();
    }

    // Proceed to hover over the desired element and extract its href
    await page.waitForSelector(linkSelector, { visible: true });
    await page.hover(linkSelector);
    await page.waitForFunction(
      (selector) => {
        const el = document.querySelector(selector);
        return el && el.href && el.href.length > 0;
      },
      {},
      linkSelector
    );

    const href = await page.$eval(linkSelector, el => el.href);
    const imageUrl = (new URL(href)).searchParams.get("imgurl");

    await browser.close();

    if (!imageUrl) {
      throw new Error("Image URL not found in href.");
    }

    return imageUrl;
  } catch (err) {
    await browser.close();
    throw new Error(`Selector not found or image URL could not be parsed. Error: ${err}`);
  }
};

export const fetchAiImageUrl = async (prompt) => {
  const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
  });

  return response.data[0].url // image url
}