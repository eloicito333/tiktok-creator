import { msToFps } from '#remotion/lib/timeUtils'
import React from 'react'
import { Sequence, Video } from 'remotion'

function BackgroundVideo({ fromInSec=0, durationInSec=Infinity, videoPath, loop=true, volume=0, autoPlay=true, className, ...props } = {}) {
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center aspect-[9/8] ${className}`} {...props}>
      <Sequence from={msToFps(fromInSec)} durationInFrames={msToFps(durationInSec)}>
        <div
          className="absolute w-full h-full flex items-center justify-center"
        >
          <Video
            src={videoPath}
            className="w-full h-full object-cover"
            loop={loop}
            volume={volume}
            autoPlay={autoPlay}
            muted={volume === 0}
          />
        </div>
      </Sequence>
    </div>
  )
}

export default BackgroundVideo