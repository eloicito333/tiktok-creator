  // remotion/Root.tsx
  import React from 'react';
  import { Composition } from 'remotion';
  import { TikTokVideo } from '#remotion/TikTokVideo.jsx';

  export const RemotionRoot = ({title, videoTimeline}) => {
    return (
      <>
        <Composition
          id={title}
          durationInFrames={150}
          fps={30}
          width={1080}   
          height={1920}
          component={TikTokVideo}
          defaultProps={{
            videoTimeline,
          }}
        />
      </>
    );
  };
