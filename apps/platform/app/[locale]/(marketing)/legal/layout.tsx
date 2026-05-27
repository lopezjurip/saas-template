export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12">
      <article className="prose prose-sm max-w-none dark:prose-invert">{children}</article>
    </main>
  );
}
