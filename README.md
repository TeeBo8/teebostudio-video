# TeeboStudio — vidéo de présentation

Vidéo motion design de 20 secondes pour [TeeboStudio](https://teebostudio.fr), agence web. Elle est écrite en code avec [Remotion](https://www.remotion.dev) : la même composition React sort en trois formats et deux thèmes, sans montage.

![Plan « Réalisations » de la vidéo](docs/apercu.png)

**Télécharger les vidéos :** [derniers rendus (MP4)](../../releases/tag/video)

## Formats

| Composition | Dimensions | Usage |
|---|---|---|
| `Landscape` / `LandscapeLight` | 1920 × 1080 | site, YouTube, LinkedIn |
| `Square` / `SquareLight` | 1080 × 1080 | fil LinkedIn, Instagram |
| `Vertical` / `VerticalLight` | 1080 × 1920 | Reels, Shorts, stories |

Toutes font 615 images à 30 images/s, sans son. Les versions `Light` reprennent le thème clair du site.

## Les six plans

| # | Plan | Contenu |
|---|------|---------|
| 1 | `Hook` | L'accroche |
| 2 | `Brand` | Le logo et le nom |
| 3 | `Build` | Du code qui s'écrit, la page qui se construit, le score de performance |
| 4 | `Work` | Trois réalisations en ligne |
| 5 | `Offer` | Les offres et leurs prix de départ |
| 6 | `Cta` | L'appel à l'action vers teebostudio.fr |

## Organisation du code

Tout tient dans deux fichiers :

- `src/Root.tsx` déclare les six compositions (trois formats × deux thèmes).
- `src/Main.tsx` contient la vidéo. En haut du fichier : la chronologie (`S`), puis les couleurs des deux thèmes (`DARK`, `LIGHT`). Les réalisations sont dans `PROJECTS`, les offres dans `OFFERS`.

La mise en page s'adapte au format avec `useLayout`, qui lit les dimensions de la composition : il n'y a pas un plan par format.

## Travailler en local

Il faut [Node.js](https://nodejs.org) 22 ou plus récent et [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm studio             # aperçu dans le navigateur
pnpm render:landscape   # out/teebostudio-16x9.mp4
pnpm render:square      # out/teebostudio-1x1.mp4
pnpm render:vertical    # out/teebostudio-9x16.mp4
```

Pour un thème clair : `pnpm exec remotion render LandscapeLight out/teebostudio-16x9-clair.mp4`.

## Rendu automatique

Chaque modification poussée sur `main` relance le rendu des trois formats sur GitHub (onglet **Actions**, workflow « Rendu de la vidéo ») et remplace les fichiers de la [release `video`](../../releases/tag/video).

## Droits

- Le code est consultable librement, mais aucune licence de réutilisation n'est accordée. La marque TeeboStudio, son logo et les captures d'écran des réalisations ne sont pas réutilisables.
- Remotion est gratuit pour les particuliers et les petites structures ; au-delà, une licence payante est nécessaire. Voir [les conditions de Remotion](https://www.remotion.dev/docs/license).
