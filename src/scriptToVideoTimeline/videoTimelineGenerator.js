import { getAudioDurationInSeconds } from 'remotion/media-utils';

const AGENT_GAP_MS = 200; // 200ms gap between agent interventions

export const generateVideoTimeline = async (processedScript) => {
  let currentTime = 0;
  const timeline = {
    images: [],
    audio: [],
    agentImages: [],
    captions: [],
    totalDuration: 0
  };

  // Process each part of the script in sequence
  processedScript.forEach(async (part, index) => {
    if (part.type === 'speech') {
      // Get audio duration
      const audioDuration = await getAudioDurationInSeconds(part.audioFilePath);
      
      // Add audio to timeline
      timeline.audio.push({
        pathName: part.audioFilePath,
        startTime: currentTime,
        duration: audioDuration
      });

      // Add agent image to timeline
      timeline.agentImages.push({
        pathName: agentsInfo[part.agent].images[part.action],
        startTime: currentTime,
        duration: audioDuration
      });

      // Process transcription for captions and image timing
      const transcription = part.transcription;
      
      // Add captions
      timeline.captions.push({
        text: transcription.text,
        startTime: currentTime,
        duration: audioDuration,
        words: transcription.words.map(word => ({
          text: word.word,
          startTime: currentTime + word.start,
          duration: word.end - word.start
        }))
      });

      // Update current time for next part
      currentTime += audioDuration + (AGENT_GAP_MS / 1000);

    } else if (part.type === 'image') {
      // Find the corresponding speech part that contains the target word
      const targetWordIndex = part.when.after_spoken_word;
      let imageStartTime = 0;
      
      // Search through previous speech parts to find the word
      for (let i = index - 1; i >= 0; i--) {
        const prevPart = processedScript[i];
        if (prevPart.type === 'speech') {
          // If the target word index is greater than the number of words in the previous speech part, set it to the last word index
          if(targetWordIndex < prevPart.transcription.words.length){
            targetWordIndex = prevPart.transcription.words.length - 1;
          }
          // Get the word from the previous speech part 
          const word = prevPart.transcription.words[targetWordIndex];
          // Get the start time of the word from the audio timeline
          imageStartTime = timeline.audio.find(a => a.pathName === prevPart.audioFilePath).startTime + word.start;
          break;
        }
      }

      // Add image to timeline
      timeline.images.push({
        pathName: part.filePath,
        startTime: imageStartTime,
        duration: part.duration ? part.duration / 1000 : null // Convert ms to seconds
      });

    } else if (part.type === 'pause') {
      // Add pause duration to current time
      currentTime += part.duration / 1000; // Convert ms to seconds
    }
  });

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

  return timeline;
};
