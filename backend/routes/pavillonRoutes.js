import express from "express";

import {
    getPavillon,
    setPavillon
} from "../controllers/pavillonController.js";

const router = express.Router();

router.get("/pavillon", getPavillon);

router.post("/pavillon", setPavillon);

export default router;