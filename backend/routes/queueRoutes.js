import express from "express";

import {
    getQueue,
    subscribeToQueue,
    CompleteTour,
    startSinging,
    getProchains
} from "../controllers/fileController.js";

const router = express.Router();

router.get("/file", getFile);
router.post("/file", subscribeToQueue);
router.post("/file/:id/passer", CompleteTour);
router.delete("/file/:id", startSinging);
router.get("/prochains", getProchains);

export default router;