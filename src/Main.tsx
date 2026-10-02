import React, {createContext, useContext} from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  Sequence,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Geist';
import {loadFont as loadMono} from '@remotion/google-fonts/GeistMono';

const {fontFamily} = loadFont('normal', {weights: ['400', '500', '600', '700', '800'], subsets: ['latin']});
const {fontFamily: mono} = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});

// Timeline (30 ips)
const S = {
  hook: {from: 0, dur: 85},
  brand: {from: 80, dur: 78},
  build: {from: 155, dur: 138},
  work: {from: 290, dur: 138},
  offer: {from: 425, dur: 93},
  cta: {from: 515, dur: 100},
};
export const DURATION = S.cta.from + S.cta.dur;

// Couleurs calées sur les tokens du site (globals.css, thème tweakcn) : sombre et clair
const DARK = {
  bg: '#262624',
  fg: '#faf9f5',
  muted: '#b7b5a9',
  dim: '#77756c',
  emerald: '#10b981',
  emeraldL: '#34d399',
  emeraldD: '#047857',
  cyan: '#22d3ee',
  panel: '#30302e',
  border: 'rgba(250,249,245,0.1)',
  bar: 'rgba(250,249,245,0.14)',
  bar2: 'rgba(250,249,245,0.06)',
  logoBg: '#faf9f5',
  logoFg: '#262624',
  shadow: 'rgba(0,0,0,0.45)',
  vignette: 'rgba(0,0,0,0.5)',
  glow: 0.25,
  grain: 0.07,
  warn: '#fbbf24',
  bad: '#f87171',
};
const LIGHT: typeof DARK = {
  bg: '#faf9f5',
  fg: '#3d3929',
  muted: '#6a6964',
  dim: '#a3a29a',
  emerald: '#10b981',
  emeraldL: '#00704e',
  emeraldD: '#047857',
  cyan: '#007595',
  panel: '#ffffff',
  border: 'rgba(61,57,41,0.13)',
  bar: 'rgba(61,57,41,0.14)',
  bar2: 'rgba(61,57,41,0.06)',
  logoBg: '#3d3929',
  logoFg: '#faf9f5',
  shadow: 'rgba(61,57,41,0.14)',
  vignette: 'rgba(61,57,41,0.06)',
  glow: 0.16,
  grain: 0.04,
  warn: '#b45309',
  bad: '#b91c1c',
};
type Theme = typeof DARK;
const ThemeCtx = createContext<Theme>(DARK);
const useC = () => useContext(ThemeCtx);
const hexA = (a: number) => Math.round(a * 255).toString(16).padStart(2, '0');

