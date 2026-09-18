import { notifySuccess, notifyWarning, notifyFailed } from "../notify";

jest.mock("sonner", () => ({
  toast: {
    custom: jest.fn(),
  },
}));

jest.mock("@/components/ui/notification-toast", () => ({
  NotificationToast: () => null,
}));

import { toast } from "sonner";

describe("notify", () => {
  beforeEach(() => jest.clearAllMocks());

  it("notifySuccess calls toast.custom with success type", () => {
    notifySuccess({ title: "Done", description: "Success" });
    expect(toast.custom).toHaveBeenCalled();
  });

  it("notifyWarning calls toast.custom with warning type", () => {
    notifyWarning({ title: "Warning", description: "Be careful" });
    expect(toast.custom).toHaveBeenCalled();
  });

  it("notifyFailed calls toast.custom with failed type", () => {
    notifyFailed({ title: "Error", description: "Something went wrong" });
    expect(toast.custom).toHaveBeenCalled();
  });

  it("uses default title when not provided", () => {
    notifySuccess();
    expect(toast.custom).toHaveBeenCalled();
  });
});
