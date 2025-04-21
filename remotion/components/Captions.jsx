import { msToFps } from '#remotion/lib/timeUtils.js'
import React from 'react'
import { Sequence, useCurrentFrame } from 'remotion'
import { loadFont } from "@remotion/google-fonts/Montserrat";

function Captions({ captions, ...props }) {
  const { fontFamily } = loadFont("normal", {
    weights: ["900"],
    subsets: ["latin"],
  });
  
  const frame = useCurrentFrame();

  return captions.map(
    ((page, index) => (
      <Sequence from={msToFps(page.startTime)} durationInFrames={msToFps(page.duration)} key={index} {...props}>
        <div
          style={{
            fontFamily,
            fontWeight: 900,
            fontSize: 60,
            textAlign: "center",
            whiteSpace: "pre-wrap",
          }}
        >
          {page.tokens.map((token, i) => {
            const isHighlighted =
              frame >= msToFps(token.startTime) &&
              frame <= msToFps(token.endTime);

            return (
              <span
                key={i}
                className={`${isHighlighted ? "text-yellow-300" : "text-gray-50"}`}
                style={{
                  WebkitTextStroke: "1px #000",
                }}
              >
                {token.text}
              </span>
            );
          })}
        </div>
      </Sequence>
    ))
  )
}

export default Captions