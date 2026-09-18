import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  title?: string;
};

export function ForbiddenView({ title = "Akses ditolak" }: Readonly<Props>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-400">
          Anda tidak memiliki action view pada modul ini.
        </p>
      </CardContent>
    </Card>
  );
}
