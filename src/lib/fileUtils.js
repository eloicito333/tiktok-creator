import fs from 'fs/promises';
import { parseMedia } from '@remotion/media-parser';
import { nodeReader }  from '@remotion/media-parser/node';

export const ensureDirExists = async (folderName) => {
  try {
    await fs.mkdir(folderName, { recursive: true });
  } catch (err) {
    // If the error is not related to the directory already existing, throw it
    if (err.code !== 'EEXIST') {
      throw new Error(`Error creating directory "${folderName}":`, err);
    }
    // Otherwise, do nothing
  }
};

export const getAudioDurationInSeconds = async (filePath) => {
  const {durationInSeconds} = await parseMedia({
    src: filePath,             // '/path/to/audio.wav' or './voice.mp3'
    fields: {durationInSeconds: true},
    reader: nodeReader,         // <-- tells Remotion to read from disk
    acknowledgeRemotionLicense: true,
  });

  return durationInSeconds;
};