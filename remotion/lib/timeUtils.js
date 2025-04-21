import { videoConfig } from "#remotion/videoConfig.js";

export const msToFps = (ms) => {
  return Math.floor(ms / 1000 * videoConfig.fps);
}