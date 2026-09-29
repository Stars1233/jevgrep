import React from 'react';
import { Composition } from 'remotion';
import { Film, KeyArt } from './Film';
import timing from './timing.json';
export const Root = () => (
  <>
    <Composition
      id="Release"
      component={Film}
      width={1920}
      height={1080}
      fps={timing.fps}
      durationInFrames={Math.round((timing.duration + timing.preroll) * timing.fps)}
    />
    <Composition
      id="KeyArt"
      component={KeyArt}
      width={1920}
      height={1080}
      fps={60}
      durationInFrames={1}
    />
  </>
);
