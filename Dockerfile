# Image de production : Next.js + ffmpeg + yt-dlp dans un seul conteneur.
FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg python3 python3-pip ca-certificates \
  && pip3 install --no-cache-dir --break-system-packages yt-dlp \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Les vidéos en cours et les shorts sont écrits ici : monte un volume pour les conserver.
ENV VICECLIP_DATA_DIR=/data
VOLUME /data
EXPOSE 3000
CMD ["npm", "run", "start"]
