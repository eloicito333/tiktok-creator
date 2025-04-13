import fs from "fs";
import { openai } from "#src/apiClients/openai.js"

export const generateTranscription = async (audioFilePath, lang = "es") => {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: "whisper-1",
    language: lang,
    timestamp_granularities: "word",
    response_format: "verbose_json"
  });
  
  return transcription
}