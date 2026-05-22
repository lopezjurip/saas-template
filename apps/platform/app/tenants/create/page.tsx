import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@packages/ui-common/shadcn/components/ui/card";
import { Logo } from "@packages/ui-common/logo";
import { CreateTenantForm } from "./create-form";

export default function CreateTenantPage() {
  const tenantHost = process.env.NEXT_PUBLIC_TENANT_HOST ?? "localhost:7002";
  const protocol = tenantHost.startsWith("localhost") || tenantHost.includes("127.0.0.1") ? "http" : "https";
  const tenantBaseUrl = `${protocol}://{slug}.${tenantHost}`;

  return (
    <main className="bg-muted flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <CardTitle>
            <Logo />
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
