import {generateSpeech} from "#src/pipeline/tts.js";
import { ensureDirExists } from "#src/lib/fileUtils.js";

ensureDirExists("./test-gen")
generateSpeech(
  `Españoles, no me he muerto aún!`, // gen text
  "./test-gen/test-audio.wav", // output_file
  "francisco_franco" // agent name
)