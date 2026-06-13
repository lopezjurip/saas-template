import { redirect } from "next/navigation";

// /home/account → /home/account/security (matches the design's default tweak).
export default async function AccountIndexPage(props: PageProps<"/home/account">) {
  redirect("/home/account/security");
}
