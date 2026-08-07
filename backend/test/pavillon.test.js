import request from "supertest";

import app from "../src/app.js";


describe(
    "Pavillon persistant",
    ()=>{

        test(
        "Ecrire un pavillon",
        async()=>{
            const response = await request(app).post("/pavillon").send({ message: "On chante jusqu'au bout"});
            expect(response.statusCode).toBe(201);
        });


        test(
            "Lire le pavillon",
            async()=>{
                const response = await request(app).get("/pavillon");
                expect(response.body.message).toBe("On chante jusqu'au bout");
            }
        )
    }
);