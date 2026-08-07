import pool from "../db/db.js";

test(
    "La base contient la file",
    async()=>{
        const rows = await pool.execute(`
            SELECT *
            FROM file_karaoke
        `);

        expect(rows.length).toBeGreaterThan(0);
    }
);

afterAll(async () => {
  await pool.end();
});