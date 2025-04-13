import path from "path"
import { fileURLToPath } from "url"

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
export const __srcdirname = path.dirname(__filename)
export const __rootdirname = path.join(path.dirname(__filename), "..");