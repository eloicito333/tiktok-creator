import {generateSpeech} from "./tts.js";
import {generateTranscription} from "./stt.js"; // Assuming you have a function to get transcriptions
import fs from "fs";
import path from "path";
import { ensureDirExists } from "#src/lib/fileUtils.js";

export const generateAudioAndCaptions = async (script, folderPath) => {
  const audioFolderPath = path.join(folderPath, "audios")
  const transcriptFolderPath = path.join(folderPath, "transcriptions")

  // Ensure the folder exists
  await ensureDirExists(folderPath);
  await ensureDirExists(audioFolderPath);
  await ensureDirExists(transcriptFolderPath);

  // Process each script part in parallel
  const transcriptionFiles = await Promise.all(
    script.map(async (part, index) => {
      const { text, agent, lang } = part
      const audioFilePath = path.join(audioFolderPath, `${index}_${agent}_audio.wav`);
      const transcriptFilePath = path.join(transcriptFolderPath, `${index}_${index}_transcript.json`);

      try {
        // Generate audio
        await generateSpeech(text, audioFilePath, agent);

        // Get transcription
        const transcription = await generateTranscription(audioFilePath, lang);

        // Save transcription to file
        fs.writeFileSync(transcriptFilePath, JSON.stringify(transcription, null, 2));

        return transcriptFilePath;
      } catch (error) {
        console.error(`Error processing part ${index}: ${error}`);
        return null;
      }
    })
  );

  return transcriptionFiles.filter(Boolean); // Remove null entries if errors occurred
};