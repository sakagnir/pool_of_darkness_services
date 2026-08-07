
import express from "express";

import {
    health
} from "../controllers/healthController.js";

const router = express.Router();

router.get("/sante", health);

export default router;
