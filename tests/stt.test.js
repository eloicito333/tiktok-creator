import fs from "fs"
import path from "path"
import { testsGenDirName } from "./testDirNames.js"

const runSttTest = async () => {
  console.log("⏳ Running TTS test to generate the audio to transcribe...")
  await import("./tts.test.js")
  console.log("⌛️ TTS test run successfully")

  console.log("⏳ Running STT test to transcribe the audio...")
  const transcription = await generateTranscription(path.join(testsGenDirName, "test-audio.wav"), "es")
  fs.writeFileSync(path.join(testsGenDirName, "test-audio-transcription.json"), JSON.stringify(transcription, null, 2))
  console.log("✅ STT test run successfully")
}

await runSttTest()