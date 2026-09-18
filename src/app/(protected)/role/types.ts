export type RoleItem = {
  id: string;
  name: string;
  category: boolean;
};

export type RolePayload = {
  id: string;
  label: string;
  user_type_show_on_register: boolean;
};

export type RegisterRoleOption = {
  id: string;
  name: string;
  category: boolean;
};

export type RoleListParams = {
  page: number;
  limit: number;
  name?: string;
  category?: number;
};
