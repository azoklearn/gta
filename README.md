# ViceClip

ViceClip découpe une vidéo de gameplay GTA 6 en shorts verticaux pour TikTok, Shorts et Reels : on colle un lien YouTube (ou on importe un fichier), le serveur repère les passages les plus intenses, les recadre en 9:16, incruste les sous-titres et propose les shorts au téléchargement.

## Lancer le projet

Le serveur a besoin de deux outils en ligne de commande :

- **ffmpeg** (avec libx264 et libass) pour l'analyse et le rendu ;
- **yt-dlp** pour récupérer les vidéos YouTube, avec Node.js comme moteur JavaScript.

```bash
npm install
npm run dev
```

Le site est servi sur http://localhost:3000.

## Comment ça marche

1. `POST /api/jobs` (lien YouTube) ou `POST /api/jobs/upload` (fichier) crée un traitement et le place en file d'attente. Un seul traitement tourne à la fois.
2. **Récupération** : yt-dlp télécharge la vidéo en 1080p au maximum, ainsi que ses sous-titres (manuels ou automatiques) quand il y en a.
3. **Analyse** : ffmpeg mesure le niveau sonore seconde par seconde et les changements à l'image. Les fenêtres les plus intenses sont retenues sans chevauchement, avec un bonus quand le début est fort. Le score de 1 à 5 étoiles vient de ces mesures.
4. **Rendu** : chaque passage est recadré au centre en 1080 × 1920, encodé en H.264, et sous-titré si la vidéo source avait des sous-titres.
5. La page `/projets/<id>` suit l'avancement puis affiche les shorts, à lire et à télécharger. Ils sont supprimés au bout de 24 heures.

Il n'y a ni compte ni paiement pour l'instant : les offres affichées sur la page d'accueil ne sont pas appliquées, chaque vidéo donne trois shorts.

## Structure

- `app/page.tsx` : page d'accueil, une section par fichier dans `components/`.
- `app/projets/[id]/page.tsx` et `components/ProjectView.tsx` : suivi d'un découpage et résultats.
- `app/api/jobs/` : création d'un traitement, état, lecture et téléchargement des shorts.
- `lib/server/pipeline.ts` : enchaînement des étapes.
- `lib/server/youtube.ts` : appels à yt-dlp. `lib/server/analyze.ts` : détection des passages. `lib/server/subtitles.ts` : sous-titres. `lib/server/render.ts` : rendu ffmpeg.
- `lib/server/jobs.ts` : stockage des traitements sur disque et file d'attente en mémoire.
- `lib/images.ts` et `public/images/` : visuels officiels de GTA VI (ils appartiennent à Rockstar Games).

## Réglages

Variables d'environnement, toutes facultatives :

| Variable | Rôle | Valeur par défaut |
| --- | --- | --- |
| `VICECLIP_DATA_DIR` | Dossier des vidéos en cours et des shorts | `./data` |
| `VICECLIP_MAX_MINUTES` | Durée maximale d'une vidéo source | `90` |
| `VICECLIP_MAX_UPLOAD_MB` | Taille maximale d'un fichier importé | `2048` |
| `VICECLIP_SHORTS_PER_JOB` | Nombre de shorts par vidéo | `3` |
| `VICECLIP_CLIP_SECONDS` | Durée de chaque short | `64` |
| `VICECLIP_JOB_TTL_HOURS` | Durée de conservation des shorts | `24` |
| `YTDLP_COOKIES` | Fichier de cookies transmis à yt-dlp | aucun |
| `YTDLP_PROXY` | Proxy transmis à yt-dlp | aucun |
| `FFMPEG_PATH`, `FFPROBE_PATH`, `YTDLP_PATH` | Chemins des outils | ceux du `PATH` |

## Mise en ligne

Le découpage tourne dans le processus Node et écrit sur le disque local : il faut un serveur qui reste allumé (VPS, Railway, Fly.io, Render…), pas un hébergement sans serveur comme Vercel. Le `Dockerfile` installe ffmpeg et yt-dlp ; il n'a pas encore été construit ni testé.

Avant chaque découpage, le serveur vérifie qu'il peut écrire dans son dossier de travail et que ffmpeg et yt-dlp sont installés ; sinon le formulaire affiche la raison au lieu de lancer un traitement voué à l'échec.

YouTube refuse souvent les téléchargements venant d'adresses de centres de données (« Sign in to confirm you're not a bot »). Dans ce cas, renseigne `YTDLP_COOKIES` ou `YTDLP_PROXY` ; l'import de fichier fonctionne dans tous les cas.

## Limites connues

- Les fichiers importés sortent sans sous-titres : il n'y a pas encore de transcription.
- Le recadrage est centré, il ne suit pas un sujet qui s'écarte du milieu de l'image.
- La file d'attente est en mémoire : un redémarrage du serveur interrompt le traitement en cours.
- Les légendes proposées reprennent le titre de la vidéo.
