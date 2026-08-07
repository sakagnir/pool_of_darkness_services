
import pool from "../db/db.js";

/**
 * GET /file
 * awaiting List
 */
export async function getQueue(req, res) {
  try {
    const rows = await pool.execute(`
      SELECT
        id,
        nom,
        chanson,
        artiste,
        statut,
        position,
        created_at
      FROM file_karaoke
      WHERE statut = 'EN_ATTENTE'
      ORDER BY position ASC, created_at ASC
    `);

    return res.status(200).json(rows);
  } catch (error) {
    console.error("[file] Erreur récupération :", error);

    return res.status(500).json({
      error: "Impossible de récupérer la file",
    });
  }
}

/**
 * POST /file
 * Subscription to the file
 */
export async function subscribeToQueue(req, res) {
  const { nom, chanson, artiste } = req.body;

  if (!nom || !chanson ||  !artiste) {
    return res.status(400).json({
      error: "Le nom et la chanson sont obligatoires",
    });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const positionRows = await connection.execute(`
      SELECT COALESCE(MAX(position), 0) + 1 AS prochaine_position
      FROM file_karaoke
      WHERE statut = 'EN_ATTENTE'
    `);

    const position = Number(positionRows[0].prochaine_position);

    const result = await connection.execute(
      `
      INSERT INTO file_karaoke
        (nom, chanson, artiste, statut, position)
      VALUES
        (?, ?, ?, 'EN_ATTENTE', ?)
      `,
      [nom.trim(), chanson.trim(), artiste?.trim() || null, position]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Inscription réussie",
      participant: {
        id: Number(result.insertId),
        nom,
        chanson,
        artiste: artiste || null,
        position,
        statut: "EN_ATTENTE",
      },
    });
  } catch (error) {
    await connection.rollback();

    console.error("[file] Erreur inscription :", error);

    return res.status(500).json({
      error: "Impossible de vous inscrire",
    });
  } finally {
    connection.release();
  }
}


/**
 * POST /file/:id/pass
 * Complete one turn
 */
export async function CompleteTour(req, res) {
  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const rows = await connection.execute(
      `
      SELECT id, position
      FROM file_karaoke
      WHERE id = ?
        AND statut = 'EN_ATTENTE'
      FOR UPDATE
      `,
      [id]
    );

    if (rows.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Participant introuvable dans la file",
      });
    }

    const anciennePosition = rows[0].position;

    await connection.execute(
      `
      UPDATE file_karaoke
      SET statut = 'PASSE'
      WHERE id = ?
      `,
      [id]
    );

    await connection.execute(
      `
      UPDATE file_karaoke
      SET position = position - 1
      WHERE statut = 'EN_ATTENTE'
        AND position > ?
      `,
      [anciennePosition]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Tour passé",
    });
  } catch (error) {
    await connection.rollback();

    console.error("[file] Erreur passage :", error);

    return res.status(500).json({
      error: "Impossible de passer le tour",
    });
  } finally {
    connection.release();
  }
}



/**
 * POST /file/:id/chanter
 * Make the current participant pass
 */
export async function startSinging(req, res) {
  const { id } = req.params;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(`
      UPDATE file_karaoke
      SET statut = 'TERMINE'
      WHERE statut = 'EN_COURS'
    `);

    const result = await connection.execute(
      `
      UPDATE file_karaoke
      SET statut = 'EN_COURS'
      WHERE id = ?
        AND statut = 'EN_ATTENTE'
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();

      return res.status(404).json({
        error: "Participant introuvable",
      });
    }

    await connection.commit();

    return res.status(200).json({
      message: "Participant passé en cours",
    });
  } catch (error) {
    await connection.rollback();

    console.error("[file] Erreur démarrage :", error);

    return res.status(500).json({
      error: "Impossible de démarrer la chanson",
    });
  } finally {
    connection.release();
  }
}



/**
 * GET /prochains
 *
 * Returns:
 * - the current singer
 * - the next singers
 */
export async function getProchains(req,res){
    try {
        // current signer
        const actuel = await pool.execute(`
            SELECT
                id,
                nom,
                chanson,
                artiste
            FROM file_karaoke
            WHERE statut='EN_COURS'
            LIMIT 1
        `);

        // - 3 next
        const nexts = await pool.execute(`
            SELECT
                id,
                nom,
                chanson,
                artiste,
                position
            FROM file_karaoke
            WHERE statut='EN_ATTENTE'
            ORDER BY position ASC
            LIMIT 3
        `);


        return res.status(200).json({
            actuel:
                actuel.length
                ? actuel[0]
                : null,

            nexts
        });

    }
    catch(error){
        console.error(
            "[prochains]",
            error
        );

        return res.status(500)
                  .json({
                      error: "Impossible de récupérer les prochains"
                  });
    }
}