import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {useTheme} from './theme';

// Monogramme « TS » en relief, le même dessin que dans le hero de teebostudio.fr :
// deux lettres en cases, posées à plat et vues en perspective isométrique.

const A = 28; // demi-largeur d'une case
const H = 12; // épaisseur des lettres

const T_CELLS = ['#####', '..#..', '..#..', '..#..', '..#..'];
const S_CELLS = ['####', '#...', '####', '...#', '####'];

const cells: [number, number][] = [];
T_CELLS.forEach((row, y) => [...row].forEach((c, x) => c === '#' && cells.push([x, y])));
S_CELLS.forEach((row, y) => [...row].forEach((c, x) => c === '#' && cells.push([x + 6, y])));

const occupied = new Set(cells.map(([x, y]) => `${x},${y}`));
const has = (x: number, y: number) => occupied.has(`${x},${y}`);
const project = (x: number, y: number, z: number) => `${(x + y) * A},${((y - x) * A) / 2 - z}`;

const topFaces: string[] = [];
const sideFaces: string[] = [];
const edges: string[] = [];
const edge = (a: string, b: string) => edges.push(`M${a} L${b}`);

for (const [x, y] of cells) {
  const south = !has(x, y + 1);
  const west = !has(x - 1, y);

  topFaces.push([project(x, y, H), project(x + 1, y, H), project(x + 1, y + 1, H), project(x, y + 1, H)].join(' '));
  if (!has(x, y - 1)) edge(project(x, y, H), project(x + 1, y, H));
  if (!has(x + 1, y)) edge(project(x + 1, y, H), project(x + 1, y + 1, H));
  if (south) edge(project(x, y + 1, H), project(x + 1, y + 1, H));
  if (west) edge(project(x, y, H), project(x, y + 1, H));

  if (south) {
    sideFaces.push([project(x, y + 1, H), project(x + 1, y + 1, H), project(x + 1, y + 1, 0), project(x, y + 1, 0)].join(' '));
    edge(project(x, y + 1, 0), project(x + 1, y + 1, 0));
    if (!(has(x - 1, y) && !has(x - 1, y + 1))) edge(project(x, y + 1, H), project(x, y + 1, 0));
    if (!(has(x + 1, y) && !has(x + 1, y + 1))) edge(project(x + 1, y + 1, H), project(x + 1, y + 1, 0));
  }
  if (west) {
    sideFaces.push([project(x, y, H), project(x, y + 1, H), project(x, y + 1, 0), project(x, y, 0)].join(' '));
    edge(project(x, y, 0), project(x, y + 1, 0));
    if (!(has(x, y - 1) && !has(x - 1, y - 1))) edge(project(x, y, H), project(x, y, 0));
    if (!(has(x, y + 1) && !has(x - 1, y + 1))) edge(project(x, y + 1, H), project(x, y + 1, 0));
  }
}

const edgePath = edges.join(' ');
const VIEW = {x: -16, y: -168, w: 452, h: 254};

// Les arêtes se tracent, les faces apparaissent, puis une lueur terracotta balaie le dessin de gauche à droite.
// Traits et hachures assez marqués pour rester visibles sur un petit écran.
export const TsMark: React.FC<{width: number}> = ({width}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
  // Tracé rapide : sur téléphone, on fait défiler vite, le dessin doit être lisible en moins d'une seconde
  const draw = interpolate(frame, [0, 20], [1, 0], {...clamp, easing: Easing.out(Easing.cubic)});
  const faces = interpolate(frame, [8, 24], [0, 1], clamp);
  const glowX = interpolate(frame, [14, 80], [VIEW.x - 60, VIEW.x + VIEW.w + 60], {...clamp, easing: Easing.inOut(Easing.quad)});

  return (
    <svg viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`} width={width} height={(width * VIEW.h) / VIEW.w} fill="none">
      <defs>
        <pattern id="ts-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(-26.565)">
          <line x1="0" y1="0.5" x2="5" y2="0.5" stroke={t.hatch} strokeWidth="1" />
        </pattern>
        <radialGradient id="ts-glow" gradientUnits="userSpaceOnUse" cx={glowX} cy={VIEW.y + VIEW.h / 2} r="150">
          <stop offset="0" stopColor={t.primary} />
          <stop offset="1" stopColor={t.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <g opacity={faces}>
        {sideFaces.map((points) => (
          <polygon key={points} points={points} fill={t.panel} />
        ))}
        {topFaces.map((points) => (
          <g key={points}>
            <polygon points={points} fill={t.bg} />
            <polygon points={points} fill="url(#ts-hatch)" />
          </g>
        ))}
      </g>
      {/* pathLength = 1 : chaque arête se trace en même temps, comme un croquis */}
      <path d={edgePath} pathLength={1} strokeDasharray={1} strokeDashoffset={draw} stroke={t.muted} strokeWidth="1.4" strokeLinecap="round" />
      <path d={edgePath} stroke="url(#ts-glow)" strokeWidth="2.2" strokeLinecap="round" opacity={faces} />
    </svg>
  );
};
