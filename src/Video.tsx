import React from 'react';
import {AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont as loadSans} from '@remotion/google-fonts/Geist';
import {loadFont as loadMono} from '@remotion/google-fonts/GeistMono';
import {loadFont as loadHand} from '@remotion/google-fonts/Caveat';

import {CONTENT, type Content, type Lang} from './content';
import {THEMES, ThemeContext, useTheme, type ThemeName} from './theme';
import {TsMark} from './TsMark';

const {fontFamily: sans} = loadSans('normal', {weights: ['400', '500', '600'], subsets: ['latin']});
const {fontFamily: mono} = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});
const {fontFamily: hand} = loadHand('normal', {weights: ['500'], subsets: ['latin']});

// Chronologie, en images (30 images par seconde). Changer une durée décale les plans suivants.
const PLANS = {intro: 90, hello: 120, services: 180, work: 240, quote: 150, promises: 180, cta: 120};
export const DURATION = Object.values(PLANS).reduce((sum, value) => sum + value, 0);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const easeOut = Easing.out(Easing.cubic);

// Apparition : fondu + légère montée, à partir de l'image `start`
const rise = (frame: number, start: number, duration = 18, distance = 28): React.CSSProperties => {
  const p = interpolate(frame, [start, start + duration], [0, 1], {...clamp, easing: easeOut});
  return {opacity: p, transform: `translateY(${(1 - p) * distance}px)`};
};

// Mise en page selon le format. Sur le site, la vidéo 16:9 est recadrée en 21:9 sur grand écran :
// en paysage, rien d'important hors de la bande centrale (marge haute et basse de 150 px).
const useLayout = () => {
  const {width, height} = useVideoConfig();
  const landscape = width > height;
  const vertical = height > width;
  return {
    width,
    height,
    landscape,
    vertical,
    column: landscape ? 1400 : 960,
    band: landscape ? 150 : vertical ? 230 : 96,
    pad: landscape ? 64 : 48,
  };
};

// Fond commun à tous les plans : la colonne bordée et les filets du site, fixes (la vidéo tourne en boucle)
const Grid: React.FC = () => {
  const t = useTheme();
  const {width, height, column, band} = useLayout();
  const side = (width - column) / 2;
  const vertical: React.CSSProperties = {position: 'absolute', top: 0, width: 2, height, background: t.line};
  const horizontal: React.CSSProperties = {position: 'absolute', left: 0, height: 2, width, background: t.line};
  return (
    <AbsoluteFill style={{background: t.bg}}>
      {/* Bandes hachurées en haut et en bas, comme les séparateurs du site */}
      {[0, height - band].map((top) => (
        <div
          key={top}
          style={{
            position: 'absolute',
            top,
            left: 0,
            width,
            height: band,
            opacity: 0.6,
            backgroundImage: `repeating-linear-gradient(315deg, ${t.line} 0, ${t.line} 2px, transparent 0, transparent 50%)`,
            backgroundSize: '14px 14px',
          }}
        />
      ))}
      <div style={{...vertical, left: side}} />
      <div style={{...vertical, left: width - side - 2}} />
      <div style={{...horizontal, top: band}} />
      <div style={{...horizontal, top: height - band - 2}} />
    </AbsoluteFill>
  );
};

// Un plan : fondu d'entrée et de sortie, sur-titre en haut de la colonne, « Fig. n. » en bas
// `fadeIn={false}` pour le premier plan : la toute première image doit déjà montrer le nom
const Plan: React.FC<{duration: number; label?: string; fig: number; fadeIn?: boolean; children: React.ReactNode}> = ({duration, label, fig, fadeIn = true, children}) => {
  const t = useTheme();
  const {width, column, band, pad} = useLayout();
  const frame = useCurrentFrame();
  const opacity = Math.min(fadeIn ? interpolate(frame, [0, 10], [0, 1], clamp) : 1, interpolate(frame, [duration - 8, duration], [1, 0], clamp));
  return (
    <AbsoluteFill style={{opacity, fontFamily: sans, color: t.fg}}>
      <div style={{position: 'absolute', top: band, bottom: band, left: (width - column) / 2, width: column, padding: pad, display: 'flex', flexDirection: 'column'}}>
        <div style={{fontFamily: mono, fontSize: 24, fontWeight: 500, letterSpacing: 3, textTransform: 'uppercase', color: t.primary, minHeight: 32}}>{label}</div>
        <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 0}}>{children}</div>
        <div style={{fontSize: 24, letterSpacing: 1, color: t.dim, textAlign: 'right'}}>Fig. {fig}.</div>
      </div>
    </AbsoluteFill>
  );
};

// Logo du site : un T blanc sur carré noir (inversé en thème clair pour rester lisible)
const Logo: React.FC<{size: number}> = ({size}) => {
  const t = useTheme();
  return (
    <div style={{width: size, height: size, borderRadius: size * 0.2, background: t.strong, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: sans, fontWeight: 600, fontSize: size * 0.68, lineHeight: 1}}>
      T
    </div>
  );
};

