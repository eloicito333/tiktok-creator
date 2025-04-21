import React from "react";
import { Composition } from "remotion";
import TikTokVideo from "#remotion/TikTokVideo.jsx";
import { videoConfig } from "#remotion/videoConfig.js";
import { msToFps } from "#remotion/lib/timeUtils.js";
import '#remotion/index.css';

const calculateMetadata = ({ props }) => {
  return {
    durationInFrames: msToFps(props.videoTimeline.totalDuration),
    fps: videoConfig.fps,
    width: videoConfig.width,
    height: videoConfig.height,
    props,
  };
};

const RemotionRoot = ({ videoTimeline }) => {
  return (
    <>
      <Composition
        id="TikTokVideo"
        component={TikTokVideo}
        defaultProps={{ videoTimeline }}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};

export default RemotionRoot;