import { msToFps } from '#remotion/lib/timeUtils'
import React from 'react'
import { Img, Sequence } from 'remotion'

function AgentsImages({ agentImages }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center aspect-[9/8]">
      {agentImages.map((image, index) => (
        <Sequence from={msToFps(image.startTime)} durationInFrames={msToFps(image.duration)} key={index}>
          <div
            className="absolute w-full h-full flex items-center justify-center"
            style={{
              opacity: 1,
              transition: 'opacity 0.5s ease-in-out',
              zIndex: 1,
            }}
          >
            <Img
              src={image.pathName}
              className="w-full h-full object-cover"
            />
          </div>
        </Sequence>
      ))}
    </div>
  )
}

export default AgentsImages