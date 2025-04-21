import React from 'react'
import { AbsoluteFill, Folder } from 'remotion'
import Captions from '#remotion/components/Captions.jsx'
import AgentsImages from '#remotion/components/AgentsImages.jsx'
import Images from '#remotion/components/Images.jsx'
import BackgroundVideo from './components/BackgroundVideo.jsx'

function TikTokVideo({ videoTimeline }) {
  return (
    <AbsoluteFill>
      <Folder name="backgroundVideo">
        <AbsoluteFill className={`flex flex-col items-center justify-center h-1/2 top-0 bottom-1/2`}>
          <BackgroundVideo videoPath={videoTimeline.backgroundVideoPath} />
        </AbsoluteFill>
      </Folder>

      <Folder name="agentsImages">
        <AbsoluteFill className={`flex flex-col items-center justify-center h-1/2 top-1/2 bottom-0`}>
          <AgentsImages agentImages={videoTimeline.agentImages} />
        </AbsoluteFill>
      </Folder>

      <Folder name="images">
        <AbsoluteFill className={`flex flex-col items-center justify-center h-1/2 top-0 bottom-1/2`}>
          <Images agentImages={videoTimeline.images} />
        </AbsoluteFill>
      </Folder>

      <Folder name="captions">
        <AbsoluteFill className={`flex flex-col items-center justify-center`}>
          <Captions captions={videoTimeline.captions} />
        </AbsoluteFill>
      </Folder>
    </AbsoluteFill>
  )
}

export default TikTokVideo