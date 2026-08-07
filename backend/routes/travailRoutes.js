import express from "express";

import {
    travail
} from "../controllers/travailController.js";

const router = express.Router();

router.get("/travail", travail);

export default router;