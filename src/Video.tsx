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

// « G » de Google, aux couleurs de la marque
const GoogleIcon: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// Étoile pleine, dessin et jaune des avis Google
const Star: React.FC<{size: number}> = ({size}) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path fill="#FBBC04" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

// 5. Un témoignage réel, publié sur la fiche Google : la note, puis l'extrait. Les étoiles s'allument une à une
const Quote: React.FC<{c: Content}> = ({c}) => {
  const t = useTheme();
  const {landscape} = useLayout();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Plan duration={PLANS.quote} label={c.quoteLabel} fig={5}>
      <div style={{...rise(frame, 4, 16, 16), display: 'flex', alignItems: 'center', gap: 18, marginBottom: 40}}>
        <GoogleIcon size={44} />
        <div style={{display: 'flex', gap: 2}}>
          {Array.from({length: 5}, (_, i) => {
            const s = spring({frame: frame - 10 - i * 4, fps, config: {damping: 12}});
            return (
              <div key={i} style={{transform: `scale(${s})`}}>
                <Star size={44} />
              </div>
            );
          })}
        </div>
        <div style={{fontFamily: mono, fontSize: 30, color: t.strong, marginLeft: 6}}>{c.rating}</div>
      </div>
      <div style={{...rise(frame, 14, 22), fontSize: landscape ? 66 : 60, fontWeight: 500, letterSpacing: -1.5, lineHeight: 1.18, color: t.strong, textAlign: 'center', maxWidth: 1180}}>
        {c.quoteOpen}
        {c.quote}
        {c.quoteClose}
      </div>
      <div style={{...rise(frame, 34), display: 'flex', alignItems: 'center', gap: 20, marginTop: 44}}>
        <Img src={staticFile('lesclefsducredit-icon.png')} style={{width: 68, height: 68, borderRadius: 16, border: `2px solid ${t.line}`}} />
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
