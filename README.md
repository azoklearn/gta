# ViceClip

Landing page de ViceClip : un SaaS qui découpe des vidéos GTA 6 hébergées sur YouTube en shorts verticaux pour TikTok, Shorts et Reels.

## Lancer le projet

```bash
npm install
npm run dev
```

Le site est servi sur http://localhost:3000.

## Structure

- `app/page.tsx` : assemble les sections de la page.
- `components/` : une section par fichier (`Hero`, `Steps`, `Earnings`, `Features`, `Pricing`, `Faq`, `FinalCta`, `Footer`).
- `components/AppMockup.tsx` : maquette de l'interface affichée sous le titre (vidéo source, timeline, shorts générés).
- `components/UrlForm.tsx` : champ de lien YouTube. Il valide le lien et affiche un aperçu des cadrages 9:16 ; le découpage réel reste à brancher côté serveur.
- `components/Earnings.tsx` : simulateur de revenus TikTok (shorts par jour × vues × RPM).
- `app/globals.css` : couleurs, polices et ombres du thème.

## Images

Les visuels sont déclarés dans `lib/images.ts` et stockés dans `public/images/`. Ce sont des visuels officiels de GTA VI récupérés sur rockstargames.com ; ils appartiennent à Rockstar Games. Pour en changer un, remplace le fichier ou modifie son chemin.

## À ajuster

Le nom, les tarifs, les quotas par offre et les « 3 shorts offerts » sont des propositions de départ.
