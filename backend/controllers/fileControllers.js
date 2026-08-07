import { query } from "../db/db.js";


// --------------------------------------------
// GET /file
// Retrive current queue
// -----------------------------------------------

export async function getFile(req, res, next) {
    try {
        const result = await query(`
            SELECT
                id,
                nom,
                chanson,
                artiste,
                position,
                statut,
                created_at
            FROM file_karaoke
            WHERE statut = 'en_attente'
            ORDER BY position ASC
        `);

        res.json(result.rows);

    } catch (error) {

        next(error);
    }
}


// -----------------------------------------------
// POST /file
// Add someone into the queue
// ----------------------------------------------

export async function inscrire(req, res, next) {

    try {

        const {
            nom,
            chanson,
            artiste
        } = req.body;

        // Validation
        if (!nom || !chanson || !artiste) {

            return res.status(400).json({
                message:
                    "Le nom, la chanson et l'artiste sont obligatoires."
            });
        }

        const nomPropre = String(nom).trim();
        const chansonPropre = String(chanson).trim();
        const artistePropre = String(artiste).trim();

        if (
            !nomPropre ||
            !chansonPropre ||
            !artistePropre
        ) {

            return res.status(400).json({
                message: "Les champs ne peuvent pas être vides."
            });
        }

        //-- Last element
        const positionResult = await query(`
            SELECT COALESCE(MAX(position), 0) + 1 AS position
            FROM file_karaoke
            WHERE statut = 'en_attente'
        `);

        const position =
            Number(positionResult.rows[0].position);

        // Inscription
        const result = await query(`
            INSERT INTO file_karaoke
                (nom, chanson, artiste, position)
            VALUES
                ($1, $2, $3, $4)
            RETURNING
                id,
                nom,
                chanson,
                artiste,
                position,
                statut,
                created_at
        `, [
            nomPropre,
            chansonPropre,
            artistePropre,
            position
        ]);

        res.status(201).json(result.rows[0]);

    } catch (error) {

        next(error);
    }
}


// ============================================================
// POST /file/:id/passer
// Faire passer un chanteur
// ============================================================

export async function passer(req, res, next) {

    const client = await import("../db.js")
        .then(module => module.pool.connect());

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {

            return res.status(400).json({
                message: "Identifiant invalide."
            });
        }

        await client.query("BEGIN");

        // Récupérer le participant
        const participant = await client.query(`
            SELECT *
            FROM file_karaoke
            WHERE id = $1
            AND statut = 'en_attente'
            FOR UPDATE
        `, [id]);

        if (participant.rows.length === 0) {

            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Participant introuvable."
            });
        }

        // Marquer comme terminé
        await client.query(`
            UPDATE file_karaoke
            SET statut = 'termine'
            WHERE id = $1
        `, [id]);

        // Réorganiser les positions
        await client.query(`
            UPDATE file_karaoke
            SET position = position - 1
            WHERE statut = 'en_attente'
            AND position > (
                SELECT position
                FROM file_karaoke
                WHERE id = $1
            )
        `, [id]);

        await client.query("COMMIT");

        res.json({
            message: "Le participant est passé.",
            participant: participant.rows[0]
        });

    } catch (error) {

        await client.query("ROLLBACK");

        next(error);

    } finally {

        client.release();
    }
}


// ============================================================
// DELETE /file/:id
// Retirer quelqu'un de la file
// ============================================================

export async function supprimer(req, res, next) {

    try {

        const id = Number(req.params.id);

        if (!Number.isInteger(id)) {

            return res.status(400).json({
                message: "Identifiant invalide."
            });
        }

        const result = await query(`
            DELETE FROM file_karaoke
            WHERE id = $1
            RETURNING *
        `, [id]);

        if (result.rows.length === 0) {

            return res.status(404).json({
                message: "Participant introuvable."
            });
        }

        // Recalcul des positions
        await query(`
            WITH positions AS (
                SELECT
                    id,
                    ROW_NUMBER() OVER (
                        ORDER BY position
                    ) AS nouvelle_position
                FROM file_karaoke
                WHERE statut = 'en_attente'
            )
            UPDATE file_karaoke
            SET position = positions.nouvelle_position
            FROM positions
            WHERE file_karaoke.id = positions.id
        `);

        res.json({
            message: "Participant supprimé."
        });

    } catch (error) {

        next(error);
    }
}


// ============================================================
// GET /prochains
// Les 3 prochains chanteurs
// ============================================================

export async function prochains(req, res, next) {

    try {

        const result = await query(`
            SELECT
                id,
                nom,
                chanson,
                artiste,
                position
            FROM file_karaoke
            WHERE statut = 'en_attente'
            ORDER BY position ASC
            LIMIT 3
        `);

        res.json({
            prochains: result.rows
        });

    } catch (error) {

        next(error);
    }
}