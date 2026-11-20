"use client";

import { useSyncExternalStore } from "react";
import { apiUrl } from "./api";
import type { Account, PlanId } from "./plans";

/** État du compte côté navigateur : la session est gardée dans le stockage local du navigateur. */
type State = { status: "loading" | "guest" | "ready"; account: Account | null };

const TOKEN_KEY = "viceclip.session";
const PENDING_URL = "viceclip.lien";
const PENDING_PLAN = "viceclip.offre";

let state: State = { status: "loading", account: null };
const SERVER_STATE: State = { status: "loading", account: null };
const listeners = new Set<() => void>();
let started = false;

function set(next: State) {
  state = next;
  listeners.forEach((listener) => listener());
}

function readToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Stockage indisponible (navigation privée stricte) : la session ne durera que le temps de la page.
  }
}

export type Reply<T> = { ok: boolean; status: number; data: T & { error?: string } };

/** Appelle l'API en joignant la session. Ne lève jamais d'exception : une panne devient un message d'erreur. */
export async function call<T = Record<string, unknown>>(path: string, body?: unknown): Promise<Reply<T>> {
  const token = readToken();
  try {
    const res = await fetch(apiUrl(path), {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
    const text = await res.text();
    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      // Réponse vide ou page d'erreur de l'hébergeur.
    }
    if (!data || typeof data !== "object") {
      data = { error: `Le serveur ne répond pas correctement (erreur ${res.status}). Réessaie dans un instant.` };
    }
    return { ok: res.ok, status: res.status, data: data as T & { error?: string } };
  } catch {
    return {
      ok: false,
      status: 0,
      data: { error: "Impossible de joindre le serveur. Vérifie ta connexion et réessaie." } as T & { error?: string },
    };
  }
}

/** Recharge le compte depuis le serveur. */
export async function refreshAccount(): Promise<Account | null> {
  if (!readToken()) {
    set({ status: "guest", account: null });
    return null;
  }
  const reply = await call<Account>("/api/me");
  if (reply.ok) {
    set({ status: "ready", account: reply.data });
    return reply.data;
  }
  if (reply.status === 401) {
    writeToken(null);
    set({ status: "guest", account: null });
  }
  return null;
}

/** Crée un compte ou ouvre une session. Renvoie un message d'erreur, ou `null` si tout s'est bien passé. */
export async function authenticate(mode: "signup" | "login", email: string, password: string): Promise<string | null> {
  const reply = await call<{ token: string; account: Account }>(`/api/auth/${mode}`, { email, password });
  if (!reply.ok || !reply.data.token) return reply.data.error ?? "La connexion a échoué.";
  writeToken(reply.data.token);
  set({ status: "ready", account: reply.data.account });
  return null;
}

export async function signOut(): Promise<void> {
  await call("/api/auth/logout", {});
  writeToken(null);
  set({ status: "guest", account: null });
}

export function isSignedIn(): boolean {
  return Boolean(readToken());
}

/** Compte de l'utilisateur, tenu à jour dans tous les composants qui l'utilisent. */
export function useAccount(): State {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      if (!started) {
        started = true;
        void refreshAccount();
      }
      return () => listeners.delete(listener);
    },
    () => state,
    () => SERVER_STATE,
  );
}

/* Ce que l'utilisateur voulait faire avant qu'on lui demande de se connecter. */

function stash(key: string, value: string | null) {
  try {
    if (value) window.sessionStorage.setItem(key, value);
    else window.sessionStorage.removeItem(key);
  } catch {
    // Sans stockage de session, l'utilisateur recollera simplement son lien.
  }
}

function take(key: string): string | null {
  try {
    const value = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    return value;
  } catch {
    return null;
  }
}

export const rememberUrl = (url: string) => stash(PENDING_URL, url);
export const rememberPlan = (plan: PlanId) => stash(PENDING_PLAN, plan);

/** Lien collé avant l'inscription ou le paiement, encore en attente de découpage. */
export function pendingUrl(): string | null {
  try {
    return window.sessionStorage.getItem(PENDING_URL);
  } catch {
    return null;
  }
}

/** Oublie le lien en attente, une fois la vidéo envoyée. */
export const forgetUrl = () => stash(PENDING_URL, null);

