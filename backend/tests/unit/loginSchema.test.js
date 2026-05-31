const { loginSchema } = require("../../models");

describe("loginSchema", () => {
  test("accepts a valid email and password", () => {
    const { error, value } = loginSchema.validate({
      email: "user@example.com",
      password: "ValidPass123",
    });

    // no validation error
    expect(error).toBeUndefined();
    // Joi may normalize the value, so we also check the result
    expect(value.email).toBe("user@example.com");
  });

  test("rejects missing email", () => {
    const { error } = loginSchema.validate({
      password: "ValidPass123",
    });

    expect(error).toBeDefined();
  });

  test("rejects invalid email format", () => {
    const { error } = loginSchema.validate({
      email: "not-an-email",
      password: "ValidPass123",
    });

    expect(error).toBeDefined();
  });

  test("rejects missing password", () => {
    const { error } = loginSchema.validate({
      email: "user@example.com",
    });

    expect(error).toBeDefined();
  });

  test("rejects too-short password", () => {
    const { error } = loginSchema.validate({
      email: "user@example.com",
      password: "123", // adjust length if your schema requires more
    });

    expect(error).toBeDefined();
  });
});