// Flèche tracée à la main (même tracé que sur le site), qui se dessine à partir de `start`
const Arrow: React.FC<{start: number; size?: number; style?: React.CSSProperties}> = ({start, size = 72, style}) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [start, start + 14], [1, 0], {...clamp, easing: easeOut});
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M34 4c1 15-5 26-21 30" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
      <path d="m22 37-9-3 7.5-8" pathLength={1} strokeDasharray={1} strokeDashoffset={draw} />
    </svg>
  );
};

// 1. Le nom est là dès la première image (elle sert d'image d'attente sur le site), le monogramme se dessine au-dessus
const Intro: React.FC = () => {
  const t = useTheme();
  const {landscape} = useLayout();
  return (
    <Plan duration={PLANS.intro} fig={1} fadeIn={false}>
      <TsMark width={landscape ? 900 : 860} />
      <div style={{display: 'flex', alignItems: 'center', gap: 26, marginTop: 40}}>
        <Logo size={96} />
        <span style={{fontSize: 92, fontWeight: 600, letterSpacing: -3, color: t.strong}}>TeeboStudio</span>
      </div>
    </Plan>
  );
};

// 2. « Bonjour » manuscrit, puis la présentation
const Hello: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  // Le mot se découvre de gauche à droite, comme s'il s'écrivait
  const written = interpolate(frame, [6, 34], [0, 100], {...clamp, easing: Easing.inOut(Easing.quad)});
  return (
    <Plan duration={PLANS.hello} fig={2}>
      <div style={{fontFamily: hand, fontSize: 190, lineHeight: 1, color: t.strong, clipPath: `inset(-20% ${100 - written}% -20% 0)`}}>{c.hello}</div>
      <div style={{...rise(frame, 34), fontSize: 92, fontWeight: 500, letterSpacing: -3, color: t.strong, marginTop: 26, textAlign: 'center'}}>{c.name}</div>
      <div style={{...rise(frame, 46), fontSize: 42, color: t.muted, marginTop: 14, textAlign: 'center'}}>{c.role}</div>
    </Plan>
  );
};

