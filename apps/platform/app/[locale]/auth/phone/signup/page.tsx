import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { getCountries } from "~/hooks/get-countries";
import { SignupForm } from "./signup-form";

type SearchParams = Promise<{ phone?: string }>;
type Params = Promise<{ locale: string }>;

export default async function PhoneSignupPage({
  searchParams,
  params,
}: {
  searchParams: SearchParams;
  params: Params;
}) {
  const sp = await searchParams;
  const { locale } = await params;
  const { data: countriesData } = await getCountries();
  const countries = countriesData?.["addresses_level0Collection"]?.["edges"]?.map((e) => e["node"]) ?? [];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-center text-sm font-medium">Crear cuenta</h2>
      <SignupForm defaultPhone={sp["phone"] ?? ""} countries={countries} />
      <BackToAuthLink locale={locale} />
    </div>
  );
}