const EASE = Easing.bezier(0.16, 1, 0.3, 1);
const r = (f: number, a: number, b: number, from = 0, to = 1, easing = EASE) =>
  interpolate(f, [a, b], [from, to], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

const useLayout = () => {
  const {width, height, fps} = useVideoConfig();
  const u = Math.min(width, height) / 1080;
  return {width, height, fps, u, portrait: height > width * 1.2};
};

const exitStyle = (f: number, start: number, end: number): React.CSSProperties => ({
  opacity: r(f, start, end, 1, 0, Easing.in(Easing.cubic)),
  transform: `scale(${r(f, start, end, 1, 1.06, Easing.in(Easing.cubic))})`,
  filter: `blur(${r(f, start, end, 0, 14, Easing.in(Easing.cubic))}px)`,
});

const gradientText = (a: string, b: string): React.CSSProperties => ({
  backgroundImage: `linear-gradient(100deg, ${a}, ${b})`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
});

// Texte qui monte depuis un masque
const Rise: React.FC<{delay?: number; children: React.ReactNode; style?: React.CSSProperties}> = ({
  delay = 0,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  const p = r(f, delay, delay + 16);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.12em', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * 110}%)`}}>{children}</div>
    </div>
  );
};

const Stagger: React.FC<{text: string; delay: number; step?: number; colors?: [string, string]}> = ({
  text,
  delay,
  step = 1.4,
  colors,
}) => {
  const f = useCurrentFrame();
  const {u} = useLayout();
  return (
    <span style={{display: 'inline-flex'}}>
      {text.split('').map((ch, i) => {
        const p = r(f, delay + i * step, delay + i * step + 14);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              color: colors ? interpolateColors(i, [0, text.length - 1], colors) : undefined,
              opacity: p,
              transform: `translateY(${(1 - p) * 50 * u}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </span>
  );
};

const Logo: React.FC<{size: number; style?: React.CSSProperties}> = ({size, style}) => {
  const C = useC();
  return (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.22,
      background: C.logoBg,
      color: C.logoFg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 800,
      fontSize: size * 0.7,
      lineHeight: 1,
      ...style,
    }}
  >
    T
  </div>
  );
};

/* ---------- Fond persistant ---------- */
const Background = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {width, height, u} = useLayout();
  const cell = 90 * u;
  const glow = 1000 * u;
  const mask = 'radial-gradient(ellipse at center, black 25%, transparent 75%)';
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.border} 1px, transparent 1px), linear-gradient(90deg, ${C.border} 1px, transparent 1px)`,
          backgroundSize: `${cell}px ${cell}px`,
          backgroundPosition: `${width / 2}px ${(f * 0.8 * u) % cell}px`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: glow,
          height: glow,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.emerald}${hexA(C.glow)}, transparent 62%)`,
          left: width * 0.25 + Math.sin(f / 45) * 160 * u - glow / 2,
          top: height * 0.28 + Math.cos(f / 55) * 120 * u - glow / 2,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: glow * 0.9,
          height: glow * 0.9,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${C.cyan}${hexA(C.glow * 0.6)}, transparent 62%)`,
          left: width * 0.78 + Math.cos(f / 50) * 140 * u - glow * 0.45,
          top: height * 0.75 + Math.sin(f / 40) * 120 * u - glow * 0.45,
        }}
      />
      <AbsoluteFill style={{background: `radial-gradient(ellipse at center, transparent 55%, ${C.vignette})`}} />
      <svg width={width} height={height} style={{position: 'absolute', opacity: C.grain, mixBlendMode: 'overlay'}}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 10} />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

/* ---------- 1. Accroche ---------- */
const Hook = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {u} = useLayout();
  const phrases = ['est lent ?', 'est invisible ?', 'ne convertit pas ?'];
  const size = 96 * u;
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', ...exitStyle(f, 74, 85)}}>
      <Rise>
        <div style={{fontSize: 128 * u, fontWeight: 800, letterSpacing: '-0.045em', textAlign: 'center'}}>Votre site</div>
      </Rise>
      <div style={{position: 'relative', height: size * 1.25, width: '100%', overflow: 'hidden'}}>
        {phrases.map((p, i) => {
          const s = 10 + i * 20;
          const last = i === phrases.length - 1;
          const y = f < s + 17 || last ? r(f, s, s + 9, 110, 0) : r(f, s + 17, s + 22, 0, -110, Easing.in(Easing.cubic));
          const strike = r(f, s + 8, s + 15, 0, 1, Easing.inOut(Easing.cubic));
          return (
            <div
              key={p}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transform: `translateY(${y}%)`,
              }}
            >
              <span style={{position: 'relative', fontSize: size, fontWeight: 700, letterSpacing: '-0.04em', color: C.muted}}>
                {p}
                <span
                  style={{
                    position: 'absolute',
                    left: -8 * u,
                    top: '54%',
                    height: 10 * u,
                    width: `calc(${strike * 100}% + ${16 * u * strike}px)`,
                    background: C.emerald,
                    borderRadius: 6 * u,
                    boxShadow: `0 0 ${30 * u}px ${C.emerald}`,
                  }}
                />
              </span>
            </div>
          );
        })}
      </div>
      <div style={{marginTop: 40 * u, opacity: r(f, 62, 70), transform: `translateY(${r(f, 62, 72, 30, 0) * u}px)`}}>
        <span style={{fontSize: 64 * u, fontWeight: 700, letterSpacing: '-0.03em', ...gradientText(C.emeraldL, C.cyan)}}>
          On règle ça.
        </span>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 2. Marque ---------- */
