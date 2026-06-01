import { redirect } from "next/navigation";

// /home/account → /home/account/security (matches the design's default tweak).
export default async function AccountIndexPage(_props: PageProps<"/[locale]/home/account">) {
  redirect("/[locale]/home/account/security");
}
