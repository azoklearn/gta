# GTAClip

GTAClip ([gtaclip.io](https://gtaclip.io)) est un outil de clipping : il transforme les vidéos et les lives GTA 6 de youtubeurs et de streamers en shorts verticaux prêts à poster sur TikTok, Shorts et Reels. On colle le lien d'une vidéo YouTube, le serveur repère les passages les plus intenses, les recadre en 9:16, incruste un titre écrit par une IA et les sous-titres, puis propose les shorts au téléchargement.

## Lancer le projet

Le serveur a besoin de deux outils en ligne de commande :

- **ffmpeg** (avec libx264 et libass) pour l'analyse et le rendu ;
- **Python 3 avec OpenCV** (`opencv-python-headless` 4.x, qui fournit le détecteur de visages) pour repérer la facecam ; sans lui, les shorts restent en plein écran ;
- **yt-dlp** pour récupérer les vidéos YouTube, avec Node.js comme moteur JavaScript.

```bash
npm install
npm run dev
```

Le site est servi sur http://localhost:3000.

## Comment ça marche

1. `POST /api/jobs` reçoit le lien YouTube, crée un traitement et le place en file d'attente. Un seul traitement tourne à la fois.
2. **Récupération** : yt-dlp télécharge la vidéo en 1080p au maximum, ainsi que ses sous-titres (manuels ou automatiques) quand il y en a.
3. **Analyse** : ffmpeg mesure le niveau sonore seconde par seconde et les changements à l'image. Les fenêtres les plus intenses sont retenues sans chevauchement, avec un bonus quand le début est fort. Le score de 1 à 5 étoiles vient de ces mesures.
4. **Facecam** : un visage qui revient au même endroit tout au long de la vidéo est celui du streamer ; le cadre de sa facecam est délimité par la zone qui reste immobile autour (`tools/facecam.py`, avec OpenCV).
5. **Titre** : Claude reçoit quelques images de chaque passage et ce qui s'y dit, et écrit le titre incrusté, la description et les hashtags (`lib/server/titles.ts`, une seule requête par vidéo). Sans clé `ANTHROPIC_API_KEY`, ou si la requête échoue, les shorts sortent sans titre.
6. **Rendu** : chaque passage sort en 1080 × 1920, encodé en H.264, et sous-titré si la vidéo source avait des sous-titres. Avec une facecam, elle occupe le tiers haut et le jeu les deux tiers du bas, le titre se plaçant juste sous la facecam ; sinon le jeu, recadré au centre, remplit l'écran.
7. La page `/projets/<id>` suit l'avancement puis affiche les shorts, à lire et à télécharger. Ils sont supprimés au bout de 24 heures.

## Comptes et abonnements

Un découpage demande un compte (adresse e-mail et mot de passe). Chaque compte reçoit 3 shorts d'essai, puis l'utilisateur choisit une offre mensuelle, définie dans `lib/plans.ts` :

| Offre | Prix | Shorts par mois | Shorts par vidéo | Durée max. d'une vidéo |
| --- | --- | --- | --- | --- |
| Clipper | 19 € | 30 | 3 | 30 min |
| Expert | 29 € | 90 | 5 | 1 h |
| Pro | 49 € | 200 | 8 | 1 h 30 |

Le paiement passe par Mollie (`lib/server/billing.ts`, SDK `mollie-api-typescript`) :

1. Le premier paiement règle le premier mois et enregistre le moyen de paiement.
2. À sa confirmation, l'offre est activée et un abonnement Mollie est créé ; il prélève chaque mois à partir du mois suivant.
3. Mollie notifie chaque paiement sur `POST /api/billing/webhook`. L'état est toujours relu auprès de Mollie, et une notification rejouée ne crédite pas deux fois.
4. À chaque prélèvement réussi, le compteur de shorts repart au quota de l'offre (pas de report). Une offre résiliée, ou dont les prélèvements échouent, s'arrête à la fin de la période payée.

Les shorts d'une vidéo sont réservés sur le quota au lancement ; ceux qui ne sont pas produits (vidéo trop courte, échec) sont rendus au compte. Les comptes sont stockés dans une base SQLite (`lib/server/db.ts`), à placer sur un disque persistant.

Ce qui manque encore : réinitialisation du mot de passe (aucun envoi d'e-mail n'est en place), factures, conditions générales de vente.

## Structure

- `app/page.tsx` : page d'accueil, une section par fichier dans `components/`.
- `app/projets/[id]/page.tsx` et `components/ProjectView.tsx` : suivi d'un découpage et résultats.
- `app/api/jobs/` : création d'un traitement, état, lecture et téléchargement des shorts, image de la vidéo d'origine. `app/api/health` : diagnostic du serveur.
- `lib/server/pipeline.ts` : enchaînement des étapes.
- `lib/server/youtube.ts` : appels à yt-dlp. `lib/server/analyze.ts` : détection des passages. `lib/server/titles.ts` : titres écrits par l'IA. `lib/server/subtitles.ts` : sous-titres et bandeau du titre. `lib/server/render.ts` : rendu ffmpeg.
- `lib/server/jobs.ts` : stockage des traitements sur disque et file d'attente en mémoire.
- `lib/plans.ts` : offres. `lib/server/auth.ts` : comptes, sessions et quotas. `lib/server/billing.ts` : abonnements Mollie.
- `app/inscription`, `app/connexion`, `app/compte` : pages du compte ; `lib/account.ts` garde la session côté navigateur.
- `lib/demo.ts` et `public/demo/` : visuels de la page d'accueil, tirés de vraies vidéos de streamers et des shorts que l'outil en a produits. Ces vidéos appartiennent à leurs créateurs : demande leur accord avant d'en faire la vitrine du site.
- `public/images/city.jpg` : visuel officiel de GTA VI (il appartient à Rockstar Games).

## Réglages

Variables d'environnement, toutes facultatives (elles gardent le préfixe `VICECLIP_`, premier nom du projet) :

| Variable | Rôle | Valeur par défaut |
| --- | --- | --- |
| `VICECLIP_DATA_DIR` | Dossier des vidéos en cours et des shorts (temporaire) | `./data` |
| `VICECLIP_DB_DIR` | Dossier de la base des comptes (persistant) | celui de `VICECLIP_DATA_DIR` |
| `MOLLIE_API_KEY` | Clé d'API Mollie (`test_…` pour les essais, `live_…` en production). Sans elle, les abonnements sont désactivés | aucune |
| `ANTHROPIC_API_KEY` | Clé d'API Anthropic, pour le titre, la description et les hashtags écrits par l'IA. Sans elle, les shorts sortent sans titre | aucune |
| `VICECLIP_TITLE_MODEL` | Modèle Claude qui écrit les titres | `claude-opus-5-5` |
| `VICECLIP_PUBLIC_URL` | Adresse publique du serveur, appelée par Mollie pour ses notifications | déduite de `RAILWAY_PUBLIC_DOMAIN` |
| `VICECLIP_MAX_MINUTES` | Plafond du serveur pour la durée d'une vidéo source, quelle que soit l'offre | `90` |
| `VICECLIP_ALLOW_UPLOAD` | Mettre à `1` pour ouvrir la route d'essai `POST /api/jobs/upload` (import direct d'un fichier, non proposé sur le site) | fermée |
| `VICECLIP_MAX_UPLOAD_MB` | Taille maximale d'un fichier envoyé à la route d'essai | `2048` |
| `VICECLIP_CLIP_SECONDS` | Durée de chaque short | `64` |
| `VICECLIP_JOB_TTL_HOURS` | Durée de conservation des shorts | `24` |
| `NEXT_PUBLIC_VICECLIP_API` | Adresse du serveur de découpage, quand il est séparé du site | aucune (même serveur) |
| `VICECLIP_ALLOWED_ORIGINS` | Sites autorisés à appeler le serveur de découpage | aucun |
| `YTDLP_COOKIES_TEXT` | Contenu du fichier de cookies d'un compte YouTube dédié (format Netscape, tel quel ou en base64) : le serveur s'identifie avec ce compte. C'est un secret | aucun |
| `YTDLP_COOKIES` | Variante : chemin d'un fichier de cookies déjà présent sur le serveur | aucun |
| `YTDLP_PROXY` | Proxy transmis à yt-dlp | aucun |
| `FFMPEG_PATH`, `FFPROBE_PATH`, `YTDLP_PATH`, `PYTHON_PATH` | Chemins des outils | ceux du `PATH` |

## Mise en ligne

Le découpage tourne en tâche de fond, utilise ffmpeg et yt-dlp et écrit sur le disque : il lui faut un serveur qui reste allumé. Vercel et les autres hébergements « serverless » ne peuvent pas le faire tourner. Deux montages sont possibles.

### Site sur Vercel, découpage sur un serveur à part

Le même dépôt est déployé deux fois : Vercel sert les pages, un second serveur exécute le découpage. Le navigateur envoie les vidéos et lit les shorts directement sur ce second serveur.

1. **Serveur de découpage.** Déploie ce dépôt avec son `Dockerfile` sur un hébergeur de conteneurs (Railway, Render, Fly.io) ou un VPS. L'application écoute sur le port 3000, ou sur celui de la variable `PORT`. Il lui faut une adresse publique en HTTPS.
2. Sur ce serveur, règle `VICECLIP_ALLOWED_ORIGINS` avec l'adresse du site, par exemple `https://gtaclip.io,https://www.gtaclip.io`. Plusieurs adresses se séparent par des virgules, et `https://*.vercel.app` couvre les déploiements de prévisualisation.
3. Ouvre `https://<serveur>/api/health` : la réponse doit contenir `"ok": true`. Sinon elle dit ce qui manque.
4. **Site.** Sur Vercel, ajoute la variable d'environnement `NEXT_PUBLIC_VICECLIP_API` avec l'adresse du serveur de découpage (`https://<serveur>`, sans chemin), puis redéploie : cette variable est lue au moment de la construction du site.

Ce dépôt est déjà réglé ainsi : le serveur de découpage tourne sur Railway (projet `viceclip`, service `decoupage`, déployé à chaque envoi sur la branche) et son adresse est enregistrée dans `.env.production`, que Vercel lit à la construction. Si l'adresse du serveur change, mets ce fichier à jour.

### Tout sur un seul serveur

Déploie le `Dockerfile` et pointe ton domaine dessus, sans régler `NEXT_PUBLIC_VICECLIP_API` ni `VICECLIP_ALLOWED_ORIGINS`.

### À savoir

Avant chaque découpage, le serveur vérifie qu'il peut écrire dans son dossier de travail et que ffmpeg et yt-dlp sont installés ; sinon le formulaire affiche la raison au lieu de lancer un traitement voué à l'échec.

YouTube refuse souvent les téléchargements venant d'adresses de centres de données (« Sign in to confirm you're not a bot »). Le serveur relance automatiquement ; si le refus persiste, les liens ne passent pas : c'est la principale limite actuelle du service.

