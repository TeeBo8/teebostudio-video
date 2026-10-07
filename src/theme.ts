import {createContext, useContext} from 'react';

// Couleurs calées sur les tokens du site (src/app/globals.css de teebostudio.fr, thème tweakcn « Claude »)
export const THEMES = {
  dark: {
    bg: '#262624',
    fg: '#c3c0b6',
    strong: '#faf9f5',
    muted: '#b7b5a9',
    dim: '#8a887d',
    panel: '#1f1f1d',
    line: '#3a3a35',
    primary: '#d97757',
    onPrimary: '#262624',
    hatch: 'rgba(250,249,245,0.26)',
    shadow: 'rgba(0,0,0,0.45)',
  },
  light: {
    bg: '#faf9f5',
    fg: '#3d3929',
    strong: '#1f1e1d',
    muted: '#6b6a64',
    dim: '#8f8d85',
    panel: '#f0eee6',
    line: '#dedcd3',
    primary: '#b5553a',
    onPrimary: '#ffffff',
    hatch: 'rgba(61,57,41,0.3)',
    shadow: 'rgba(61,57,41,0.16)',
  },
};

export type ThemeName = keyof typeof THEMES;
export type Theme = (typeof THEMES)[ThemeName];

export const ThemeContext = createContext<Theme>(THEMES.dark);
export const useTheme = () => useContext(ThemeContext);
