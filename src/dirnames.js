import path from "path"
import { fileURLToPath } from "url"

// Fix for __dirname in ES modules
export const __srcdirname = import.meta.dirname
export const __rootdirname = path.join(__srcdirname, "..");