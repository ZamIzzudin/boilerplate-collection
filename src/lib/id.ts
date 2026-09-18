import { randomUUID, randomBytes } from "node:crypto";

/** Generate a unique action code, e.g. ACT1780387013007. */
export const generateActionCode = (): string => `ACT${Date.now()}`;

/** Generate a unique menu code, e.g. MNU_1699999999999. */
export const generateMenuCode = (): string => `MNU_${Date.now()}`;

/** Generate a unique privilege code, e.g. PRV_1699999999999. */
export const generatePrivilegeCode = (): string => `PRV_${Date.now()}`;

/** Generate an opaque token used for password reset / activation emails. */
export const generateToken = (): string => randomUUID() + randomBytes(16).toString("hex");
