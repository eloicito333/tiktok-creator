import { Router } from "express";
import { scriptSchema } from "#src/schema/script.js";
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import { processScript } from "#src/pipeline/mainPipeline.js";
import { ensureDirExists } from "#src/lib/fileUtils.js";
import { __rootdirname } from "#src/dirnames.js";
import { renderVideo } from "#src/lib/renderVideo.js";
import { backgroundVideosInfo } from "#src/lib/backgroundVideosInfo.js";
import path from "path";
import { generateVideoTimeline } from "#src/scriptToVideoTimeline/videoTimelineGenerator.js";

const TIKTOK_VIDEO_COMPOSITION_ID = "TikTokVideo"

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getBackgroundVideo({ type, variation }) {
  const types = Object.keys(backgroundVideosInfo);
  const chosenType = type && backgroundVideosInfo[type] ? type : pickRandom(types);
  const variations = backgroundVideosInfo[chosenType];
  if (!variations || variations.length === 0) return null;
  if (variation && variations[variation]) {
    return variations[variation];
  }
  return pickRandom(variations);
}

function getBackgroundVideoPath(backgroundVideo) {
  if (backgroundVideo) {
    if (typeof backgroundVideo === "string") {
      return getBackgroundVideo({ type: backgroundVideo });
    } else if (backgroundVideo.type) {
      return getBackgroundVideo(backgroundVideo);
    }
  }
  return getBackgroundVideo({});
}