const Brand = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {u, fps, width, height} = useLayout();
  const diag = Math.hypot(width, height) / 2;
  const r1 = r(f, 0, 16, 0, diag, Easing.inOut(Easing.cubic));
  const r2 = r(f, 9, 26, 0, diag + 2, Easing.inOut(Easing.cubic));
  const hole = `radial-gradient(circle at center, transparent ${r2}px, black ${r2 + 1}px)`;
  const pop = spring({frame: f - 16, fps, config: {damping: 12, stiffness: 140}});
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(135deg, ${C.emerald}, ${C.cyan})`,
          clipPath: `circle(${r1}px at 50% 50%)`,
          maskImage: hole,
          WebkitMaskImage: hole,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 40 * u, ...exitStyle(f, 66, 78)}}>
        <Logo
          size={190 * u}
          style={{
            transform: `scale(${pop}) rotate(${(1 - pop) * -40}deg)`,
            boxShadow: `0 0 ${120 * u}px ${C.emerald}80`,
          }}
        />
        <div style={{fontSize: 132 * u, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1}}>
          <Stagger text="Teebo" delay={24} />
          <Stagger text="Studio" delay={31} colors={[C.emeraldL, C.cyan]} />
        </div>
        <div
          style={{
            fontSize: 28 * u,
            letterSpacing: '0.32em',
            fontWeight: 500,
            color: C.muted,
            opacity: r(f, 42, 56),
            transform: `translateY(${r(f, 42, 56, 20, 0) * u}px)`,
          }}
        >
          SITES · APPLICATIONS · IA · VIDÉO
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ---------- 3. Du code au site noté 100/100 ---------- */
type Seg = [string, string];
const CODE: Seg[][] = [
  [['export default ', DARK.emeraldL], ['function ', DARK.emeraldL], ['Site', DARK.cyan], ['() {', DARK.fg]],
  [['  return (', DARK.fg]],
  [['    <', DARK.dim], ['Hero ', DARK.cyan], ['titre', DARK.muted], ['=', DARK.dim], ['"Votre activité"', '#86efac'], [' />', DARK.dim]],
  [['    <', DARK.dim], ['Services ', DARK.cyan], ['/>', DARK.dim]],
  [['    <', DARK.dim], ['Contact ', DARK.cyan], ['cta', DARK.muted], ['=', DARK.dim], ['"Devis gratuit"', '#86efac'], [' />', DARK.dim]],
  [['  )', DARK.fg]],
  [['}', DARK.fg]],
];
const TYPE_START = 8;
const CPS = 2.8; // caractères par frame
const lineEnds = CODE.reduce<number[]>((acc, line) => {
  const len = line.reduce((n, [t]) => n + t.length, 0);
  acc.push((acc[acc.length - 1] ?? 0) + len);
  return acc;
}, []);
const lineDoneAt = (i: number) => TYPE_START + lineEnds[i] / CPS;
const TYPE_END = lineDoneAt(CODE.length - 1);

const Panel: React.FC<{w: number; h: number; title: React.ReactNode; children: React.ReactNode}> = ({
  w,
  h,
  title,
  children,
}) => {
  const C = useC();
  return (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 22,
      background: C.panel,
      border: `1px solid ${C.border}`,
      boxShadow: `0 40px 80px ${C.shadow}`,
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    <div
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 20px',
        borderBottom: `1px solid ${C.border}`,
        background: C.bar2,
      }}
    >
      {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
        <div key={c} style={{width: 14, height: 14, borderRadius: 7, background: c, opacity: 0.85}} />
      ))}
      <div style={{flex: 1, display: 'flex', justifyContent: 'center', marginRight: 60}}>{title}</div>
    </div>
    <div style={{flex: 1, position: 'relative'}}>{children}</div>
  </div>
  );
};

const CodePanel = () => {
  const C = DARK;
  const f = useCurrentFrame();
  let budget = Math.max(0, (f - TYPE_START) * CPS);
  const cursorOn = Math.floor(f / 8) % 2 === 0;
  let cursorPlaced = false;
  return (
    <ThemeCtx.Provider value={DARK}>
    <Panel w={800} h={440} title={<span style={{fontFamily: mono, fontSize: 18, color: C.muted}}>page.tsx</span>}>
      <div style={{fontFamily: mono, fontSize: 26, lineHeight: 1.6, padding: '24px 28px', whiteSpace: 'pre'}}>
        {CODE.map((line, li) => {
          const nodes: React.ReactNode[] = [];
          line.forEach(([t, color], si) => {
            const shown = t.slice(0, Math.max(0, Math.min(t.length, Math.floor(budget))));
            budget -= t.length;
            if (shown) nodes.push(<span key={si} style={{color}}>{shown}</span>);
          });
          const lineStarted = nodes.length > 0;
          const lineFull = budget >= 0;
          const showCursor = !cursorPlaced && lineStarted && (!lineFull || li === CODE.length - 1);
          if (showCursor) cursorPlaced = true;
          return (
            <div key={li} style={{height: '1.6em', display: 'flex'}}>
              <span style={{color: C.dim, width: 44, flexShrink: 0}}>{li + 1}</span>
              {nodes}
              {showCursor && (
                <span style={{width: 12, background: C.emeraldL, opacity: cursorOn ? 1 : 0, marginLeft: 2}} />
              )}
            </div>
          );
        })}
      </div>
    </Panel>
    </ThemeCtx.Provider>
  );
};

const Block: React.FC<{at: number; children: React.ReactNode; style?: React.CSSProperties}> = ({at, children, style}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: f - at, fps, config: {damping: 14, stiffness: 160}});
  return (
    <div style={{opacity: Math.min(1, p * 1.5), transform: `translateY(${(1 - p) * 40}px) scale(${0.94 + p * 0.06})`, ...style}}>
      {children}
    </div>
  );
};

const Bar: React.FC<{w: number | string; h?: number; c?: string}> = ({w, h = 14, c}) => {
  const C = useC();
  return <div style={{width: w, height: h, borderRadius: h / 2, background: c ?? C.bar}} />;
};

const SCORE_AT = Math.round(TYPE_END) + 6;

const ScoreRing = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pop = spring({frame: f - SCORE_AT, fps, config: {damping: 12}});
  const v = Math.round(r(f, SCORE_AT + 4, SCORE_AT + 34, 0, 100, Easing.out(Easing.cubic)));
  const color = v < 50 ? C.bad : v < 90 ? C.warn : C.emeraldL;
  const R = 62;
  const circ = 2 * Math.PI * R;
  return (
    <div
      style={{
        position: 'absolute',
        right: -30,
        bottom: -40,
        width: 230,
        padding: '22px 0 18px',
        borderRadius: 26,
        background: C.panel,
        border: `1px solid ${C.border}`,
        boxShadow: `0 30px 60px ${C.shadow}, 0 0 ${v >= 90 ? 60 : 0}px ${C.emerald}55`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        transform: `scale(${pop})`,
      }}
    >
      <div style={{position: 'relative', width: 150, height: 150}}>
        <svg width={150} height={150} style={{transform: 'rotate(-90deg)'}}>
          <circle cx={75} cy={75} r={R} stroke={C.bar2} strokeWidth={12} fill="none" />
          <circle
            cx={75}
            cy={75}
            r={R}
            stroke={color}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - v / 100)}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 54,
            fontWeight: 800,
            color,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {v}
        </div>
      </div>
      <div style={{fontSize: 20, fontWeight: 600, color: C.fg}}>Performance</div>
      <div style={{fontSize: 15, color: C.muted, marginTop: -6}}>PageSpeed Insights</div>
    </div>
  );
};

const BrowserPanel = () => {
  const C = useC();
  return (
  <div style={{position: 'relative'}}>
    <Panel
      w={800}
      h={500}
      title={
        <div
          style={{
            fontSize: 17,
            color: C.muted,
            background: C.bar2,
            padding: '6px 22px',
            borderRadius: 20,
          }}
        >
          🔒 votre-site.fr
        </div>
      }
    >
      <div style={{padding: 30, display: 'flex', flexDirection: 'column', gap: 26}}>
        <Block at={lineDoneAt(2)} style={{display: 'flex', flexDirection: 'column', gap: 14}}>
          <Bar w={120} h={12} c={`${C.emerald}90`} />
          <div style={{fontSize: 40, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.05}}>
            Votre activité,
            <br />
            <span style={gradientText(C.emeraldL, C.cyan)}>en ligne.</span>
          </div>
          <div style={{display: 'flex', gap: 12, marginTop: 4}}>
            <div style={{padding: '10px 20px', borderRadius: 10, background: C.emeraldD, color: '#fff', fontSize: 16, fontWeight: 600}}>
              Devis gratuit
            </div>
            <div style={{padding: '10px 20px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 16, color: C.muted}}>
              Nos services
            </div>
          </div>
        </Block>
        <div style={{display: 'flex', gap: 16}}>
          {[0, 1, 2].map((i) => (
            <Block
              key={i}
              at={lineDoneAt(3) + i * 3}
              style={{
                flex: 1,
                height: 104,
                borderRadius: 14,
                border: `1px solid ${C.border}`,
                background: C.bar2,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div style={{width: 28, height: 28, borderRadius: 8, background: i === 1 ? `${C.cyan}60` : `${C.emerald}60`}} />
              <Bar w="80%" h={11} />
              <Bar w="55%" h={11} c={C.bar2} />
            </Block>
          ))}
        </div>
        <Block
          at={lineDoneAt(4)}
          style={{
            height: 58,
            borderRadius: 14,
            border: `1px solid ${C.emerald}50`,
            background: `${C.emerald}14`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}
        >
          <Bar w={220} h={12} />
          <Bar w={90} h={26} c={C.emeraldD} />
        </Block>
      </div>
    </Panel>
    <ScoreRing />
  </div>
  );
};

const Build = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {u, width, height, portrait} = useLayout();
  const s = portrait ? 0.84 * (width / 800) : Math.min(1, (width - 220 * u) / 1640, (height - 330 * u) / 540);
  const swap = SCORE_AT + 10;
  const headSize = 76 * u;
  const heads = [
    <>Du code <span style={gradientText(C.emeraldL, C.cyan)}>sur-mesure</span>…</>,
    <>…un site noté <span style={gradientText(C.emeraldL, C.cyan)}>100/100</span></>,
  ];
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        gap: (portrait ? 70 : 50) * u,
        ...exitStyle(f, 126, 138),
      }}
    >
      <div style={{position: 'relative', height: headSize * 1.3, width: '100%', overflow: 'hidden'}}>
        {heads.map((h, i) => {
          const y = i === 0 ? (f < swap ? r(f, 0, 14, 110, 0) : r(f, swap, swap + 10, 0, -110)) : r(f, swap + 2, swap + 14, 110, 0);
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                inset: 0,
                textAlign: 'center',
                fontSize: headSize,
                fontWeight: 800,
                letterSpacing: '-0.045em',
                transform: `translateY(${y}%)`,
              }}
            >
              {h}
            </div>
          );
        })}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: portrait ? 'column' : 'row',
          alignItems: 'center',
          gap: 40,
          transform: `scale(${s})`,
          margin: portrait ? `${((s - 1) * 940) / 2}px 0` : `${((s - 1) * 500) / 2}px ${((s - 1) * 1640) / 2}px`,
        }}
      >
        <Block at={2}>
          <div style={{transform: portrait ? undefined : 'perspective(1600px) rotateY(10deg)'}}>
            <CodePanel />
          </div>
        </Block>
        <Block at={6}>
          <div style={{transform: portrait ? undefined : 'perspective(1600px) rotateY(-10deg)'}}>
            <BrowserPanel />
          </div>
        </Block>
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 4. Réalisations ---------- */
const PROJECTS = [
  {img: 'lesclefsducredit.png', name: 'Les Clefs du Crédit', tag: 'Site client · courtier en crédit', url: 'lesclefsducredit.fr'},
  {img: 'conformefr.png', name: 'ConformeFR', tag: 'SaaS · mentions légales par IA', url: 'conformefr.com'},
  {img: 'beedirectory-2026.png', name: 'BeeDirectory', tag: 'SaaS · 6 clients payants', url: 'bee-directory.com'},
];
const CARD_W = 768;
const CARD_H = 480 + 44;

const Work = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {u, fps, width, height} = useLayout();
  const s = Math.min(1.3, (width - 160 * u) / CARD_W, (height - 560 * u) / CARD_H);
  const enter = PROJECTS.map((_, i) => 14 + i * 32);
  const prog = enter.map((e) => spring({frame: f - e, fps, config: {damping: 16, stiffness: 110}}));
  const current = enter.reduce((acc, e, i) => (f >= e + 6 ? i : acc), 0);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 50 * u, ...exitStyle(f, 126, 138)}}>
      <div style={{textAlign: 'center', fontSize: 72 * u, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05}}>
        <Rise>Des projets en ligne,</Rise>
        <Rise delay={5}>
          <span style={{color: C.muted}}>que vous pouvez visiter.</span>
        </Rise>
      </div>
      <div style={{position: 'relative', width: CARD_W * s, height: CARD_H * s + 70 * u, perspective: 2000}}>
        {PROJECTS.map((p, i) => {
          const pi = prog[i];
          const depth = prog.slice(i + 1).reduce((a, b) => a + b, 0);
          return (
            <div
              key={p.name}
              style={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: CARD_W * s,
                height: CARD_H * s,
                borderRadius: 20 * s,
                overflow: 'hidden',
                background: C.panel,
                border: `1px solid ${C.border}`,
                boxShadow: `0 50px 100px ${C.shadow}`,
                opacity: Math.min(1, pi * 2),
                transformOrigin: '50% 0%',
                transform: `translateX(${(1 - pi) * width * 0.9}px) rotateY(${(1 - pi) * -38}deg) translateY(${-depth * 36 * u}px) scale(${1 - depth * 0.07})`,
                filter: `brightness(${1 - depth * 0.4})`,
              }}
            >
              <div
                style={{
                  height: 44 * s,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8 * s,
                  padding: `0 ${16 * s}px`,
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
                  <div key={c} style={{width: 11 * s, height: 11 * s, borderRadius: 6 * s, background: c, opacity: 0.85}} />
                ))}
                <div style={{flex: 1, textAlign: 'center', fontSize: 15 * s, color: C.muted, marginRight: 50 * s}}>{p.url}</div>
              </div>
              <Img src={staticFile(p.img)} style={{width: '100%', height: 480 * s, objectFit: 'cover', display: 'block'}} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'relative', height: 110 * u, width: '100%', overflow: 'hidden'}}>
        {PROJECTS.map((p, i) => {
          const y = r(f, enter[i] + 6, enter[i] + 18, 110, 0) + (i < current ? r(f, enter[i + 1] + 6, enter[i + 1] + 14, 0, -110) : 0);
          return (
            <div
              key={p.name}
              style={{position: 'absolute', inset: 0, textAlign: 'center', transform: `translateY(${i <= current + 1 ? y : 110}%)`}}
            >
              <div style={{fontSize: 48 * u, fontWeight: 700, letterSpacing: '-0.03em'}}>{p.name}</div>
              <div style={{fontSize: 28 * u, color: C.emeraldL, marginTop: 6 * u}}>{p.tag}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 5. Offre ---------- */
const OFFERS: [string, string, boolean?][] = [
  ['Landing page', 'dès 300 €'],
  ['Site vitrine', 'dès 800 €'],
  ['Application web', 'dès 2 990 €'],
  ['Intégration IA · Claude', 'dès 490 €'],
  ['Vidéo motion design', 'dès 290 €', true],
];

const Offer = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {u, width} = useLayout();
  const w = Math.min(900 * u, width - 120 * u);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 56 * u, ...exitStyle(f, 82, 93)}}>
      <div style={{textAlign: 'center', fontSize: 80 * u, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.05}}>
        <Rise>Une offre claire,</Rise>
        <Rise delay={5}>
          <span style={gradientText(C.emeraldL, C.cyan)}>des prix affichés.</span>
        </Rise>
      </div>
      <div style={{width: w, borderTop: `1px solid ${C.border}`}}>
        {OFFERS.map(([name, price, isNew], i) => {
          const d = 14 + i * 6;
          const p = r(f, d, d + 16);
          const line = r(f, d, d + 22, 0, 1, Easing.inOut(Easing.cubic));
          return (
            <div key={name} style={{position: 'relative', opacity: p, transform: `translateX(${(1 - p) * 80 * u}px)`}}>
              <div
                style={{
                  height: 100 * u,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 28 * u,
                  padding: `0 ${14 * u}px`,
                  background: isNew ? `linear-gradient(90deg, ${C.emerald}22, transparent)` : undefined,
                }}
              >
                <span style={{fontFamily: mono, fontSize: 22 * u, color: C.dim}}>0{i + 1}</span>
                <span style={{fontSize: 42 * u, fontWeight: 600, letterSpacing: '-0.02em', flex: 1}}>
                  {name}
                  {isNew && (
                    <span
                      style={{
                        marginLeft: 16 * u,
                        fontSize: 18 * u,
                        fontWeight: 600,
                        letterSpacing: '0.12em',
                        padding: `${5 * u}px ${12 * u}px`,
                        borderRadius: 99,
                        border: `1px solid ${C.emerald}`,
                        color: C.emeraldL,
                        verticalAlign: 'middle',
                      }}
                    >
                      NOUVEAU
                    </span>
                  )}
                </span>
                <span style={{fontFamily: mono, fontSize: 30 * u, color: C.emeraldL, fontWeight: 500}}>{price}</span>
              </div>
              <div style={{height: 1, width: `${line * 100}%`, background: C.border}} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ---------- 6. Appel à l'action ---------- */
const Cta = () => {
  const C = useC();
  const f = useCurrentFrame();
  const {u, fps} = useLayout();
  const pop = spring({frame: f - 30, fps, config: {damping: 11, stiffness: 150}});
  const shine = ((f - 40) % 45) / 45;
  const pulse = 0.5 + 0.5 * Math.sin(f / 7);
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 60 * u}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 20 * u, opacity: r(f, 0, 12)}}>
        <Logo size={72 * u} />
        <span style={{fontSize: 46 * u, fontWeight: 800, letterSpacing: '-0.04em'}}>TeeboStudio</span>
      </div>
      <div style={{textAlign: 'center', fontSize: 96 * u, fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1.02}}>
        <Rise delay={6}>Commencez par</Rise>
        <Rise delay={11}>
          <span style={gradientText(C.emeraldL, C.cyan)}>l’audit gratuit</span>
        </Rise>
        <Rise delay={16}>de votre site.</Rise>
      </div>
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          transform: `scale(${pop})`,
          padding: `${30 * u}px ${64 * u}px`,
          borderRadius: 999,
          background: C.emeraldD,
          color: '#fff',
          fontSize: 50 * u,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          boxShadow: `0 0 ${(60 + pulse * 50) * u}px ${C.emerald}${f > 40 ? '90' : '50'}`,
        }}
      >
        teebostudio.fr →
        {f > 40 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '40%',
              left: `${-50 + shine * 170}%`,
              background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.35), transparent)',
            }}
          />
        )}
      </div>
      <div style={{fontSize: 28 * u, color: C.muted, letterSpacing: '0.04em', opacity: r(f, 44, 58)}}>
        Next.js · IA Claude · Bordeaux et à distance
      </div>
    </AbsoluteFill>
  );
};

export const Main: React.FC<{theme: 'dark' | 'light'}> = ({theme}) => {
  const C = theme === 'light' ? LIGHT : DARK;
  return (
  <ThemeCtx.Provider value={C}>
  <AbsoluteFill style={{fontFamily, color: C.fg}}>
    <Background />
    <Sequence from={S.hook.from} durationInFrames={S.hook.dur}>
      <Hook />
    </Sequence>
    <Sequence from={S.brand.from} durationInFrames={S.brand.dur}>
      <Brand />
    </Sequence>
    <Sequence from={S.build.from} durationInFrames={S.build.dur}>
      <Build />
    </Sequence>
    <Sequence from={S.work.from} durationInFrames={S.work.dur}>
      <Work />
    </Sequence>
    <Sequence from={S.offer.from} durationInFrames={S.offer.dur}>
      <Offer />
    </Sequence>
    <Sequence from={S.cta.from} durationInFrames={S.cta.dur}>
      <Cta />
    </Sequence>
  </AbsoluteFill>
  </ThemeCtx.Provider>
  );
};
