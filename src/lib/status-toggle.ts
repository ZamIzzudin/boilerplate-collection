import { notifyFailed, notifySuccess } from "@/lib/notify";
import { getErrorMessage } from "@/lib/error-message";

interface ToggleableItem {
  id: string;
  status_code?: string;
}

interface UpdateStatusMutation {
  mutateAsync: (variables: { id: string; statusCode: string }) => Promise<any>;
}

export async function toggleStatusHelper<T extends ToggleableItem>(
  item: T,
  updateStatusMutation: UpdateStatusMutation,
  entityName: string,
) {
  const isCurrentActive = item.status_code === "ACTIVE";
  const nextStatus = isCurrentActive ? "NON_ACTIVE" : "ACTIVE";
  try {
    await updateStatusMutation.mutateAsync({
      id: item.id,
      statusCode: nextStatus,
    });
    notifySuccess({
      title: "Berhasil",
      description: `Data ${entityName} berhasil ${isCurrentActive ? "dinonaktifkan" : "diaktifkan"}`,
    });
  } catch (error) {
    notifyFailed({
      title: "Failed",
      description: getErrorMessage(
        error,
        isCurrentActive
          ? `Gagal menonaktifkan data ${entityName}`
          : `Gagal mengaktifkan data ${entityName}`,
      ),
    });
  }
}
