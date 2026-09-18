import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <h2 className="text-xl font-semibold text-gray-700">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Button className="px-5 py-5" variant="primary">
          <Link to="/dashboard">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
