// index.js — point d'entrée du service.
//
// Démarre le serveur HTTP (Express) PUIS lance le pouls vers le tableau.
// Le pouls ne bloque jamais le démarrage : si TABLEAU_URL / GROUPE / SERVICE
// manquent, le service tourne quand même (règle J5) et le log le dit.

import app from "./server.js";
import { config } from "./config.js";
import { demarrerLePouls } from "./pouls.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(
    `[api] ${config.service} écoute sur le port ${PORT} (version ${config.version})`
  );

  // Lance le battement de cœur vers le tableau de la classe.
  demarrerLePouls();
});
