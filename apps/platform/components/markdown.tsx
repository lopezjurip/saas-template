import Link from "next/link";
import ReactMarkdown from "react-markdown";

function IS_EXTERNAL(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//");
}

const components: React.ComponentProps<typeof ReactMarkdown>["components"] = {
  a({ href, children }) {
    if (!href) return <a>{children}</a>;
    if (IS_EXTERNAL(href)) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }
    return <Link href={href}>{children}</Link>;
  },
};

export function Markdown({ children }: { children: string }) {
  return <ReactMarkdown components={components}>{children}</ReactMarkdown>;
}
