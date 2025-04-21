import { generateTranscription } from "./stt.js";
import { generateSpeech } from "./tts.js";
import path from "path";

export const speechSubPipeline = async (
  part,
  index,
  { audioFolderPath }
) => {
  const { text, agent, lang } = part;
  const audioFilePath = path.join(
    audioFolderPath,
    `${index}_${agent}_audio.wav`
  );

  // Generate audio
  await generateSpeech(text, audioFilePath, agent);

  // Get transcription
  const transcription = await generateTranscription(audioFilePath, lang);

  return {
    audioFilePath,
    transcription,
  };
};
