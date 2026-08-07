import request from "supertest";
import app from "../server.js";

describe("Gestion prochains", () => {
  test("Retourne le chanteur actuel et les prochains", async () => {
    const response = await request(app).get("/prochains");

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty("actuel");
    expect(response.body).toHaveProperty("nexts");

    expect(Array.isArray(response.body.nexts)).toBe(true);
    expect(response.body.nexts.length).toBeLessThanOrEqual(3);
  });
});
