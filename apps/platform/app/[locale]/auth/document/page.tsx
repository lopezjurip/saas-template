import { SINGLE } from "@packages/utils/array";
import Link from "next/link";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { getCountries } from "~/hooks/get-countries";
import { DocumentFlow } from "./document-flow";

export default async function DocumentEntryPage(props: PageProps<"/[locale]/auth/document">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const { data: countriesData } = await getCountries();
  const countries = countriesData?.["addresses_level0Collection"]?.["edges"]?.map((e) => e["node"]) ?? [];
  const initialError = SINGLE(sp["error"]);

  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <h2 className="text-center text-sm font-medium">Ingresa con documento</h2>
        <DocumentFlow countries={countries} locale={locale} initialError={initialError} />
        <Link href={`/${locale}/auth`} className="text-muted-foreground text-center text-xs hover:underline">
          ← Cambiar método de ingreso
        </Link>
      </div>
    </AuthCard>
  );
}
