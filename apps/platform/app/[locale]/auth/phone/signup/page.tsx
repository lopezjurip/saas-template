import { SINGLE } from "@packages/utils/array";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { getCountries } from "~/hooks/get-countries";
import { SignupForm } from "./signup-form";

export default async function PhoneSignupPage(props: PageProps<"/[locale]/auth/phone/signup">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const { data: countriesData } = await getCountries();
  const countries = countriesData?.["addresses_level0Collection"]?.["edges"]?.map((e) => e["node"]) ?? [];
  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <h2 className="text-center text-sm font-medium">Crear cuenta</h2>
        <SignupForm defaultPhone={SINGLE(sp["phone"]) ?? ""} countries={countries} />
        <BackToAuthLink locale={locale} />
      </div>
    </AuthCard>
  );
}
