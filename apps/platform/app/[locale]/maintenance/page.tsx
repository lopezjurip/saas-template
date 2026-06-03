import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SystemMessage } from "~/components/system-message";
import { IS_SUPPORTED_LOCALE } from "~/lib/i18n";

export const metadata: Metadata = { title: "503" };

export default async function MaintenancePage(props: PageProps<"/[locale]/maintenance">) {
  const { locale } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();
  return <SystemMessage kind="maintenance" locale={locale} />;
}
