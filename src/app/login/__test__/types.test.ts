import type {
  LoginAction,
  LoginPayload,
  LoginResponse,
  BaseFormState,
  Officer,
  BankAccount,
  ConsigneeFormState,
  ShipperFormState,
  OperatorFormState,
  CommonFields,
  consigneePayload,
  shipperPayload,
  operatorPayload,
  ForgotPasswordPayload,
} from "../types";

describe("login types", () => {
  it("exports LoginPayload type", () => {
    const p: LoginPayload = { email: "a@b.com", password: "123", userTypeId: "1" };
    expect(p.email).toBe("a@b.com");
  });

  it("exports LoginAction type", () => {
    const a: LoginAction = { id: 1, action_name: "read", action_key: "read", modules_module_id: 1 };
    expect(a.action_name).toBe("read");
  });

  it("exports LoginResponse type", () => {
    const r: LoginResponse = {
      status: 200, message: "ok",
      data: {
        id: "1", user_email: "a@b.com", user_status: "active",
        user_type_user_type_id: "2", user_type_name: "Admin",
        access_token: "abc", refresh_token: "def", actions: [], menus: [],
      },
    };
    expect(r.status).toBe(200);
  });

  it("exports BaseFormState type", () => {
    const f: BaseFormState = {
      companyName: "", companyEmail: "", companyPhone: "", companyFax: "",
      provinceCode: "", provinceName: "", cityCode: "", cityName: "",
      address: "", siupNumber: "", siupDocument: null, npwpNumber: "",
      npwpDocument: null, picName: "", picEmail: "", picMobile: "",
      picPhone: "", picFax: "", agreement: false,
    };
    expect(f.agreement).toBe(false);
  });

  it("exports Officer type", () => {
    const o: Officer = { id: 1, name: "O1", phone: "081", identityType: "KTP", photo: null };
    expect(o.identityType).toBe("KTP");
  });

  it("exports BankAccount type", () => {
    const b: BankAccount = { id: 1, bankName: "BRI", accountNumber: "123", accountName: "A" };
    expect(b.bankName).toBe("BRI");
  });

  it("exports ShipperFormState type", () => {
    const f: ShipperFormState = {
      companyName: "", companyEmail: "", companyPhone: "", companyFax: "",
      provinceCode: "", provinceName: "", cityCode: "", cityName: "",
      address: "", siupNumber: "", siupDocument: null, npwpNumber: "",
      npwpDocument: null, picName: "", picEmail: "", picMobile: "",
      picPhone: "", picFax: "", agreement: false,
      companyType: "", companyStatus: "", logo: null,
      responsibleName: "", responsibleSignature: null, recommendationLetter: null,
      officers: [],
    };
    expect(f.officers).toHaveLength(0);
  });

  it("exports OperatorFormState type", () => {
    const f: OperatorFormState = {
      companyName: "", companyEmail: "", companyPhone: "", companyFax: "",
      provinceCode: "", provinceName: "", cityCode: "", cityName: "",
      address: "", siupNumber: "", siupDocument: null, npwpNumber: "",
      npwpDocument: null, picName: "", picEmail: "", picMobile: "",
      picPhone: "", picFax: "", agreement: false,
      companyType: "", companyStatus: "", logo: null,
      responsibleName: "", responsibleSignature: null,
      pmkuNumber: "", pmkuDate: "", contractNumber: "",

      virtualAccount: "", institutionCode: "", bankAccounts: [],
    };
    expect(f.bankAccounts).toHaveLength(0);
  });

  it("exports ForgotPasswordPayload type", () => {
    const p: ForgotPasswordPayload = { email: "a@b.com", userTypeId: "1" };
    expect(p.email).toBe("a@b.com");
  });
});
