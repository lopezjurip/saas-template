import { redirect } from "next/navigation";

// /home/account → /home/account/security (matches the design's default tweak).
export default async function AccountIndexPage(props: PageProps<"/[locale]/home/account">) {
  const { locale } = await props.params;
  redirect(`/${locale}/home/account/security`);
}
