import express from "express";

import {
    getFile,
    inscrire,
    passer,
    supprimer,
    prochains
} from "../controllers/fileController.js";

const router = express.Router();

router.get("/file", getFile);
router.post("/file", inscrire);
router.post("/file/:id/passer", passer);
router.delete("/file/:id", supprimer);
router.get("/prochains", prochains);

export default router;