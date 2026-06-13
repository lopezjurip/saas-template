import type { Metadata } from "next";
import { SystemMessage } from "~/components/system-message";

export const metadata: Metadata = { title: "503" };

export default async function MaintenancePage(props: PageProps<"/maintenance">) {
  return <SystemMessage kind="maintenance" />;
}
