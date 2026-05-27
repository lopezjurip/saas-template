import { CardContent, CardDescription, CardHeader } from "@packages/ui-common/shadcn/components/ui/card";
import { CreateTenantForm } from "./create-form";

export default async function CreateTenantPage() {
  return (
    <>
      <CardHeader className="items-center text-center">
        <CardDescription>Crear empresa</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateTenantForm />
      </CardContent>
    </>
  );
}
