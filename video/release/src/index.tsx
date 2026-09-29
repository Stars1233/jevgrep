import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { Film, Poster } from './Film';
import { FPS, PRE, DURATION } from './timeline';
registerRoot(() => (
  <>
    <Composition
      id="Release"
      component={Film}
      durationInFrames={Math.round((PRE + DURATION) * FPS)}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Poster"
      component={Poster}
      durationInFrames={1}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
));
