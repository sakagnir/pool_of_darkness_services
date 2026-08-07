import request from "supertest";

import app from "../server";


describe(
    "Charge travail",
    ()=>{
        test(
        "Un coup est encaissé",
        async()=>{
            const response = await request(app).get("/travail");

            expect(response.statusCode).toBe(200);
            expect(response.body.ok).toBe(true);
        }
    );
});