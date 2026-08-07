import express from "express";

import queueRoutes from "./routes/queueRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import workRoutes from "./routes/workRoutes.js";
import pavillonRoutes from "./routes/pavillonRoutes.js";


import {
    metrics
} from "./metrics.js";


import {
    httpRequestsTotal,
    httpErrorsTotal,
    httpRequestDuration
} from "./metrics.js";


const app = express();


// --------------------------------------------
// Middlewares
// -----------------------------------------------

app.use(express.json({
    limit: "10kb"
}));

// CORS : autorise le front (servi depuis un autre port/hôte) à appeler l'API.
// En J5, le front et l'API sont des services distincts → sans CORS, le
// navigateur bloque les appels (erreur "blocked by CORS policy").
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});


// -------------------------------------------------------
// Métriques HTTP
// -----------------------------------------------------

app.use((req, res, next) => {
    const debut = process.hrtime.bigint();
    httpRequestsTotal.inc();

    res.on("finish", () => {
        const fin = process.hrtime.bigint();

        const duree =
            Number(fin - debut) / 1_000_000_000;
        httpRequestDuration.observe(duree);

        if (res.statusCode >= 400) {
            httpErrorsTotal.inc();
        }
    });

    next();
});


// --------------------------------------
// Routes
// --------------------------------

app.use(queueRoutes);
app.use(healthRoutes);
app.use(workRoutes);
app.use(pavillonRoutes);


// Prometheus
app.get("/metrics", metrics);


// ------------------------------------------
// Route (root)
// --------------------------------------------

app.get("/", (req, res) => {

    res.json({
        service: "karaoke-api",
        version: process.env.VERSION || "dev",
        status: "running"
    });
});


// ----------------------------------------------
// Route 404
// -----------------------------------

app.use((req, res) => {
    res.status(404).json({
        message: "Route introuvable."
    });
});



app.use((error, req, res, next) => {
    console.error(
        "[API ERROR]",
        error
    );

    if (res.headersSent) {
        return next(error);
    }
    res.status(500).json({
        message: "Erreur interne du serveur."
    });
});


export default app;