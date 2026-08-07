import express from "express";

import {
    work
} from "../controllers/travailController.js";

const router = express.Router();

/**
 * @returns {{
 *   ok: boolean,
 *   totalParticipants: number,
 *   statistiques: {
 *     statut: 'EN_ATTENTE' | 'EN_COURS' | 'TERMINE' | 'PASSE',
 *     total: number
 *   },
 *   duree_ms: number
 * }}
 */
router.get("/travail", work);

export default router;