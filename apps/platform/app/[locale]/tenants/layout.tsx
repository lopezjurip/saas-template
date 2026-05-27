import { Logo } from "@packages/ui-common/logo";
import { Card, CardHeader, CardTitle } from "@packages/ui-common/shadcn/components/ui/card";
import Link from "next/link";

export default async function TenantsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CardTitle>
            <Link href={`/${locale}`} aria-label="Inicio" className="inline-block transition-opacity hover:opacity-80">
              <Logo />
            </Link>
          </CardTitle>
        </CardHeader>
        {children}
      </Card>
    </main>
  );
}
