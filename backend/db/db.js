import mariadb from "mariadb";
import { config } from "../config.js";


export const pool = mariadb.createPool({
  host: config.database.host || "db",
  port: Number(config.database.port || 3306),
  user: config.database.user || "karaoke",
  password: config.database.password || "karaoke",
  database: config.database.database || "karaoke",
  connectionLimit: Number(config.database.connectionLimit || 10)
});

export async function query(sql, params = []) {
  let connection;

  try {
    connection = await pool.getConnection();
    return await connection.query(sql, params);
  }
  finally {
    if (connection) {
      connection.release();
    }
  }
}

export async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.query("SELECT 1");
    return true;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

export default pool;