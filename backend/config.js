export const config = {
    port: Number(process.env.PORT || 3000),

    database: {
        host: process.env.DB_HOST || "db",
        port: Number(process.env.DB_PORT || 3306),
        database: process.env.DB_NAME || "karaoke",
        user: process.env.DB_USER || "karaoke",
        password: process.env.DB_PASSWORD || "karaoke",
        connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10)
    },

    tableauUrl: process.env.TABLEAU_URL || "",
    groupe: process.env.GROUPE || "",
    couleur: process.env.COULEUR || "#888888",
    service: process.env.SERVICE || "api",
    version: process.env.VERSION || "dev",

    urlInterne:
        process.env.URL_INTERNE || "http://localhost:3000",

    pavillonFichier:
        process.env.PAVILLON_FICHIER || "/data/pavillon.txt"
};