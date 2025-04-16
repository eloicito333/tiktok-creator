import { Router } from "express";
import { scriptSchema } from "#src/schema/script.js";
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import { processScript } from "#src/pipeline/mainPipeline.js";
import { ensureDirExists } from "#src/lib/fileUtils.js";
import { __rootdirname } from "#src/dirnames.js";
import { renderVideo } from "#src/lib/renderVideo";

const storageFolderPath = path.join(__rootdirname, "storage")
await ensureDirExists(storageFolderPath);
const videosFolderPath = path.join(storageFolderPath, "videos")
await ensureDirExists(videosFolderPath);

export const videoRouter = Router();

videoRouter.post("/script", async (req, res) => {
  const { title, script } = req.body

  if (!script) {
    return res.status(400).json({ error: 'Missing script property' });
  }

  const result = scriptSchema.safeParse(script);

  if (!result.success) {
      return res.status(400).json({
          error: result.error.format(),
      })
  }

  const videoId = uuidv4()

  // Define the folder path
  const folderPath = path.join(videosFolderPath, videoId)
  await ensureDirExists(folderPath)

  // Create the folder synchronously
  try {
    fs.mkdirSync(folderPath);
    console.log(`Folder created: ${folderPath}`);
  } catch (error) {
    console.error(`Error creating folder: ${error.message}`);
  }

  const scriptFilePath = path.join(folderPath, 'script.json');

  // Write the file synchronously
  fs.writeFileSync(scriptFilePath, JSON.stringify(script, null, 2));
  console.log(`File created: ${scriptFilePath}`);

  const processedScript = await processScript(script, folderPath)

  const videoRendersFolder = path.join(folderPath, "renders")
  await ensureDirExists(videoRendersFolder)
  const videoPath = path.join(videoRendersFolder, `${videoId}.mp4`)

  await renderVideo(videoId, videoPath, {
    videoId,
    title,
    processedScript,
  })

  res.status(200).json({
    videoId,
    title,
    processedScript,
  });
})