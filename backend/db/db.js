import pg from "pg";
import { config } from "./config.js";

const { Pool } = pg;

export const pool = new Pool({
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    user: config.database.user,
    password: config.database.password,

    max: 10,

    idleTimeoutMillis: 30000,

    connectionTimeoutMillis: 3000
});

export async function query(text, params = []) {
    return pool.query(text, params);
}

//-- constrol for checking dtabase
export async function checkDatabase() {
    try {
        await pool.query("SELECT 1");
        return true;
    }
    catch (error) {
        console.error(
            "[DB] Base de données inaccessible:",
            error.message
        );
        return false;
    }
}


