

import fs from "node:fs/promises";
import path from "node:path";

const PAVILLON_FICHIER =
  process.env.PAVILLON_FICHIER || "/data/pavillon.txt";


/**
 * POST /pavillon
 */
export async function definirPavillon(req, res) {
  const message = req.body?.message;

  if (!message || typeof message !== "string") {
    return res.status(400).json({
      error: "Le pavillon est obligatoire",
    });
  }

  const pavillon = message.trim();

  if (pavillon.length === 0) {
    return res.status(400).json({
      error: "Le pavillon ne peut pas être vide",
    });
  }

  if (pavillon.length > 140) {
    return res.status(400).json({
      error: "Le pavillon ne peut pas dépasser 140 caractères",
    });
  }

  try {
    const dossier = path.dirname(PAVILLON_FICHIER);

    await fs.mkdir(dossier, {
      recursive: true,
    });

    await fs.writeFile(
      PAVILLON_FICHIER,
      pavillon,
      "utf8"
    );

    return res.status(201).json({
      message: "Pavillon enregistré",
      pavillon,
    });
  } catch (error) {
    console.error("[pavillon] Erreur écriture :", error);

    return res.status(500).json({
      error: "Impossible d'enregistrer le pavillon",
    });
  }
}



/**
 * GET /pavillon
 */
export async function getPavillon(req, res) {
  try {
    const contenu = await fs.readFile(
      PAVILLON_FICHIER,
      "utf8"
    );

    return res.status(200).json({
      pavillon: contenu.trim(),
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      return res.status(200).json({
        pavillon: "",
      });
    }

    console.error("[pavillon] Erreur lecture :", error);

    return res.status(500).json({
      error: "Impossible de lire le pavillon",
    });
  }
}