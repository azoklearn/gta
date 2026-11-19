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
- `components/UrlForm.tsx` : champ de lien YouTube. Il valide le lien et affiche un aperçu des cadrages 9:16 ; le découpage réel reste à brancher côté serveur.
- `components/Earnings.tsx` : simulateur de revenus TikTok (shorts par jour × vues × RPM).
- `app/globals.css` : couleurs et polices du thème.

## Images

Les emplacements d'images sont déclarés dans `lib/images.ts` et les fichiers sont dans `public/images/`. Ce sont des visuels officiels de GTA VI récupérés sur rockstargames.com ; ils appartiennent à Rockstar Games. Pour en changer un, remplace le fichier ou modifie son chemin. Une entrée à `null` affiche à la place une illustration vectorielle (`components/ViceScene.tsx`).

## À ajuster

Le nom, les tarifs, les quotas par offre et les « 3 shorts offerts » sont des propositions de départ.
