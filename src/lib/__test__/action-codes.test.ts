import { ACTION_CODES } from "../action-codes";

describe("ACTION_CODES", () => {
  it("has all required action codes", () => {
    expect(ACTION_CODES.VIEW).toBeDefined();
    expect(ACTION_CODES.ADD).toBeDefined();
    expect(ACTION_CODES.EDIT).toBeDefined();
    expect(ACTION_CODES.DELETE).toBeDefined();
    expect(ACTION_CODES.APPROVE).toBeDefined();
    expect(ACTION_CODES.REJECT).toBeDefined();
    expect(ACTION_CODES.RESET).toBeDefined();
    expect(ACTION_CODES.LIST).toBeDefined();
    expect(ACTION_CODES.ACTIVE_TOGGLE).toBeDefined();
    expect(ACTION_CODES.DOWNLOAD).toBeDefined();
    expect(ACTION_CODES.EDIT_ROOM).toBeDefined();
    expect(ACTION_CODES.DELETE_ROOM).toBeDefined();
    expect(ACTION_CODES.UPLOAD_HEALTH).toBeDefined();
    expect(ACTION_CODES.UPLOAD_PAYMENT).toBeDefined();
    expect(ACTION_CODES.UPLOAD_QUARANTINE).toBeDefined();
    expect(ACTION_CODES.VERIF_PAYMENT).toBeDefined();
    expect(ACTION_CODES.VERIF_QR).toBeDefined();
    expect(ACTION_CODES.VERIF_QUARANTINE).toBeDefined();
    expect(ACTION_CODES.CANCEL).toBeDefined();
  });

  it("all codes start with ACT", () => {
    Object.values(ACTION_CODES).forEach((code) => {
      expect(code).toMatch(/^ACT\d+$/);
    });
  });

  it("all codes are unique", () => {
    const codes = Object.values(ACTION_CODES);
    const unique = new Set(codes);
    expect(unique.size).toBe(codes.length);
  });
});
