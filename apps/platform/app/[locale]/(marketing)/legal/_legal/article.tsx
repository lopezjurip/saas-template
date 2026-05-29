import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Download, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { LEGAL_COPY, LEGAL_DOCS, LEGAL_NAV, type LegalLocale, type LegalSection } from "./docs";

export function LegalArticle({ locale, section }: { locale: LegalLocale; section: LegalSection }) {
  const copy = LEGAL_COPY[locale];
  const doc = LEGAL_DOCS[locale][section];
  const nav = LEGAL_NAV[locale].find((n) => n.id === section);
  const slug = nav ? nav.path.replace("/legal/", "") : section;

  return (
    <>
      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-4">
          <nav aria-label="Breadcrumb">
            <ol className="text-muted-foreground flex items-center gap-1.5 font-mono text-xs">
              <li>
                <Link href={`/${locale}/legal`} className="hover:text-foreground no-underline">
                  /legal
                </Link>
              </li>
              <li className="opacity-50" aria-hidden="true">
                /
              </li>
              <li className="text-foreground" aria-current="page">
                {slug}
              </li>
            </ol>
          </nav>

          <h1 className="m-0 text-[36px] leading-[1.1] font-semibold tracking-[-0.025em] text-balance sm:text-[44px]">
            {doc.title}
          </h1>

          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-[12.5px]">
            <span className="font-mono">
              {copy.lastUpdated}: {doc.updated}
            </span>
            <span className="opacity-50" aria-hidden="true">
              ·
            </span>
            <Button
              asChild
              variant="link"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-auto gap-1 p-0"
            >
              <a href={`/${locale}/legal/${slug}`} download>
                <Download className="size-3" /> {copy.download}
              </a>
            </Button>
          </div>

          <div className="border-border bg-muted/30 flex max-w-[68ch] items-start gap-3 rounded-xl border border-dashed px-4 py-3.5">
            <span className="bg-foreground text-background mt-px inline-flex size-6 shrink-0 items-center justify-center rounded-md">
              <ShieldCheck className="size-3" />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.06em] uppercase">
                {copy.summaryTitle}
              </span>
              <p className="text-foreground m-0 text-[13.5px] leading-[1.55] text-pretty">{doc.summary}</p>
            </div>
          </div>
        </header>

        <div className="flex max-w-[68ch] flex-col gap-9">
          {doc.sections.map((s) => (
            <section key={s.id} id={s.id} className="flex scroll-mt-20 flex-col gap-3">
              <h2 className="text-foreground m-0 text-[18px] font-semibold tracking-[-0.015em]">{s.title}</h2>
              {s.body.map((paragraph) => (
                <p key={paragraph} className="text-muted-foreground m-0 text-[14px] leading-[1.7] text-pretty">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="text-muted-foreground m-0 max-w-[68ch] border-t pt-5 font-mono text-[12.5px] tracking-[0.01em]">
          {copy.feedback}
        </p>
      </article>

      <aside className="hidden xl:sticky xl:top-20 xl:block xl:self-start">
        <div className="flex flex-col gap-2.5">
          <span className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.08em] uppercase">
            {copy.tocTitle}
          </span>
          <nav className="flex flex-col gap-1 border-l pl-3" aria-label={copy.tocTitle}>
            {doc.sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="text-muted-foreground hover:text-foreground -ml-3 border-l border-transparent py-1 pl-3 text-[12.5px] no-underline"
              >
                {s.title}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
