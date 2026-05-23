import { Logo } from "@packages/ui-common/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui-common/shadcn/components/ui/card";
import Link from "next/link";
import { CreateTenantForm } from "./create-form";

export default function CreateTenantPage() {
  const tenantHost = process.env.NEXT_PUBLIC_TENANT_HOST ?? "lvh.me:7002";
  const tenantBaseUrl = `https://{slug}.${tenantHost}`;

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CardTitle>
            <Link href="/" aria-label="Inicio" className="inline-block transition-opacity hover:opacity-80">
              <Logo />
            </Link>
          </CardTitle>
          <CardDescription>Crear empresa</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateTenantForm tenantBaseUrl={tenantBaseUrl} />
        </CardContent>
      </Card>
    </main>
  );
}
