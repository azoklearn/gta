#!/usr/bin/env python3
"""Repère la facecam d'un streamer dans une vidéo.

Usage : facecam.py <vidéo> <durée en secondes> [ffmpeg]

Écrit sur la sortie standard un objet JSON : {"found": false} si aucune facecam n'est repérée, sinon
{"found": true, "rect": {x, y, w, h}, "face": {x, y, w, h}, "boxed": bool, "presence": 0..1}
avec des coordonnées exprimées en fractions de la largeur et de la hauteur de l'image (0 à 1).

Méthode :
1. Des images sont prélevées à intervalles réguliers sur toute la vidéo.
2. Un visage qui revient au même endroit sur une bonne partie d'entre elles est celui du streamer :
   les visages du jeu, eux, changent de place et de taille.
3. Le cadre de la facecam est la zone qui reste presque immobile autour de ce visage (le décor de la
   pièce ne bouge pas), alors que le jeu change sans cesse d'une image à l'autre. Ses côtés sont ensuite
   recalés sur les bords nets de l'incrustation.
"""

import json
import subprocess
import sys

import cv2
import numpy as np

SAMPLES = 44
DETECT_W, DETECT_H = 960, 540  # taille des images pour la détection des visages
MAP_W, MAP_H = 320, 180  # taille de la carte de mouvement
MIN_PRESENCE = 0.3  # part minimale des images où le visage doit être retrouvé


