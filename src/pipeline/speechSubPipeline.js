import { generateTranscription } from "./stt.js";
import { generateSpeech } from "./tts.js";
import path from "path";

export const speechSubPipeline = async (part, index, {audioFolderPath, transcriptFolderPath}) => {
    const { text, agent, lang } = part
    const audioFilePath = path.join(audioFolderPath, `${index}_${agent}_audio.wav`);
    const transcriptFilePath = path.join(transcriptFolderPath, `${index}_${agent}_transcript.json`);

    // Generate audio
    await generateSpeech(text, audioFilePath, agent);

    // Get transcription
    const transcription = await generateTranscription(audioFilePath, lang);

    // Save transcription to file
    fs.writeFile(transcriptFilePath, JSON.stringify(transcription, null, 2));

    return {
        audioFilePath,
        transcription,
        ...(!part?.action && {action: agentsDefaultAction})
    };
}