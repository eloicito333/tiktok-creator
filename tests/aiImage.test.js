import fs from 'fs';
import path from 'path';
import { fetchAiImageUrl } from '../src/pipeline/imageCreation.js';
import { testsGenDirName } from './testDirNames.js';

export const runAiImageTest = async () => {
  const imageUrl = await fetchAiImageUrl("cat")

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
  const imageFilePath = path.join(testsGenDirName, `ai-image.${imageType}`);

  fs.writeFileSync(imageFilePath, Buffer.from(imageBuffer));
  console.log(`✅ AI generated image saved to ${imageFilePath}`);
}

await runAiImageTest()