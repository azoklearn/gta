#!/bin/sh
# Lance le serveur et s'arrête proprement quand l'hébergeur le remplace : sans cela, chaque
# redéploiement est signalé à tort comme un plantage de l'ancienne version.
node node_modules/next/dist/bin/next start &
pid=$!
trap 'kill -TERM "$pid" 2>/dev/null; wait "$pid"; exit 0' TERM INT
wait "$pid"
