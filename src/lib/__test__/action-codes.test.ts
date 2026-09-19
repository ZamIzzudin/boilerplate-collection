import { ACTION_CODES } from "../action-codes";

describe("ACTION_CODES", () => {
  it("has all required action codes", () => {
    expect(ACTION_CODES.LIST).toBeDefined();
    expect(ACTION_CODES.VIEW).toBeDefined();
    expect(ACTION_CODES.ADD).toBeDefined();
    expect(ACTION_CODES.EDIT).toBeDefined();
    expect(ACTION_CODES.DELETE).toBeDefined();
    expect(ACTION_CODES.RESET).toBeDefined();
    expect(ACTION_CODES.ACTIVE_TOGGLE).toBeDefined();
    expect(ACTION_CODES.DOWNLOAD).toBeDefined();
  });

  it("matches the seeded action_code values in the database", () => {
    expect(ACTION_CODES).toEqual({
      LIST: "ACT_LIST",
      VIEW: "ACT_VIEW",
      ADD: "ACT_ADD",
      EDIT: "ACT_EDIT",
      DELETE: "ACT_DELETE",
      RESET: "ACT_RESET",
      ACTIVE_TOGGLE: "ACT_ACTIVE_TOGGLE",
      DOWNLOAD: "ACT_DOWNLOAD",
    });
  });

  it("keys map to ACT_<KEY> codes", () => {
    Object.entries(ACTION_CODES).forEach(([key, code]) => {
      expect(code).toBe(`ACT_${key}`);
    });
  });

  it("all codes are unique", () => {
    const codes = Object.values(ACTION_CODES);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });
});
