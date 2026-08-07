import request from "supertest";


import app from "../src/app.js";


describe(
    "Gestion prochains",
    ()=>{
        test(
            "Retourne le prochain chanteur",
            async()=>{
                const response = await request(app).get("/prochains");

                expect(response.statusCode).toBe(200);
                expect(response.body).toHaveProperty("prochains");

                expect(response.body.prochains.length).toBeGreaterThan(0);
            }
        );


        test(
            "Passe au chanteur suivant",
            async()=>{
                const response = await request(app).post("/prochains/suivant");
                expect(response.statusCode).toBe(200);

                expect(response.body).toHaveProperty(
                    "chanteur"
                );
            }
        );
    }
);