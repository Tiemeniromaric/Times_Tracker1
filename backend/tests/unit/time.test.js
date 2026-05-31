const { formatForMySQL } = require("../../utils/time");

describe("formatForMySQL", () => {
  test("converts a valid ISO string to MySQL datetime format", () => {
    const input = "2024-05-01T12:34:56.789Z";
    const result = formatForMySQL(input);

    // Should be 'YYYY-MM-DD HH:MM:SS'
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });

  test("returns null for an invalid date string", () => {
    const result = formatForMySQL("not-a-date");
    expect(result).toBeNull();
  });

  test("returns null for empty string", () => {
    const result = formatForMySQL("");
    expect(result).toBeNull();
  });

  test("returns null for undefined", () => {
    const result = formatForMySQL(undefined);
    expect(result).toBeNull();
  });

  test("handles Date object input", () => {
    const input = new Date("2024-05-01T12:34:56Z");
    const result = formatForMySQL(input);

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
