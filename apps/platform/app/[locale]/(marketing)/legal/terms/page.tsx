import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Markdown } from "~/components/markdown";

export default async function LegalTermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const base = join(process.cwd(), "content", "legal");
  let content: string;
  try {
    content = await readFile(join(base, locale, "terms.md"), "utf-8");
  } catch {
    content = await readFile(join(base, "es", "terms.md"), "utf-8");
  }
  return <Markdown>{content}</Markdown>;
}
