import path from "path";
import fs from "fs";
import { __rootdirname } from "#src/dirnames.js";

// Extensiones de video comunes
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".avi", ".mkv"]; // puedes añadir más si lo necesitas

// Este objeto se genera al inicio y se exporta
export const backgroundVideosInfo = (() => {
  const backgroundVideosDir = path.join(__rootdirname, "resources", "backgroundVideos");
  const info = {};
  if (!fs.existsSync(backgroundVideosDir)) return info;
  const types = fs.readdirSync(backgroundVideosDir);
  for (const type of types) {
    const typeDir = path.join(backgroundVideosDir, type);
    if (!fs.statSync(typeDir).isDirectory()) continue;
    const files = fs.readdirSync(typeDir);
    const videoFiles = files.filter(f => VIDEO_EXTENSIONS.includes(path.extname(f).toLowerCase()));
    info[type] = videoFiles.map(f => path.join(typeDir, f));
  }
  return info;
})();
