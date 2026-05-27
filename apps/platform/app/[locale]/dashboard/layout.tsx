// Owns the /dashboard namespace — auth-gated, no tenant context yet.
import { getSupabaseServerUser } from "@packages/supabase/client.server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await getSupabaseServerUser();
  if (!user) {
    redirect(`/${locale}/auth`);
  }

  return <>{children}</>;
}
