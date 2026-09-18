export type AuthUser = {
  id: string;
  name: string;
  email: string;
  userTypeId: string;
  userTypeName: string;
};

export type Permissions = Record<string, boolean>;

export type LoginPayload = {
  email: string;
  password: string;
  userTypeId: string;
};

export type LoginAction = {
  id: number;
  action_name: string;
  action_key: string;
  modules_module_id: number;
};

export type LoginResponse = {
  status: number;
  message: string;
  data: {
    id: string;
    user_email: string;
    user_status: string;
    user_type_user_type_id: string;
    user_type_name: string;
    access_token: string;
    refresh_token: string;
    actions: LoginAction[];
    menus: any[];
  };
};

export type RolesMapped = {
  id: string;
  code: string;
  name: string;
};

export type RolesExport = {
  all: RolesMapped[] | [];
  external: RolesMapped[] | [];
};
