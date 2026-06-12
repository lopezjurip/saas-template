import { LegalSidebar } from "./_legal/sidebar";

export default async function LegalLayout(props: LayoutProps<"/[locale]/legal">) {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)]">
        <LegalSidebar />
        {props.children}
      </div>
    </main>
  );
}
