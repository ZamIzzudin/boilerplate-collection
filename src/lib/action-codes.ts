export const ACTION_CODES = {
  LIST: "ACT_LIST",
  VIEW: "ACT_VIEW",
  ADD: "ACT_ADD",
  EDIT: "ACT_EDIT",
  DELETE: "ACT_DELETE",
  RESET: "ACT_RESET",
  ACTIVE_TOGGLE: "ACT_ACTIVE_TOGGLE",
  DOWNLOAD: "ACT_DOWNLOAD",
} as const;

export type ActionCodeKey = keyof typeof ACTION_CODES;
