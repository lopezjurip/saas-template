import { LEGAL_LOCALE } from "./_legal/docs";
import { LegalSidebar } from "./_legal/sidebar";

export default async function LegalLayout(props: LayoutProps<"/[locale]/legal">) {
  const { locale } = await props.params;
  const legalLocale = LEGAL_LOCALE(locale);

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_220px]">
        <LegalSidebar locale={legalLocale} />
        {props.children}
      </div>
    </main>
  );
}
