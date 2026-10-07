import React from 'react';
import {Composition} from 'remotion';
import {DURATION, Video} from './Video';

const FORMATS = [
  {id: 'Landscape', width: 1920, height: 1080},
  {id: 'Square', width: 1080, height: 1080},
  {id: 'Vertical', width: 1080, height: 1920},
];

// Une composition par format, thème et langue : Landscape, LandscapeLight, LandscapeEn, LandscapeLightEn…
export const Root = () => (
  <>
    {FORMATS.flatMap(({id, width, height}) =>
      (['fr', 'en'] as const).flatMap((lang) =>
        (['dark', 'light'] as const).map((theme) => (
          <Composition
            key={id + theme + lang}
            id={`${id}${theme === 'light' ? 'Light' : ''}${lang === 'en' ? 'En' : ''}`}
            component={Video}
            defaultProps={{theme, lang}}
            durationInFrames={DURATION}
            fps={30}
            width={width}
            height={height}
          />
        )),
      ),
    )}
  </>
);
