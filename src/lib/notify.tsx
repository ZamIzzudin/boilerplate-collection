import { toast } from "sonner";
import { NotificationToast } from "@/components/ui/notification-toast";

type NotifyPayload = {
  title?: string;
  description?: string;
};

function notify(type: "success" | "warning" | "failed", payload?: NotifyPayload) {
  return toast.custom((id) => (
    <NotificationToast
      id={id}
      type={type}
      title={payload?.title ?? "Title here"}
      description={payload?.description ?? "Subtitle here Subtitle here Subtitle here"}
    />
  ));
}

export const notifySuccess = (payload?: NotifyPayload) => notify("success", payload);
export const notifyWarning = (payload?: NotifyPayload) => notify("warning", payload);
export const notifyFailed = (payload?: NotifyPayload) => notify("failed", payload);
