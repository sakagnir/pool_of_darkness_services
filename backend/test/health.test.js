
import request from "supertest";
import app from "../server";

describe(
    "Health API",
    ()=>{
        test(
            "API healthy",
            async()=>{
                const response = await request(app).get("/health");
                expect(response.statusCode).toBe(200);

                expect(response.body).toEqual({
                    status:"ok"
                });
            }
        );

});