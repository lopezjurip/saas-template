import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { getViewerProfile } from "~/hooks/use-viewer-profile";

export default async function HomePage() {
  const { data: { profile } = { ["profile"]: null } } = await getViewerProfile();
  const profile_name_full = profile?.["profile_name_full"];

  const platformUrl = process.env.NEXT_PUBLIC_PLATFORM_URL ?? "http://localhost:7000";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Humane</h1>
      <p className="text-muted-foreground">HR y Nómina para empresas chilenas</p>
      {profile_name_full && (
        <p className="text-sm">
          Hola, <strong>{profile_name_full}</strong>
        </p>
      )}
      <Button asChild>
        <Link href={`${platformUrl}/auth`}>Ir a la plataforma</Link>
      </Button>
    </main>
  );
}
