import { createTikTokStyleCaptions } from '@remotion/captions';
import { openAiWhisperApiToCaptions } from '@remotion/openai-whisper';
import { agentsInfo } from "#src/lib/agentsInfo.js";
import { getAudioDurationInSeconds } from '#src/lib/fileUtils.js';
import path from "path";
import { __rootdirname } from "#src/dirnames.js";

const AGENT_GAP_MS = 200; // 200ms gap between agent interventions

// Helper para convertir path absoluto a URL pública
function absolutePathToResourceUrl(absPath) {
  const resourcesDir = path.join(__rootdirname, "resources");
  const relPathToResources = path.relative(resourcesDir, absPath);
  // Si el archivo no está dentro de resources, devuelve el path original

  if (!relPathToResources.startsWith("..")) return `http://localhost:3000/resources/${relPathToResources.replace(/\\\\/g, "/")}`;

  const storageDir = path.join(__rootdirname, "storage");
  const relPathToStorage = path.relative(storageDir, absPath);
  if (!relPathToStorage.startsWith("..")) return `http://localhost:3000/storage/${relPathToStorage.replace(/\\\\/g, "/")}`;
  return absPath
}

export const generateVideoTimeline = async (processedScript, backgroundVideoPath) => {
  let currentTime = 0;
  const timeline = {
    images: [],
    audio: [],
    agentImages: [],
    captions: [],
    backgroundVideoPath: backgroundVideoPath ? absolutePathToResourceUrl(backgroundVideoPath) : backgroundVideoPath,
    totalDuration: 0,
  };

  // Process each part SYNCRONOUSLY
  for (let index = 0; index < processedScript.length; index++) {
    const part = processedScript[index];
    if (part.type === "speech") {
      // Get audio duration
      const audioDuration =
        (await getAudioDurationInSeconds(part.audioFilePath)) * 1000;

      console.log(audioDuration, part.audioFilePath);
      // Add audio to timeline
      timeline.audio.push({
        pathName: absolutePathToResourceUrl(part.audioFilePath),
        startTime: currentTime,
        duration: audioDuration,
      });

      // Add agent image to timeline
      timeline.agentImages.push({
        pathName: absolutePathToResourceUrl(agentsInfo[part.agent].images[part?.action || "default"]),
        startTime: currentTime,
        duration: audioDuration + AGENT_GAP_MS,
      });

      // Process transcription for captions and image timing
      const transcription = part.transcription;
      const {captions} = openAiWhisperApiToCaptions({transcription});

      const {pages} = createTikTokStyleCaptions({
        captions,
        combineTokensWithinMilliseconds: 1200,
      });

      // Add currentTime and push to captions array
      timeline.captions.push(...pages.map((page) => ({
        text: page.text,
        startTime: currentTime + page.startMs * 1000,
        duration: page.durationMs,
        tokens: page.tokens.map((token) => ({
          text: token.text,
          startTime: currentTime + token.fromMs,
          endTime: currentTime + token.toMs,
        })),
      })))

      // Update current time for next part
      currentTime += audioDuration + AGENT_GAP_MS;
    } else if (part.type === "image") {
      // Find the corresponding speech part that contains the target word
      let targetWordIndex = part.when.after_spoken_word;
      let imageStartTime = 0;

      // Search through previous speech parts to find the word
      for (let i = index - 1; i >= 0; i--) {
        const prevPart = processedScript[i];
        if (prevPart.type !== "speech") continue;

        // If the target word index is greater than the number of words in the previous speech part, set it to the last word index
        if (prevPart.transcription.words.length < targetWordIndex) {
          targetWordIndex = prevPart.transcription.words.length - 1;
        }
        // Get the word from the previous speech part
        const word = prevPart.transcription.words[targetWordIndex];

        // Get the start time of the word from the audio timeline
        const audioObj = timeline.audio.find((a) => a.pathName === prevPart.audioFilePath);
        if (!audioObj) {
          console.warn(`⚠️ No audio found in timeline for path: ${prevPart.audioFilePath}`);
          imageStartTime = currentTime; // Placeholder value
        } else {
          imageStartTime = audioObj.startTime + word.start * 1000;
        }
        break;
      }

      // Add image to timeline
      timeline.images.push({
        pathName: absolutePathToResourceUrl(part.imageFilePath),
        startTime: imageStartTime,
        duration: part.duration,
      });
    } else if (part.type === "pause") {
      // Increase duration of last agent image
      const lastAgentImage = timeline.agentImages?.[timeline.agentImages.length - 1];
      if (lastAgentImage) {
        lastAgentImage.duration += part.duration;
      }
      // Add pause duration to current time
      currentTime += part.duration;
    }
  }

  // Process image durations in reverse order
  let lastImageStartTime = currentTime; // Initialize with total duration
  for (let i = timeline.images.length - 1; i >= 0; i--) {
    const image = timeline.images[i];
    if (image.duration === null) {
      image.duration = lastImageStartTime - image.startTime;
    }
    lastImageStartTime = image.startTime;
  }

  // Set total duration to currentTime since images are only shown during spoken time
  timeline.totalDuration = currentTime;

  console.log("timeline: ", JSON.stringify(timeline, null, 2));
  return timeline;
};