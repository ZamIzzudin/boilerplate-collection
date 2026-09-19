export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

export type DataResponse<T> = {
  status: string;
  timestamp: string;
  message: string;
  data: T[];
};

export type PaginatedDataResponse<T> = {
  data: T[];
  total: number;
};

export type Access = {
  canView?: boolean;
  canViewDetail?: boolean;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canActive?: boolean;
  canResetPassword?: boolean;
  canDownload?: boolean;
};

export type DetailAccess = {
  canViewDetail?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canActive?: boolean;
  canDownload?: boolean;
  canResetPassword?: boolean;
};

export type ActiveSheet = "FORM" | "DETAIL" | null;

export type ActiveSheetWithApproval = "FORM" | "DETAIL" | "APPROVAL" | null;

export type SelectOption = {
  label: string;
  value: string;
};