// 3. Les quatre expertises et leur prix de départ
const Services: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Plan duration={PLANS.services} label={c.servicesLabel} fig={3}>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%'}}>
        {c.services.map((service, index) => {
          const pop = spring({frame: frame - 10 - index * 22, fps, config: {damping: 200}});
          return (
            <div
              key={service.name}
              style={{
                opacity: pop,
                transform: `translateY(${(1 - pop) * 36}px)`,
                background: t.panel,
                border: `2px solid ${t.line}`,
                borderRadius: 22,
                padding: '34px 36px',
              }}
            >
              <div style={{fontFamily: mono, fontSize: 22, color: t.dim}}>{String(index + 1).padStart(2, '0')}</div>
              <div style={{fontSize: 50, fontWeight: 500, letterSpacing: -1.5, color: t.strong, marginTop: 14, lineHeight: 1.1}}>{service.name}</div>
              <div style={{fontFamily: mono, fontSize: 30, color: t.muted, marginTop: 18}}>
                {c.from} <span style={{color: t.primary, fontWeight: 500}}>{service.price}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Plan>
  );
};

// 4. Quatre réalisations, chacune avec sa note manuscrite
const Work: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const {landscape, vertical} = useLayout();
  const frame = useCurrentFrame();
  const each = PLANS.work / c.projects.length;
  const index = Math.min(c.projects.length - 1, Math.floor(frame / each));
  const local = frame - index * each;
  const project = c.projects[index];
  // Chaque projet entre par la droite et s'efface avant le suivant
  const enter = interpolate(local, [0, 14], [0, 1], {...clamp, easing: easeOut});
  const leave = index === c.projects.length - 1 ? 1 : interpolate(local, [each - 8, each], [1, 0], clamp);
  // En carré, la place manque en hauteur : capture et textes plus petits pour ne pas recouvrir le sur-titre
  const compact = !landscape && !vertical;
  const imageWidth = landscape ? 800 : compact ? 640 : 864;

  return (
    <Plan duration={PLANS.work} label={c.workLabel} fig={4}>
      <div style={{opacity: enter * leave, display: 'flex', flexDirection: landscape ? 'row' : 'column', alignItems: 'center', gap: landscape ? 56 : compact ? 22 : 40, width: '100%'}}>
        <div
          style={{
            width: imageWidth,
            height: imageWidth * 0.625,
            flexShrink: 0,
            borderRadius: 22,
            overflow: 'hidden',
            border: `2px solid ${t.line}`,
            boxShadow: `0 30px 70px ${t.shadow}`,
            transform: `translateX(${(1 - enter) * 60}px)`,
          }}
        >
          <Img src={staticFile(project.image)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top'}} />
        </div>
        <div style={{flex: 1, width: landscape ? undefined : '100%'}}>
          <div style={{fontFamily: mono, fontSize: 24, color: t.dim}}>
            {String(index + 1).padStart(2, '0')} / {String(c.projects.length).padStart(2, '0')}
          </div>
          <div style={{fontSize: compact ? 54 : 64, fontWeight: 500, letterSpacing: -2, color: t.strong, marginTop: compact ? 6 : 10, lineHeight: 1.05}}>{project.title}</div>
          <div style={{fontFamily: mono, fontSize: 24, color: t.muted, marginTop: compact ? 10 : 14}}>{project.kind}</div>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: compact ? 18 : 30, color: t.primary}}>
            {/* La flèche désigne la capture : à gauche en paysage, au-dessus sinon */}
            <Arrow start={16} style={{transform: landscape ? 'rotate(18deg)' : 'scaleY(-1) rotate(-8deg)', marginTop: -6}} />
            <div style={{...rise(local, 22, 14, 12), fontFamily: hand, fontSize: compact ? 56 : 66, lineHeight: 0.95, transformOrigin: 'left', rotate: '-4deg'}}>
              {project.note.map((line) => (
                <div key={line}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Plan>
  );
};

// 5. Un témoignage réel
const Quote: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const {landscape} = useLayout();
  const frame = useCurrentFrame();
  return (
    <Plan duration={PLANS.quote} label={c.quoteLabel} fig={5}>
      <div style={{...rise(frame, 8, 22), fontSize: landscape ? 66 : 60, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.18, color: t.strong, textAlign: 'center', maxWidth: 1180}}>
        {c.quoteOpen}
        {c.quote}
        {c.quoteClose}
      </div>
      <div style={{...rise(frame, 30), display: 'flex', alignItems: 'center', gap: 20, marginTop: 44}}>
        <Img src={staticFile('cabinetdelcros-icon.png')} style={{width: 68, height: 68, borderRadius: 16, border: `2px solid ${t.line}`}} />
        <div>
          <div style={{fontSize: 34, fontWeight: 500, color: t.strong}}>{c.quoteAuthor}</div>
          <div style={{fontFamily: mono, fontSize: 22, color: t.muted, marginTop: 4}}>{c.quoteRole}</div>
        </div>
      </div>
    </Plan>
  );
};

// 6. Trois engagements, puis la mention du programme Claude Startups
const Promises: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  return (
    <Plan duration={PLANS.promises} label={c.promisesLabel} fig={6}>
      <div style={{width: '100%'}}>
        {c.promises.map((promise, index) => (
          <div
            key={promise}
            style={{...rise(frame, 10 + index * 26), display: 'flex', alignItems: 'baseline', gap: 34, padding: '30px 0', borderTop: index ? `2px solid ${t.line}` : undefined}}
          >
            <span style={{fontFamily: mono, fontSize: 30, color: t.primary}}>{String(index + 1).padStart(2, '0')}</span>
            <span style={{fontSize: 62, fontWeight: 500, letterSpacing: -2, color: t.strong, lineHeight: 1.1}}>{promise}</span>
          </div>
        ))}
        <div style={{...rise(frame, 100), display: 'flex', alignItems: 'center', gap: 16, marginTop: 34, fontFamily: mono, fontSize: 26, color: t.muted}}>
          <span style={{width: 14, height: 14, borderRadius: 7, background: t.primary}} />
          {c.member}
        </div>
      </div>
    </Plan>
  );
};

// 7. L'appel à l'action
const Cta: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: frame - 8, fps, config: {damping: 14, stiffness: 120}});
  return (
    <Plan duration={PLANS.cta} fig={7}>
      <div
        style={{
          transform: `scale(${0.8 + pop * 0.2})`,
          opacity: Math.min(1, pop * 1.4),
          background: t.primary,
          color: t.onPrimary,
          fontSize: 58,
          fontWeight: 500,
          letterSpacing: -1,
          padding: '30px 54px',
          borderRadius: 20,
          textAlign: 'center',
        }}
      >
        {c.cta}
      </div>
      <div style={{...rise(frame, 30), display: 'flex', alignItems: 'center', gap: 20, marginTop: 52}}>
        <Logo size={60} />
        <span style={{fontFamily: mono, fontSize: 46, color: t.strong}}>teebostudio.fr</span>
      </div>
    </Plan>
  );
};

export const Video: React.FC<{theme: ThemeName; lang: Lang}> = ({theme, lang}) => {
  const c = CONTENT[lang];
  const plans: [keyof typeof PLANS, React.ReactNode][] = [
    ['intro', <Intro />],
    ['hello', <Hello c={c} />],
    ['services', <Services c={c} />],
    ['work', <Work c={c} />],
    ['quote', <Quote c={c} />],
    ['promises', <Promises c={c} />],
    ['cta', <Cta c={c} />],
  ];
  let from = 0;
  return (
    <ThemeContext.Provider value={THEMES[theme]}>
      <Grid />
      {plans.map(([name, node]) => {
        const start = from;
        from += PLANS[name];
        return (
          <Sequence key={name} from={start} durationInFrames={PLANS[name]} name={name}>
            {node}
          </Sequence>
        );
      })}
    </ThemeContext.Provider>
  );
};
