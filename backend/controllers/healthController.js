

import pool from "../db/db.js";


export async function health(req, res) {
  try {
    await pool.execute("SELECT 1");

    return res.status(200).json({
      status: "ok",
      service: process.env.SERVICE || "api",
      version: process.env.VERSION || "dev",
      database: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] MariaDB indisponible :", error);

    return res.status(503).json({
      status: "unhealthy",
      service: process.env.SERVICE || "api",
      version: process.env.VERSION || "dev",
      database: "down",
      timestamp: new Date().toISOString(),
    });
  }
}