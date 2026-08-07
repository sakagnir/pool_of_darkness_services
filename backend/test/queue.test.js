
import request from "supertest";
import app from "../src/app.js";


describe(
    "Gestion de la file karaoke",
    ()=>{
        test(
            "Ajouter un chanteur",
            async()=>{
                const response =
                await request(app).post("/file")
                                .send({
                                        nom:"Kevin",
                                        chanson:"Zombie",
                                        artiste:"Cranberries"
                                });

                expect(response.statusCode).toBe(201);

                expect(response.body)
                .toHaveProperty("id");
            }
        );

        test(
            "Afficher la file",
            async()=>{
                const response = await request(app).get("/file");

                expect(response.statusCode).toBe(200);

                expect(
                    Array.isArray(response.body)
                )
                .toBe(true);
            }
        );
    }
);