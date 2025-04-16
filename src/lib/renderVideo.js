import { __rootdirname } from "#src/dirnames";
import path from "path"

export const renderVideo = async (videoId, outputPath, inputProps) => {
  const entry = path.join(__rootdirname, "remotion/index.js");

  // Create a Webpack bundle of the Remotion project
  const bundleLocation = await bundle({
    entryPoint: entry,
    webpackOverride: (config) => config,
  });

  // Select the composition to render
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: videoId,
    inputProps,
  });

  // Render the video
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation: outputPath,
    inputProps: {},
  });

  return outputPath;
}