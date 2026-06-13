import { redirect } from "next/navigation";

export default async function LegalIndexPage(props: PageProps<"/legal">) {
  redirect("/legal/terms");
}
