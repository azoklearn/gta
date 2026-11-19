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

Les emplacements d'images sont déclarés dans `lib/images.ts`. Tant qu'un emplacement vaut `null`, une illustration vectorielle (`components/ViceScene.tsx`) est affichée. Pour utiliser un visuel, dépose le fichier dans `public/images/` et renseigne son chemin :

```ts
export const gameImages = {
  hero: "/images/hero.jpg",
  source: "/images/source.jpg",
  clips: ["/images/clip-1.jpg", "/images/clip-2.jpg", "/images/clip-3.jpg"],
};
```

## À ajuster

Le nom, les tarifs, les quotas par offre et les « 3 shorts offerts » sont des propositions de départ.
