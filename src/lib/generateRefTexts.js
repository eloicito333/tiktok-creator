import fs from "fs";
import { hf } from "#src/apiClients/hf.js";

/**
 * Transcribes audio files to generate ref_text
 * @param {string[]} audioFiles - Array of audio filenames (with full paths)
 * @returns {Promise<Object>} - Object mapping filenames to transcriptions
 */
export async function generateRefTexts(audioFiles) {
    let transcriptions = {};

    for (const audioFile of audioFiles) {
        try {
            console.log(`Transcribing: ${audioFile}`);

            // Call Hugging Face Whisper API for transcription
            const result = await hf.automaticSpeechRecognition({
                model: "openai/whisper-large-v3",  // Choose an appropriate Whisper model
                data: fs.readFileSync(audioFile),
            });

            if (!result || !result.text) {
                throw new Error(`Failed to transcribe ${audioFile}`);
            }

            transcriptions[audioFile] = result.text;
            console.log(`✅ Transcription: ${result.text}`);
        } catch (error) {
            console.error(`❌ Error processing ${audioFile}:`, error);
            transcriptions[audioFile] = null;
        }
    }

    return transcriptions;
}