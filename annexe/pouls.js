// pouls.js — le battement de cœur du service ANNEXE (détection de doublons).
//
// Même logique que les autres services (code du cours, Partie 5) avec les
// variables propres au service annexe.

import os from "node:os";
import fs from "node:fs";

const TABLEAU = process.env.TABLEAU_URL;
const GROUPE = process.env.GROUPE;
const COULEUR = process.env.COULEUR || "#888888";
const SERVICE = process.env.SERVICE || "annexe";
const VERSION = process.env.VERSION || "dev";
const PAVILLON = process.env.PAVILLON_FICHIER || "/data/pavillon.txt";
const MOI = process.env.URL_INTERNE || "http://localhost:8000";

let totalEncaisse = 0;
let aDeclarer = 0;

function lirePavillon() {
  try {
    return fs.readFileSync(PAVILLON, "utf8").trim();
  } catch {
    return "";
  }
}

async function encaisser(nombre) {
  const aFaire = Math.min(nombre, 300);
  for (let debut = 0; debut < aFaire; debut += 10) {
    const paquet = [];
    for (let i = debut; i < Math.min(debut + 10, aFaire); i++) {
      paquet.push(
        fetch(`${MOI}/travail`)
          .then((reponse) => {
            if (reponse.ok) {
              totalEncaisse++;
              aDeclarer++;
            }
          })
          .catch(() => {})
      );
    }
    await Promise.all(paquet);
  }
}

async function envoyerPouls() {
  let attente = 5000;
  const declares = aDeclarer;
  try {
    const reponse = await fetch(`${TABLEAU}/api/pouls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupe: GROUPE,
        couleur: COULEUR,
        service: SERVICE,
        pod: os.hostname(),
        version: VERSION,
        pavillon: lirePavillon(),
        encaisses: declares,
        total_encaisse: totalEncaisse,
      }),
    });
    aDeclarer -= declares;
    const ordre = await reponse.json();
    attente = ordre.prochain_pouls_ms || 5000;
    if (ordre.coups_a_encaisser > 0) await encaisser(ordre.coups_a_encaisser);
  } catch (erreur) {
    console.error("[pouls-annexe] tableau injoignable :", erreur.message);
  }
  setTimeout(envoyerPouls, attente);
}

export function demarrerLePouls() {
  if (!TABLEAU || !GROUPE || !SERVICE) {
    console.error(
      "[pouls-annexe] TABLEAU_URL, GROUPE et SERVICE sont obligatoires — pouls désactivé"
    );
    return;
  }
  console.log(`[pouls-annexe] ${GROUPE}/${SERVICE} vers ${TABLEAU}`);
  envoyerPouls();
}
