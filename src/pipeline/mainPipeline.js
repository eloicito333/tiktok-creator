import path from "path";
import { ensureDirExists } from "#src/lib/fileUtils.js";
import { speechSubPipeline } from "./speechSubPipeline.js";
import { imageSubPipeline } from "./imageSubPipeline.js";

export const processScript = async (script, folderPath) => {
  const audioFolderPath = path.join(folderPath, "audios")
  const transcriptFolderPath = path.join(folderPath, "transcriptions")
  const imageFolderPath = path.join(folderPath, "images")

  // Ensure the folder exists
  await ensureDirExists(folderPath);
  await ensureDirExists(audioFolderPath);
  await ensureDirExists(transcriptFolderPath);

  // Process each script part in parallel
  const processedScript = await Promise.all(
    script.map(async (part, index) => {
      try {
        const { type } = part
        let data;
        
        if(type === "speech") {
          data = await speechSubPipeline(part, index, {audioFolderPath, transcriptFolderPath})
        } else if(type === "image") {
          data = await imageSubPipeline(part, index, {imageFolderPath})
        } else if(type === "pause") {
          data = {}
        } else {
          throw new Error(`Invalid type provided in index ${index}: ${type}`)
        }

        return {
          ...part,
          ...data,
        }
      } catch (error) {
        console.error(`Error processing part ${index}: ${error}`);
        return null;
      }
    })
  );

  return processedScript.filter(Boolean); // Remove null entries if errors occurred
};