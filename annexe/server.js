// server.js — service ANNEXE : détection de doublons dans la file karaoké.
//
// Travail distinct du front et de l'api : il lit la file en base et repère
// les inscriptions où (chanson + artiste) existent déjà — pour prévenir les
// doublons. Expose le résultat et tient son carré au tableau.

import express from "express";
import mariadb from "mariadb";

import { demarrerLePouls } from "./pouls.js";

const PORT = Number(process.env.PORT || 8000);
const SERVICE = process.env.SERVICE || "annexe";
const VERSION = process.env.VERSION || "dev";

const pool = mariadb.createPool({
  host: process.env.DB_HOST || "db",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "karaoke",
  password: process.env.DB_PASSWORD || "karaoke",
  database: process.env.DB_NAME || "karaoke",
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
});

const app = express();

// Santé — vérifie aussi que la base répond (sonde honnête, règle J5)
app.get("/health", async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query("SELECT 1");
    conn.release();
    res.json({ status: "ok", service: SERVICE, version: VERSION, db: "up" });
  } catch (e) {
    res.status(503).json({ status: "error", service: SERVICE, db: "down" });
  }
});

// La route métier : les doublons de chansons dans la file
app.get("/doublons", async (req, res) => {
  try {
    const rows = await pool.query(`
      SELECT chanson, artiste, COUNT(*) AS nb
      FROM file_karaoke
      GROUP BY chanson, artiste
      HAVING COUNT(*) > 1
      ORDER BY nb DESC
    `);
    res.json({ doublons: rows });
  } catch (e) {
    res.status(503).json({ error: "base indisponible" });
  }
});

// Route /travail — encaisse les coups du tableau (petit vrai travail : une
// vraie requête en base)
app.get("/travail", async (req, res) => {
  const debut = Date.now();
  try {
    const rows = await pool.query(`
      SELECT COUNT(*) AS total FROM file_karaoke
    `);
    const duree = Date.now() - debut;
    res.json({
      ok: true,
      travail: "annexe-doublons",
      total_inscriptions: Number(rows[0].total),
      duree_ms: duree,
    });
  } catch (e) {
    res.status(503).json({ ok: false, error: "base indisponible" });
  }
});

app.listen(PORT, () => {
  console.log(
    `[annexe] ${SERVICE} écoute sur le port ${PORT} (version ${VERSION})`
  );
  demarrerLePouls();
});
