export type OfficerItem = {
  idx: number;
  name: string;
  identity: string;
  phone: string;
  identityPict: string;
};

export type BankAccountItem = {
  usersUserId: number;
  bankAccountBank: string;
  bankAccountNumber: string;
  bankAccountName: string;
};

export type BaseUserItem = {
  id: string;
  userProfileName: string;
  userTypeId?: number;
  userEmail: string;
  userTypeName?: string;
  userProfileAddress: string;
  userProfilePhone: string;
  userProfileFax: string;
  userProfileEmail: string;
  userProfileSiup: string;
  userProfileSiupDoc: string;
  userProfileNpwp: string;
  userProfileNpwpDoc: string;
  userProfilePicName: string;
  userProfilePicEmail: string;
  userProfilePicHp: string;
  userProfilePicPhone: string;
  userProfilePicFax: string;
  userProfileSuratRekomendasiPemda: string;
  userProfilePersonInCharge: string;
  userProfileCompanyType: string;
  userProfileCompanyStatus: string;
  userProfileSignature: string;
  userProfileCompanyLogo: string;
  officers: OfficerItem[];
  userProfilePmkuNumber: string;
  userProfilePmkuDate: string;
  userProfilePob: string;
  userProfileDob: string;
  userProfileCompanyName: string;
  userProfilePosition: string;
  userProfileContractNumber: string;
  userProfileContractStart: string;
  userProfileContractEnd: string;
  userProfileContractAdendum: string;
  virtualAccount: string;
  institutionCode: string;
  provinceId: number;
  provinceName: string;
  cityId: number;
  cityName: string;
  userRejectedReason: string;
  status: number;
  bankAccount?: BankAccountItem[];
  userStatus: string;
  label: string;
  value: string;
  labelStatus: string;
};

export type UserListParams = {
  page: number;
  limit: number;
  name?: string;
  status?: string;
};

export type UserStatusPayload = {
  id: string;
  status: string;
  reason?: string;
};

export type GetFileParams = {
  id: string;
  type: FileType;
};

export type FileType =
  | "siup"
  | "npwp"
  | "recommendation"
  | "signature"
  | "logo"
  | "officer1_pict"
  | "officer2_pict"
  | "officer3_pict";

export type UserHandler<T> = {
  list: (params: UserListParams) => Promise<{
    items: T[];
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  }>;
  detail: (id: string) => Promise<T>;
  delete: (id: string) => Promise<any>;
  toggleStatus: (payload: UserStatusPayload) => Promise<any>;
  verify: (id: string) => Promise<any>;
  reject: (id: string, reason: string) => Promise<any>;
  getFile: (params: GetFileParams) => Promise<{ url: string | null; isImage: boolean }>;
};
