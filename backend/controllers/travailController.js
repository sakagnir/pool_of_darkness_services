

import pool from "../db/db.js";


/**
 * GET /travail
 *
 * The path used by the pulse to generate load.
 *
 * It performs actual work:
 * - MariaDB read
 * - calculation
 * - aggregation
 */export async function work(req, res) {
  const debut = performance.now();

  try {
    const rows = await pool.execute(`
      SELECT
        statut,
        COUNT(*) AS total
      FROM file_karaoke
      GROUP BY statut
    `);

    let total = 0;

    const statistiques = rows.map((ligne) => {
      const totalStatut = Number(ligne.total);

      total += totalStatut;

      return {
        statut: ligne.statut,
        total: totalStatut
      };
    });

    const duree = Math.round(
      performance.now() - debut
    );

    return res.status(200).json({
      ok: true,
      totalParticipants: total,
      statistiques,
      duree_ms: duree,
    });

  } catch (error) {
    console.error("[travail] Erreur :", error);

    return res.status(503).json({
      ok: false,
      error: "Travail impossible : base de données indisponible",
    });
  }
}