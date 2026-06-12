import { IS_EXTERNAL } from "@packages/utils/url";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

function MarkdownA({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (!href) return <a>{children}</a>;
  if (IS_EXTERNAL(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return <Link href={href}>{children}</Link>;
}

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  a: MarkdownA,
};

export function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
