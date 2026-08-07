import express from "express";

import {
    work
} from "../controllers/travailController.js";

const router = express.Router();

router.get("/travail", work);

export default router;