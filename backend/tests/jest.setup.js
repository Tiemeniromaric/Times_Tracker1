// backend/tests/jest.setup.js

jest.mock("mysql2", () => {
  const mockConnection = {
    connect: jest.fn((cb) => cb && cb(null)),
    query: jest.fn((sql, params, cb) => {
      // Support query(sql, cb) and query(sql, params, cb)
      if (typeof params === "function") {
        cb = params;
      }
      cb && cb(null, []);
    }),
    end: jest.fn((cb) => cb && cb(null)),
  };

  return {
    createConnection: jest.fn(() => mockConnection),
  };
});
