import { promises as fs } from "node:fs";
import path from "node:path";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { LEGAL_NAV, type LegalLocale, type LegalSection } from "./docs";

async function loadMarkdown(locale: LegalLocale, section: LegalSection): Promise<string | null> {
  try {
    return await fs.readFile(path.join(process.cwd(), "content/legal", locale, `${section}.md`), "utf-8");
  } catch {
    return null;
  }
}

export async function LegalArticle({ locale, section }: { locale: LegalLocale; section: LegalSection }) {
  const content = await loadMarkdown(locale, section);
  const nav = LEGAL_NAV[locale].find((n) => n.id === section);
  const slug = nav ? nav["path"].replace("/legal/", "") : section;

  return (
    <article className="flex flex-col gap-6">
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

      {content ? (
        <div className="prose prose-neutral dark:prose-invert max-w-[68ch]">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Próximamente.</p>
      )}
    </article>
  );
}
