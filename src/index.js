import express from "express"
import cors from "cors"
import { scriptSchema } from "#src/schema/script.js";
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import { __rootdirname, __srcdirname } from "#src/dirnames.js";
import path from "path";
import { processScript } from "#src/pipeline/mainPipeline.js";
import { ensureDirExists } from "#src/lib/fileUtils.js";
import morgan from "morgan"

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("combined"))

const storageFolderPath = path.join(__rootdirname, "storage")
await ensureDirExists(storageFolderPath);
const videosFolderPath = path.join(storageFolderPath, "videos")
await ensureDirExists(videosFolderPath);

app.post('/video/script', async (req, res) => {
  const { script } = req.body

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
})

// Serve OpenAPI JSON file
app.get("/openapi.json", (req, res) => {
  const openApiPath = path.join(__srcdirname, "openapi.json");
  res.sendFile(openApiPath);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});