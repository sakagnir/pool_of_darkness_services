// pouls.js — le battement de cœur du service vers le tableau de la classe.
//
// Code fourni par le cours (Partie 5, Palier 1 / Phase 2). À importer depuis
// chaque service qui doit tenir un carré au tableau.
//
// Le service appelle le tableau à intervalle régulier pour dire « je suis
// vivant ». La réponse du tableau contient le nombre de COUPS à encaisser,
// que le service envoie vers sa propre route /travail.

import os from "node:os";
import fs from "node:fs";

import { config } from "./config.js";

const TABLEAU = config.tableauUrl;
const GROUPE = config.groupe;
const COULEUR = config.couleur;
const SERVICE = config.service;
const VERSION = config.version;
const PAVILLON = config.pavillonFichier;
const MOI = config.urlInterne;

// Depuis le démarrage de ce process (affiché sur le carré).
let totalEncaisse = 0;
// Encaissés depuis le dernier pouls — ce que le tableau attend.
let aDeclarer = 0;

// Le pavillon est relu du disque à chaque pouls : s'il vit dans un volume, il
// traverse le redéploiement, sinon il disparaît du tableau devant toute la
// classe.
function lirePavillon() {
  try {
    return fs.readFileSync(PAVILLON, "utf8").trim();
  } catch {
    return "";
  }
}

// Un coup est une vraie requête sur sa propre route de travail. Les coups
// partent par paquets de dix en parallèle, sinon un gros retard bloquerait le
// pouls suivant.
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
    const reponse = await fetch(`${TABLEAU}/api/pulse`, {
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
    // Les coups déclarés ne sont retirés du compteur local qu'une fois le
    // tableau au courant : si l'appel échoue, ils repartiront dans le pouls
    // suivant.
    aDeclarer -= declares;
    const ordre = await reponse.json();
    attente = ordre.prochain_pulse_ms || 5000;
    if (ordre.coups_a_encaisser > 0) await encaisser(ordre.coups_a_encaisser);
  } catch (erreur) {
    console.error("[pouls] tableau injoignable :", erreur.message);
  }
  setTimeout(envoyerPouls, attente);
}

// Appeler une fois au démarrage du service. Sans TABLEAU_URL, GROUPE ou
// SERVICE, on ne bloque pas le démarrage : on loggue et on laisse tourner
// (règle J5 : un service ne démarre jamais en silence avec une config
// incomplète, mais il ne s'écroule pas non plus).
export function demarrerLePouls() {
  if (!TABLEAU || !GROUPE || !SERVICE) {
    console.error(
      "[pouls] TABLEAU_URL, GROUPE et SERVICE sont obligatoires — pouls désactivé"
    );
    return;
  }
  console.log(`[pouls] ${GROUPE}/${SERVICE} vers ${TABLEAU}`);
  envoyerPouls();
}
