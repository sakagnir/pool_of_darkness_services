import request from "supertest";
import app from "../server.js";

describe("Health API", () => {
  test("API healthy", async () => {
    const response = await request(app).get("/sante");

    expect(response.statusCode).toBe(200);

    expect(response.body).toMatchObject({
      status: "ok",
      database: "ok",
    });

    expect(response.body).toHaveProperty("service");
    expect(response.body).toHaveProperty("version");
    expect(response.body).toHaveProperty("timestamp");
  });
});