// Save the title in a metadata.json file
async function saveMetadata(folderPath, metadata) {
  await ensureDirExists(folderPath)
  const metadataPath = path.join(folderPath, 'metadata.json');
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

// Retrieve the title from metadata.json
function getMetadata(folderPath) {
  const metadataPath = path.join(folderPath, 'metadata.json');
  if (!fs.existsSync(metadataPath)) return {};
  return JSON.parse(fs.readFileSync(metadataPath));
}

const storageFolderPath = path.join(__rootdirname, "storage")
await ensureDirExists(storageFolderPath);
const videosFolderPath = path.join(storageFolderPath, "videos")
await ensureDirExists(videosFolderPath);

export const videoRouter = Router();

videoRouter.post("/script", async (req, res) => {
  const { title, script, backgroundVideo } = req.body

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
  const folderPath = path.join(videosFolderPath, videoId)
  await ensureDirExists(folderPath)
  const scriptFilePath = path.join(folderPath, 'script.json');
  fs.writeFileSync(scriptFilePath, JSON.stringify(script, null, 2));
  console.log(`File created: ${scriptFilePath}`);

  let processedScript;
  let videoTimeline;
  let bgVideoPath;
  try {
    // Procesamiento del script
    processedScript = await processScript(script, folderPath)
    fs.writeFileSync(path.join(folderPath, "processedScript.json"), JSON.stringify(processedScript, null, 2))
  } catch (err) {
    return res.status(500).json({
      error: 'Error during processing',
      videoId,
      place: 'processing',
      details: err.message || err.toString(),
    });
  }

  try {
    // Selección de backgroundVideo y creación del timeline
    bgVideoPath = getBackgroundVideoPath(backgroundVideo);
    videoTimeline = await generateVideoTimeline(processedScript, bgVideoPath)
    const videoTimelinesDir = path.join(folderPath, "videoTimelines")
    await ensureDirExists(videoTimelinesDir)
    fs.writeFileSync(path.join(videoTimelinesDir, "v1.json"), JSON.stringify(videoTimeline, null, 2))
  } catch (err) {
    res.status(500).json({
      error: 'Error during timeline creation',
      videoId,
      place: 'timeline',
      details: err.message || err.toString(),
    });
    throw err
  }

  try {
    // Renderizado del video
    const videoRendersFolder = path.join(folderPath, "renders")
    await ensureDirExists(videoRendersFolder)
    const videoPath = path.join(videoRendersFolder, `v1.mp4`)
    await renderVideo(TIKTOK_VIDEO_COMPOSITION_ID, videoPath, {
      videoId,
      title,
      videoTimeline,
      backgroundVideo: bgVideoPath,
    })
    // Guardar el título en metadata.json
    await saveMetadata(folderPath, { title });
  } catch (err) {
    res.status(500).json({
      error: 'Error during render',
      videoId,
      place: 'render',
      details: err.message || err.toString(),
    });
    throw err
  }

  res.status(200).json({
    videoId,
    title,
    videoTimeline,
    downloadVideoUrl: `/api/video/${videoId}`,
  });
})

videoRouter.post("/timeline/:id", async (req, res) => {
  const { id } = req.params;
  const { backgroundVideo } = req.body || {};
  const render = req.query.render !== "false";
  if (!id) return res.status(400).json({ error: "Missing id" });

  const videoFolder = path.join(videosFolderPath, id);
  const processedScriptPath = path.join(videoFolder, "processedScript.json");
  if (!fs.existsSync(processedScriptPath)) {
    return res.status(404).json({ error: "processedScript.json not found" });
  }
  const processedScript = JSON.parse(fs.readFileSync(processedScriptPath));

  const timelinesDir = path.join(videoFolder, "videoTimelines");
  await ensureDirExists(timelinesDir);
  const versions = fs.readdirSync(timelinesDir)
    .filter(f => f.startsWith("v") && f.endsWith(".json"))
    .map(f => parseInt(f.slice(1)));
  const nextVersion = versions.length ? Math.max(...versions) + 1 : 1;
  const timelineFile = path.join(timelinesDir, `v${nextVersion}.json`);

  const bgVideoPath = getBackgroundVideoPath(backgroundVideo);
  const videoTimeline = await generateVideoTimeline(processedScript, bgVideoPath);
  fs.writeFileSync(timelineFile, JSON.stringify(videoTimeline, null, 2));

  let renderPath = null;
  if (render) {
    const rendersDir = path.join(videoFolder, "renders");
    await ensureDirExists(rendersDir);
    renderPath = path.join(rendersDir, `v${nextVersion}.mp4`);
    await renderVideo(TIKTOK_VIDEO_COMPOSITION_ID, renderPath, {
      videoId: id,
      videoTimeline,
    });
  }

  // Retrieve the title from metadata.json
  const metadata = getMetadata(videoFolder);

  res.json({
    id,
    title: metadata.title,
    timelineVersion: nextVersion,
    timeline,
    ...(render ? { downloadVideoUrl: `/videos/${id}?version=${nextVersion}` } : {})
  });
});

videoRouter.post("/render/:id", async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: "Missing id" });
  const timelineVersion = req.query?.version;
  const { backgroundVideo } = req.body;
  if (!id) return res.status(400).json({ error: "Missing id" });
  const videoFolder = path.join(videosFolderPath, id);
  const timelinesDir = path.join(videoFolder, "videoTimelines");
  const versions = fs.readdirSync(timelinesDir)
    .filter(f => f.startsWith("v") && f.endsWith(".json"))
    .map(f => parseInt(f.slice(1)));
  const version = timelineVersion || (versions.length ? Math.max(...versions) : null);
  if (!version) return res.status(404).json({ error: "No timeline version found" });
  const timelineFile = path.join(timelinesDir, `v${version}.json`);

  if (!fs.existsSync(timelineFile)) return res.status(404).json({ error: "Timeline file not found" });
  const videoTimeline = JSON.parse(fs.readFileSync(timelineFile));
  const rendersDir = path.join(videoFolder, "renders");
  await ensureDirExists(rendersDir);
  const renderPath = path.join(rendersDir, `v${version}.mp4`);

  // Retrieve the title from metadata.json to use in the renderVideo function
  const metadata = getMetadata(videoFolder);
  await renderVideo(TIKTOK_VIDEO_COMPOSITION_ID, renderPath, {
    videoId: id,
    videoTimeline: {
      ...videoTimeline,
      ...(backgroundVideo ? { backgroundVideo: getBackgroundVideoPath(backgroundVideo) } : {}),
    },
    // Pass the title as a prop for rendering
    title: metadata.title,
  });

  res.json({
    id,
    timelineVersion: version,
    downloadVideoUrl: `/videos/${id}?version=${version}`,
  });
});

videoRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const version = req.query?.version

  const videoFolder = path.join(videosFolderPath, id);
  const rendersDir = path.join(videoFolder, "renders");

  if (!fs.existsSync(rendersDir)) return res.status(404).json({ error: "No renders found" });
  if (version) {
    const videoPath = path.join(rendersDir, `v${version}.mp4`);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ error: "Render not found" });
    return res.sendFile(videoPath);
  }

  const files = fs.readdirSync(rendersDir).filter(f => f.endsWith(".mp4"));
  if (!files.length) return res.status(404).json({ error: "No video found" });

  const latest = files
    .sort((a, b) => parseInt(b.match(/v(\d+)/)?.[1] || 0) - parseInt(a.match(/v(\d+)/)?.[1] || 0))[0];
  const videoPath = path.join(rendersDir, latest);
  return res.sendFile(videoPath);
});

videoRouter.get("/background-videos-info", (req, res) => {
  res.json(backgroundVideosInfo);
});