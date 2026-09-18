export type UserItem = {
  id: string;
  username: string;
  email: string;
  role: import("./privilege").RoleOption;
};

export type CreateUserPayload = {
  username: string;
  email: string;
  password: string;
  user_type_id: string;
};

export type UpdateUserPayload = {
  username: string;
  email: string;
  password?: string;
  user_type_id: string;
};
