const request = require("supertest");
const app = require("../../server"); // server.js now exports the Express app

// Simple API smoke test using Supertest directly on the Express app
describe("API smoke test", () => {
  test("health check route works", async () => {
    // If you add a /health route in server.js:
    // app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    // You can also assert on the body if you like:
    // expect(res.body).toEqual({ status: "ok" });
  });
});
