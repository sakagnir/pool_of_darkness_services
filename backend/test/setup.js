//-- Mariadb config

import pool from "../db/db";

beforeAll(async()=>{
    await pool.execute(`
        DELETE FROM historique_passages
    `);

    await pool.execute(`
        DELETE FROM file_karaoke
    `);

    await pool.execute(`
        INSERT INTO file_karaoke
        (
            nom,
            chanson,
            artiste,
            position
        )

        VALUES

        (
            'Alice',
            'Hello',
            'Adele',
            1
        ),

        (
            'Bob',
            'Numb',
            'Linkin Park',
            2
        ),

        (
            'Sarah',
            'Shallow',
            'Lady Gaga',
            3
        );

    `);
});



afterAll(async()=>{
    await pool.end();
});