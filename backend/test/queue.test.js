import request from "supertest";
import app from "../server.js";

describe("Gestion de la file karaoke", () => {
  test("Ajouter un chanteur", async () => {
    const response = await request(app)
      .post("/file")
      .send({
        nom: "Kevin",
        chanson: "Zombie",
        artiste: "Cranberries",
      });

    expect(response.statusCode).toBe(201);

    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("Inscription réussie");

    expect(response.body).toHaveProperty("participant");
    expect(response.body.participant).toHaveProperty("id");

    expect(response.body.participant.nom).toBe("Kevin");
    expect(response.body.participant.chanson).toBe("Zombie");
    expect(response.body.participant.artiste).toBe("Cranberries");
    expect(response.body.participant.statut).toBe("EN_ATTENTE");
  });

  test("Afficher la file", async () => {
    const response = await request(app).get("/file");

    expect(response.statusCode).toBe(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
