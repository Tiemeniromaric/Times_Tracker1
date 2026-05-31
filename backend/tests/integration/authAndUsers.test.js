const request = require("supertest");
const app = require("../../server");

// POST /login validation-level tests
describe("POST /login", () => {
  test("returns 400 when email is missing", async () => {
    const res = await request(app)
      .post("/login")
      .send({ password: "SomePassword123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 when email is invalid", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "not-an-email", password: "SomePassword123" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 400 when password is missing", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email: "user@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

// GET /admin/users auth protection tests
describe("GET /admin/users", () => {
  test("returns 401 when no Authorization header is provided", async () => {
    const res = await request(app).get("/admin/users");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 401 when Authorization header is empty", async () => {
    const res = await request(app).get("/admin/users").set("Authorization", "");

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });
});
