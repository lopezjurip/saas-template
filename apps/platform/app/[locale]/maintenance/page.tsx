import type { Metadata } from "next";
import { SystemMessage } from "~/components/system-message";
import { assertLocale } from "~/lib/i18n.server";

export const metadata: Metadata = { title: "503" };

export default async function MaintenancePage(props: PageProps<"/[locale]/maintenance">) {
  const { locale } = await props.params;
  assertLocale(locale);
  return <SystemMessage kind="maintenance" />;
}
