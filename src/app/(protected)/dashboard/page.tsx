import { AppLayout } from "@/components/app-layout";
import { MapContainer, MapControls } from "@/components/ui/map";

export default function DashboardPage() {
  return (
    <AppLayout
      title="Dashboard"
      description="Menampilkan ringkasan peta operasional."
    >
      <div className="h-130 overflow-hidden rounded-md border border-[#dde5ee]">
        <MapContainer center={[118, -2.5]} zoom={4}>
          <MapControls showZoom showFullscreen position="bottom-right" />
        </MapContainer>
      </div>
    </AppLayout>
  );
}
