import type { FileType, GetFileParams, UpdateProfilePayload, ProfileForm, ProfileEditForm, FileValues, FileValue } from "../types";

describe("profile types", () => {
  it("exports FileType as valid type", () => {
    const ft: FileType = "siup";
    expect(ft).toBe("siup");
  });

  it("exports all FileType variants", () => {
    const types: FileType[] = ["siup", "npwp", "recommendation", "signature", "logo", "officer1_pict", "officer2_pict", "officer3_pict"];
    expect(types).toHaveLength(8);
  });

  it("exports GetFileParams type", () => {
    const params: GetFileParams = { id: "1", type: "npwp" };
    expect(params.id).toBe("1");
  });

  it("exports UpdateProfilePayload type", () => {
    const payload: UpdateProfilePayload = { name: "Test" };
    expect(payload.name).toBe("Test");
  });

  it("supports optional company/contract/bank fields on UpdateProfilePayload", () => {
    const payload: UpdateProfilePayload = {
      name: "Test",
      picHp: "0811111111",
      virtualAccount: "VA001",
      pmkuNumber: "PMKU001",
      contractNumber: "CTR001",
      institutionCode: "INST001",
      bankAccounts: [
        {
          bankAccountBank: "BRI",
          bankAccountNumber: "1234567890",
          bankAccountName: "John Doe",
        },
      ],
    };
    expect(payload.bankAccounts![0].bankAccountBank).toBe("BRI");
    expect(payload.picHp).toBe("0811111111");
  });

  it("exports ProfileForm type", () => {
    const form: ProfileForm = {
      userTypeName: "", userEmail: "", userProfileName: "", userProfilePhone: "",
      userProfilePob: "", userProfileDob: "", userProfileCompanyName: "",
      userProfilePosition: "", userProfileAddress: "",
      provinceCode: "", provinceName: "", cityCode: "", cityName: "",
    };
    expect(form).toBeDefined();
  });

  it("exports ProfileEditForm type", () => {
    const form: ProfileEditForm = {
      userProfileName: "", userEmail: "", userProfilePhone: "",
      userProfileFax: "", userProfileAddress: "",
      provinceCode: "", provinceName: "", cityCode: "", cityName: "",
      userProfileSiup: "", userProfileNpwp: "",
      userProfileCompanyType: "", userProfileCompanyStatus: "",
      userProfilePicName: "", userProfilePicEmail: "",
      userProfilePicHp: "", userProfilePicPhone: "", userProfilePicFax: "",
      userProfilePmkuNumber: "", userProfileContractNumber: "",
      virtualAccount: "", institutionCode: "",
      officers: [], bankAccounts: [],
    };
    expect(form).toBeDefined();
  });

  it("exports FileValues type", () => {
    const fv: FileValues = {
      siupDoc: null, npwpDoc: null, logo: null,
      signature: null, recommendation: null, officerPicts: {},
    };
    expect(fv).toBeDefined();
  });

  it("exports FileValue type", () => {
    const fv: FileValue = null;
    expect(fv).toBeNull();
  });
});
