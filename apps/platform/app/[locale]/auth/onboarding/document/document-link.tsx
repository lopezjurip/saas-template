"use client";

import Link from "next/link";
import { useLocaleParam } from "~/hooks/use-locale-param";

export function DocumentLink() {
  const locale = useLocaleParam();
  return (
    <Link href={`/${locale}/auth/onboarding`} className="sc-btn sc-btn-outline sc-btn-block">
      <span>Volver al inicio</span>
    </Link>
  );
}
