import {generateSpeech} from "#src/pipeline/tts.js";
import path from 'path';
import { testsGenDirName } from "./testDirNames.js";

export const runTtsTest = async () => {
  // Test the TTS function
  const audioFilePath = path.join(testsGenDirName, "test-audio.wav");
  const text = "Españoles, no me he muerto aún!";
  const agentName = "francisco_franco";

  await generateSpeech(text, audioFilePath, agentName);
  console.log(`✅ TTS audio saved to ${audioFilePath}`);
}

await runTtsTest()