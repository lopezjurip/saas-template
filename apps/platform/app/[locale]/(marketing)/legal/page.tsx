import { redirect } from "next/navigation";

export default async function LegalIndexPage(props: PageProps<"/[locale]/legal">) {
  const { locale } = await props.params;
  redirect(`/${locale}/legal/terms`);
}
