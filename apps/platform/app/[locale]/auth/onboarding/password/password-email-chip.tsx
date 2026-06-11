"use client";

import { IdentityChip } from "~/components/identity/chips";
import { useLocaleParam } from "~/hooks/use-locale-param";
import { ROUTE } from "~/lib/route";

export function PasswordEmailChip({ email }: { email: string }) {
  const locale = useLocaleParam();
  return <IdentityChip kind="email" value={email} href={ROUTE("/[locale]/auth/onboarding/email", { locale })} />;
}
