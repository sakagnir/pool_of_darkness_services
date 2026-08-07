// server.js — le service FRONT.
//
// Sert la page web (fichiers statiques) et tient son carré au tableau :
// - route de santé /health
// - route /travail (encaisser les coups envoyés par le tableau)
// - pouls vers le tableau au démarrage

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { demarrerLePouls } from "./pouls.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 8080);
const SERVICE = process.env.SERVICE || "front";
const VERSION = process.env.VERSION || "dev";
// L'URL de l'API, injectée par le compose (jamais en dur dans le code)
const API_URL = process.env.API_URL || "http://localhost:3100";

const app = express();

// Fichiers statiques de la page web
app.use(express.static(__dirname));

// Expose la config au front (API_URL) sans URL en dur dans le JS du client
app.get("/config", (req, res) => {
  res.json({ apiUrl: API_URL });
});

// Route de santé — le service répond
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: SERVICE, version: VERSION });
});

// Route /travail — encaisse les coups du tableau (petit vrai travail)
app.get("/travail", (req, res) => {
  // Un petit travail réel : compter les fichiers statiques servis est trivial ;
  // on simule un calcul court pour que la requête coûte quelques ms.
  const debut = Date.now();
  let total = 0;
  for (let i = 0; i < 100000; i++) {
    total += i;
  }
  const duree = Date.now() - debut;
  res.json({ ok: true, travail: "front", duree_ms: duree, total });
});

app.listen(PORT, () => {
  console.log(
    `[front] ${SERVICE} écoute sur le port ${PORT} (version ${VERSION})`
  );
  demarrerLePouls();
});
