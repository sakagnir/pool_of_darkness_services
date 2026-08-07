import pool from "../src/config/database.js";


test(
    "La base contient la file",
    async()=>{
        const [ rows ] = await pool.execute(`
            SELECT *
            FROM file_karaoke
        `);

        expect(rows.length).toBeGreaterThan(0);
    }
);