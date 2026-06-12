import { redirect } from "next/navigation";

export default async function LegalIndexPage(props: PageProps<"/[locale]/legal">) {
  redirect("/[locale]/legal/terms");
}
