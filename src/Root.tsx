import {Composition} from 'remotion';
import {Main, DURATION} from './Main';

const FORMATS = [
  {id: 'Vertical', width: 1080, height: 1920},
  {id: 'Square', width: 1080, height: 1080},
  {id: 'Landscape', width: 1920, height: 1080},
];

export const Root = () => (
  <>
    {FORMATS.flatMap(({id, width, height}) =>
      (['dark', 'light'] as const).map((theme) => (
        <Composition
          key={id + theme}
          id={theme === 'dark' ? id : `${id}Light`}
          component={Main}
          defaultProps={{theme}}
          durationInFrames={DURATION}
          fps={30}
          width={width}
          height={height}
        />
      )),
    )}
  </>
);
