export type {
  LoginAction,
  LoginPayload,
  LoginResponse,
} from "@/types";

export type ForgotPasswordPayload = {
  email: string;
  userTypeId: string;
};
