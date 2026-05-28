"use client";

import { IdentityChip } from "~/components/identity/chips";
import { useLocaleParam } from "~/hooks/use-locale-param";

export function PasswordEmailChip({ email }: { email: string }) {
  const locale = useLocaleParam();
  return <IdentityChip kind="email" value={email} href={`/${locale}/auth/onboarding/email`} />;
}
