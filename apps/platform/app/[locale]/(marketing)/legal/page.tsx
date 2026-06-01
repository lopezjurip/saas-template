import { redirect } from "next/navigation";

export default async function LegalIndexPage(_props: PageProps<"/[locale]/legal">) {
  redirect("/[locale]/legal/terms");
}
