// Rend toutes les vidéos dans out/. Usage : `pnpm render` (tout) ou `pnpm render site` / `pnpm render social`.
import {execSync} from 'node:child_process';

const RENDERS = {
  // Pour teebostudio.fr : paysage, deux thèmes, deux langues
  site: [
    ['Landscape', 'teebostudio-16x9'],
    ['LandscapeLight', 'teebostudio-16x9-light'],
    ['LandscapeEn', 'teebostudio-16x9-en'],
    ['LandscapeLightEn', 'teebostudio-16x9-light-en'],
  ],
  // Pour les réseaux : carré et vertical, en français et en anglais
  social: [
    ['Square', 'teebostudio-1x1'],
    ['Vertical', 'teebostudio-9x16'],
    ['SquareEn', 'teebostudio-1x1-en'],
    ['VerticalEn', 'teebostudio-9x16-en'],
  ],
};

const group = process.argv[2];
const list = group ? RENDERS[group] : Object.values(RENDERS).flat();
if (!list) throw new Error(`Groupe inconnu : ${group} (site ou social)`);

for (const [composition, file] of list) {
  // crf 24 : fichiers légers, sans perte visible sur des aplats
  execSync(`npx remotion render ${composition} out/${file}.mp4 --crf=24 --log=error`, {stdio: 'inherit'});
  console.log(`✓ out/${file}.mp4`);
}
