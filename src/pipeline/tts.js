import fs from "fs";
import { __srcdirname } from "#src/dirnames.js"
import { agentsInfo, availableAgents } from "#src/lib/agentsInfo.js";
import { hf } from "#src/apiClients/hf.js";

const f5ttsEndpoint = hf.endpoint(process.env.F5TTS_API_URL)

// Function to Generate Speech
export async function generateSpeech(genText, outputFile, agent, { remove_silence = true , cross_fade_duration = 0.15, speed = 1} = {}) {
    if (!availableAgents.includes(agent)) {
        throw new Error(`Invalid agent name: ${agent || "None"}.\nAvailable agents are:\n${availableAgents.map(agent => `  - ${agent}\n`).join("")}`)
    }

    const {audioSamplePathName, referenceTextPathName} = agentsInfo[agent]

    try {
        console.log("Connecting to Spanish-F5 API...");

        // Load a reference audio file from the local system
        const refAudioBase64 = fs.readFileSync(audioSamplePathName).toString("base64");

        // Load reference text
        const refText = fs.readFileSync(referenceTextPathName, { encoding: "utf-8" })

        console.log(`⏳ Generating speech for ${agent}...`);

        // Call the API with the required parameters
        const response = await f5ttsEndpoint.query({
            ref_audio: refAudioBase64,
            ref_text: refText,
            gen_text: genText,
            remove_silence,
            cross_fade_duration,
            speed,
        })

        if(!response?.success) throw Error(`❌ Error generating speech: Bad response from API. Response: ${JSON.stringify(response, null, 2)}`)
        console.log(`✅ Speech generation form ${outputFile.split(".")[0]} completed successfully!`);


        // Save the audio file
        const audioBase64 = response.audio_base64;
        // Asegura que el directorio de salida existe antes de guardar el archivo
        const outputDir = outputFile.substring(0, outputFile.lastIndexOf("/"));
        if (outputDir && !fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        fs.writeFileSync(outputFile, Buffer.from(audioBase64, 'base64'));
        console.log(`💾 Speech saved as ${outputFile}`);
        return outputFile;
    } catch (error) {
        console.error(`❌ Error generating speech for ${outputFile.split(".")[0]}:`, error);

        if (error?.response) {
          const msg = await error.response.text();
          console.error("🔍 Response details:", msg);
        }

        return null
    }
}