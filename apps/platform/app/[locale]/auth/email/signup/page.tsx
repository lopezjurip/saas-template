import { SINGLE } from "@packages/utils/array";
import { AuthCard } from "~/app/[locale]/auth/_components/auth-card";
import { AuthHeader } from "~/app/[locale]/auth/_components/auth-header";
import { BackToAuthLink } from "~/app/[locale]/auth/_components/back-to-auth-link";
import { getCountries } from "~/hooks/get-countries";
import { SignupForm } from "./signup-form";

export default async function EmailSignupPage(props: PageProps<"/[locale]/auth/email/signup">) {
  const sp = await props.searchParams;
  const { locale } = await props.params;
  const { data: countriesData } = await getCountries();
  const countries = countriesData?.["addresses_level0Collection"]?.["edges"]?.map((e) => e["node"]) ?? [];
  const prefilDocCountry = SINGLE(sp["country"]) ?? "";
  const kind = SINGLE(sp["kind"]);
  const prefilDocKind = kind === "passport" ? "passport" : kind === "nin" ? "nin" : "";
  const prefilDocValue = SINGLE(sp["value"]) ?? "";
  return (
    <AuthCard>
      <div className="flex flex-col gap-5">
        <AuthHeader small />
        <h2 className="text-center text-sm font-medium">Crear cuenta</h2>
        <SignupForm
          defaultEmail={SINGLE(sp["email"]) ?? ""}
          defaultCountry={prefilDocCountry}
          defaultDocKind={prefilDocKind}
          defaultDocValue={prefilDocValue}
          countries={countries}
        />
        <BackToAuthLink locale={locale} />
      </div>
    </AuthCard>
  );
}
