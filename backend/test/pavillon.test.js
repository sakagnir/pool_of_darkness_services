import request from "supertest";
import app from "../server.js";

describe("Pavillon persistant", () => {
  test("écrire puis lire un pavillon", async () => {
    const texte = "On chante jusqu'au bout";

    const writeResponse = await request(app)
      .post("/pavillon")
      .send({ message: texte });

    expect(writeResponse.statusCode).toBe(201);
    expect(writeResponse.body.pavillon).toBe(texte);

    const readResponse = await request(app)
      .get("/pavillon");

    expect(readResponse.statusCode).toBe(200);
    expect(readResponse.body.pavillon).toBe(texte);
  });
});