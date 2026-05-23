import { Link, Text as TextBase, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";
import type { BlockContent, DefinitionContent, ListItem, PhrasingContent, RootContent } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { tw } from "../lib/tw";

function Inline({ nodes }: { nodes: PhrasingContent[] }): React.ReactNode {
  return nodes.map((node, i) => {
    switch (node.type) {
      case "text":
        return <TextBase key={i}>{node.value}</TextBase>;
      case "strong":
        return (
          <TextBase key={i} style={{ fontWeight: 700 }}>
            <Inline nodes={node.children} />
          </TextBase>
        );
      case "emphasis":
        return (
          <TextBase key={i} style={{ fontStyle: "italic" }}>
            <Inline nodes={node.children} />
          </TextBase>
        );
      case "link":
        return (
          <Link key={i} src={node.url}>
            <Inline nodes={node.children as PhrasingContent[]} />
          </Link>
        );
      case "inlineCode":
        return <TextBase key={i}>{node.value}</TextBase>;
      default:
        return null;
    }
  });
}

function MdListItem({ item, index, ordered }: { item: ListItem; index: number; ordered: boolean }) {
  const inline = item.children.flatMap((c) => (c.type === "paragraph" ? (c.children as PhrasingContent[]) : []));
  const marker = ordered ? `${index + 1}.` : "•";
  return (
    <View wrap={false} style={tw("flex flex-row ml-4 my-0")}>
      <TextBase style={tw("w-6")}>{marker}</TextBase>
      <TextBase style={tw("flex-1 text-left")}>
        <Inline nodes={inline} />
      </TextBase>
    </View>
  );
}

function Block({ node }: { node: RootContent | BlockContent | DefinitionContent }) {
  switch (node.type) {
    case "paragraph":
      return (
        <TextBase style={tw("my-2")}>
          <Inline nodes={node.children} />
        </TextBase>
      );
    case "heading": {
      const fontSize = node.depth <= 1 ? 16 : node.depth <= 2 ? 14 : 12;
      return (
        <TextBase minPresenceAhead={40} style={{ ...tw("mt-6 mb-2"), fontWeight: 700, fontSize }}>
          <Inline nodes={node.children} />
        </TextBase>
      );
    }
    case "list":
      return (
        <View style={tw("my-2 ml-2")}>
          {node.children.map((item, j) => (
            <MdListItem key={j} item={item} index={j} ordered={!!node.ordered} />
          ))}
        </View>
      );
    case "thematicBreak":
      return <View style={{ borderBottom: 1, marginVertical: 8 }} />;
    case "blockquote":
      return (
        <View style={{ borderLeft: 2, paddingLeft: 8, marginVertical: 4 }}>
          {node.children.map((child, j) => (
            <Block key={j} node={child} />
          ))}
        </View>
      );
    default:
      return null;
  }
}

export function Markdown({ children: markdown, style }: { children: string; style?: Style }) {
  const ast = unified().use(remarkParse).parse(markdown);
  return (
    <View style={style}>
      {ast.children.map((node, i) => (
        <Block key={i} node={node} />
      ))}
    </View>
  );
}