def grab(video, at, ffmpeg):
    """Lit une image de la vidéo, en niveaux de gris."""
    out = subprocess.run(
        [ffmpeg, "-v", "error", "-ss", f"{at:.2f}", "-i", video, "-frames:v", "1",
         "-vf", f"scale={DETECT_W}:{DETECT_H}", "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        capture_output=True,
    ).stdout
    if len(out) != DETECT_W * DETECT_H:
        return None
    return np.frombuffer(out, np.uint8).reshape(DETECT_H, DETECT_W)


def recurring_face(detections, frame_count):
    """Cherche le visage qui revient au même endroit. `detections` : liste de (image, x, y, w, h)."""
    best = []
    for _, x, y, w, h in detections:
        cx, cy = x + w / 2, y + h / 2
        group = [
            d for d in detections
            if abs(d[1] + d[3] / 2 - cx) < 0.5 * w and abs(d[2] + d[4] / 2 - cy) < 0.5 * h and 0.6 < d[3] / w < 1.65
        ]
        if len({d[0] for d in group}) > len({d[0] for d in best}):
            best = group
    presence = len({d[0] for d in best}) / max(1, frame_count)
    if presence < MIN_PRESENCE:
        return None, presence
    box = np.median(np.array([d[1:] for d in best], dtype=np.float32), axis=0)
    return box, presence


def still_area(motion, face):
    """Étend un cadre autour du visage tant que l'image y reste presque immobile."""
    h, w = motion.shape
    fx, fy, fw, fh = face
    # Point de départ : le visage, élargi aux épaules et au casque.
    x0 = int(max(0, fx - 0.6 * fw))
    x1 = int(min(w, fx + 1.6 * fw))
    y0 = int(max(0, fy - 0.4 * fh))
    y1 = int(min(h, fy + 2.0 * fh))
    game_level = float(np.median(motion))
    limit = max(6.0, 0.45 * game_level)
    look_ahead = 4

    def quiet(line):
        return float(np.percentile(line, 40)) < limit

    for _ in range(max(w, h)):
        grown = False
        for step in range(1, look_ahead + 1):
            if x0 - step >= 0 and quiet(motion[y0:y1, x0 - step]):
                x0 -= step
                grown = True
                break
        for step in range(1, look_ahead + 1):
            if x1 + step <= w and quiet(motion[y0:y1, x1 + step - 1]):
                x1 += step
                grown = True
                break
        for step in range(1, look_ahead + 1):
            if y0 - step >= 0 and quiet(motion[y0 - step, x0:x1]):
                y0 -= step
                grown = True
                break
        for step in range(1, look_ahead + 1):
            if y1 + step <= h and quiet(motion[y1 + step - 1, x0:x1]):
                y1 += step
                grown = True
                break
        if not grown:
            break
    return x0, y0, x1, y1


def snap_to_borders(frames, box, face):
    """Recale chaque côté du cadre sur le bord réel de la facecam, s'il y en a un.

    Le bord d'une incrustation forme une ligne nette sur toute sa longueur et sur toutes les images, ce qui
    le distingue des contours du décor (qui ne couvrent qu'une partie de la ligne). Cela corrige les cas où
    le jeu voisin est lui aussi presque immobile, par exemple un ciel, et où le cadre a débordé.
    """
    x0, y0, x1, y1 = box
    fx, fy, fw, fh = face
    edge_rows = np.abs(np.diff(frames, axis=1)).mean(axis=0)  # ligne y : contraste entre y et y + 1
    edge_cols = np.abs(np.diff(frames, axis=2)).mean(axis=0)
    strong, covered = 9.0, 0.7

    def best(lines, candidates):
        scores = [(float((lines[i] > strong).mean()), i) for i in candidates]
        score, index = max(scores, default=(0.0, None))
        return index if score >= covered else None

    top = best(edge_rows[:, x0:x1], range(max(0, y0 - 1), max(0, int(fy - 0.2 * fh))))
    bottom = best(edge_rows[:, x0:x1], range(min(y1 - 1, int(fy + 1.1 * fh)), min(edge_rows.shape[0], y1)))
    if top is not None:
        y0 = top + 1
    if bottom is not None:
        y1 = bottom + 1
    left = best(edge_cols[y0:y1].T, range(max(0, x0 - 1), max(0, int(fx - 0.3 * fw))))
    right = best(edge_cols[y0:y1].T, range(min(x1 - 1, int(fx + 1.3 * fw)), min(edge_cols.shape[1], x1)))
    if left is not None:
        x0 = left + 1
    if right is not None:
        x1 = right + 1
    return x0, y0, x1, y1


def main():
    video, duration = sys.argv[1], float(sys.argv[2])
    ffmpeg = sys.argv[3] if len(sys.argv) > 3 else "ffmpeg"
    cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_alt2.xml")

    frames = []
    for i in range(SAMPLES):
        frame = grab(video, duration * (0.04 + 0.92 * i / (SAMPLES - 1)), ffmpeg)
        if frame is not None:
            frames.append(frame)
    if len(frames) < 8:
        print(json.dumps({"found": False, "reason": "images illisibles"}))
        return

    detections = []
    for index, frame in enumerate(frames):
        for x, y, w, h in cascade.detectMultiScale(frame, scaleFactor=1.1, minNeighbors=4, minSize=(28, 28)):
            detections.append((index, float(x), float(y), float(w), float(h)))

    face, presence = recurring_face(detections, len(frames))
    if face is None:
        print(json.dumps({"found": False, "presence": round(presence, 2)}))
        return

    small = np.stack([cv2.resize(f, (MAP_W, MAP_H), interpolation=cv2.INTER_AREA) for f in frames]).astype(np.float32)
    motion = small.std(axis=0)
    scale = MAP_W / DETECT_W
    x0, y0, x1, y1 = snap_to_borders(small, still_area(motion, face * scale), face * scale)

    fx, fy, fw, fh = (float(v) for v in face)
    face_out = {"x": fx / DETECT_W, "y": fy / DETECT_H, "w": fw / DETECT_W, "h": fh / DETECT_H}
    rect = {"x": x0 / MAP_W, "y": y0 / MAP_H, "w": (x1 - x0) / MAP_W, "h": (y1 - y0) / MAP_H}
    # Un cadre crédible entoure largement le visage sans couvrir presque tout l'écran. Sinon le streamer
    # est sans doute incrusté sans cadre (fond vert) : seul son visage sert de repère.
    area = rect["w"] * rect["h"]
    boxed = rect["w"] > 1.8 * face_out["w"] and 0.012 < area < 0.5
    print(json.dumps({"found": True, "rect": rect, "face": face_out, "boxed": bool(boxed), "presence": round(presence, 2)}))


if __name__ == "__main__":
    main()
