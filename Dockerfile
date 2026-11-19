# Image de production : Next.js + ffmpeg + yt-dlp dans un seul conteneur.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates \
  && pip3 install --no-cache-dir --break-system-packages "yt-dlp[default]" "opencv-python-headless==4.12.0.88" \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Les vidéos en cours et les shorts sont écrits ici. Monte un volume sur ce dossier pour les conserver
# entre deux déploiements (l'instruction VOLUME n'est pas utilisée : certains hébergeurs la refusent).
ENV VICECLIP_DATA_DIR=/data
EXPOSE 3000
CMD ["npm", "run", "start"]