Pour que le serveur s'identifie auprès de YouTube, connecte-lui un compte dédié (jamais un compte personnel : il peut être restreint) :

1. Dans une fenêtre de navigation privée, connecte-toi à YouTube avec ce compte, puis exporte les cookies de `youtube.com` au format Netscape (`cookies.txt`) avec une extension de navigateur prévue pour cela. Ferme ensuite la fenêtre sans te déconnecter.
2. Colle le contenu du fichier dans la variable `YTDLP_COOKIES_TEXT` du serveur de découpage, puis redéploie.
3. `/api/health` doit répondre `"youtubeAccount": true`.

Le serveur garde ces cookies sur son disque persistant et les laisse se renouveler ; ils finissent quand même par expirer, il faut alors recommencer l'export. Les journaux signalent un refus de YouTube « malgré le compte connecté ».

## Limites connues

- Une vidéo sans sous-titres YouTube donne des shorts sans texte : il n'y a pas encore de transcription.
- Le recadrage du jeu est centré, il ne suit pas un sujet qui s'écarte du milieu de l'image.
- La détection de la facecam suppose un visage de face et une incrustation fixe ; un streamer incrusté sans cadre (fond vert) est cadré serré autour du visage.
- La file d'attente est en mémoire : un redémarrage du serveur interrompt le traitement en cours.
- Sans clé `ANTHROPIC_API_KEY`, les shorts n'ont pas de titre et les légendes proposées reprennent le titre de la vidéo.