/** Ce que le site sait d'une vidéo YouTube à partir de son lien. */
export interface VideoPreview {
  id: string;
  title: string | null;
  channel: string | null;
  thumbnail: string;
}

/** Reconnaît une vidéo YouTube : miniature, et titre et chaîne quand YouTube les donne. */
export async function lookupVideo(url: string): Promise<VideoPreview | null> {
  try {
    const reply = await fetch(apiUrl(`/api/video?url=${encodeURIComponent(url)}`));
    return reply.ok ? ((await reply.json()) as VideoPreview) : null;
  } catch {
    return null;
  }
}

/** Lance le découpage d'une vidéo. Renvoie l'identifiant du projet, ou un message d'erreur. */
export async function startJob(url: string): Promise<{ id?: string; error?: string; status: number }> {
  const reply = await call<{ id?: string }>("/api/jobs", { url });
  if (reply.ok && reply.data.id) {
    void refreshAccount();
    return { id: reply.data.id, status: reply.status };
  }
  return { error: reply.data.error ?? "Le découpage n'a pas pu être lancé.", status: reply.status };
}

/**
 * Envoie un fichier vidéo au serveur et lance son découpage. Sert de secours quand YouTube refuse
 * de fournir la vidéo. `onProgress` reçoit l'avancement de l'envoi, de 0 à 1.
 */
export function uploadVideo(
  file: File,
  onProgress: (ratio: number) => void,
  video?: { url?: string | null; title?: string | null; channel?: string | null },
): Promise<{ id?: string; error?: string }> {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();
    request.open("POST", apiUrl("/api/jobs/upload"));
    const token = readToken();
    if (token) request.setRequestHeader("Authorization", `Bearer ${token}`);
    request.setRequestHeader("Content-Type", "application/octet-stream");
    request.setRequestHeader("X-Filename", encodeURIComponent(file.name));
    // La vidéo YouTube d'où vient le fichier : son titre nomme le projet, son lien sert aux sous-titres.
    if (video?.url) request.setRequestHeader("X-Source-Url", encodeURIComponent(video.url));
    if (video?.title) request.setRequestHeader("X-Title", encodeURIComponent(video.title));
    if (video?.channel) request.setRequestHeader("X-Channel", encodeURIComponent(video.channel));
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    request.onerror = () => resolve({ error: "L'envoi a été interrompu. Vérifie ta connexion et réessaie." });
    request.onload = () => {
      let data: { id?: string; error?: string } = {};
      try {
        data = JSON.parse(request.responseText);
      } catch {
        // Réponse illisible : traitée comme un échec ci-dessous.
      }
      if (request.status < 300 && data.id) {
        void refreshAccount();
        resolve({ id: data.id });
      } else {
        resolve({ error: data.error ?? "Le fichier n'a pas pu être envoyé." });
      }
    };
    request.send(file);
  });
}

/** Ouvre la page de paiement Mollie pour une offre. Renvoie un message d'erreur si elle n'a pas pu être préparée. */
export async function startCheckout(plan: PlanId): Promise<string | null> {
  const reply = await call<{ checkoutUrl?: string }>("/api/billing/checkout", { plan });
  if (reply.ok && reply.data.checkoutUrl) {
    window.location.assign(reply.data.checkoutUrl);
    return null;
  }
  return reply.data.error ?? "Le paiement n'a pas pu être préparé.";
}

/**
 * Après une connexion, reprend là où l'utilisateur s'était arrêté : paiement d'une offre choisie,
 * découpage du lien collé, ou à défaut sa page de compte. Renvoie la page où aller, ou un message d'erreur.
 */
export async function resumeAfterAuth(): Promise<{ goTo?: string; error?: string }> {
  const plan = take(PENDING_PLAN) as PlanId | null;
  if (plan) {
    const error = await startCheckout(plan);
    return error ? { goTo: "/compte", error } : {};
  }
  // Un lien est en attente : avec des shorts disponibles, direction l'envoi de la vidéo ; sinon les offres.
  // Le lien reste de côté jusqu'à ce que la vidéo soit envoyée.
  if (pendingUrl()) {
    const account = await refreshAccount();
    return { goTo: (account?.credits ?? 0) > 0 ? "/importer" : "/#tarifs" };
  }
  return { goTo: "/compte" };
}
