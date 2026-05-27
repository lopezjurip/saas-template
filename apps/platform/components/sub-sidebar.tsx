"use client";

import { cn } from "@packages/ui-common/shadcn/lib/utils";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export type SubSidebarLeaf = {
  kind: "leaf";
  label: string;
  href: string;
  icon?: LucideIcon;
};

export type SubSidebarNode = {
  kind: "node";
  label: string;
  defaultOpen?: boolean;
  icon?: LucideIcon;
  children: SubSidebarItem[];
};

export type SubSidebarItem = SubSidebarLeaf | SubSidebarNode;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function nodeContainsActive(pathname: string, node: SubSidebarNode): boolean {
  return node.children.some((child) =>
    child.kind === "leaf" ? isActive(pathname, child.href) : nodeContainsActive(pathname, child),
  );
}

function TreeLeaf({ leaf }: { leaf: SubSidebarLeaf }) {
  const pathname = usePathname();
  const active = isActive(pathname, leaf.href);
  const Icon = leaf.icon;

  return (
    <Link
      href={leaf.href}
      className={cn(
        "text-muted-foreground hover:text-foreground hover:bg-muted/60 flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active && "bg-muted text-foreground font-medium",
      )}
    >
      {Icon && <Icon size={14} className="shrink-0" />}
      <span className="truncate">{leaf.label}</span>
    </Link>
  );
}

function TreeNode({ node }: { node: SubSidebarNode }) {
  const pathname = usePathname();
  const containsActive = nodeContainsActive(pathname, node);
  const [isOpen, setIsOpen] = useState(node.defaultOpen ?? containsActive);
  const Icon = node.icon;

  return (
    <details open={isOpen} onToggle={(e) => setIsOpen((e.currentTarget as HTMLDetailsElement).open)}>
      <summary
        className={cn(
          "text-muted-foreground hover:text-foreground hover:bg-muted/60 flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors [&::-webkit-details-marker]:hidden [&::marker]:hidden",
          containsActive && "text-foreground",
        )}
      >
        {Icon && <Icon size={13} className="shrink-0" />}
        <span className="flex-1 truncate">{node.label}</span>
        <ChevronRight size={12} className={cn("shrink-0 transition-transform duration-200", isOpen && "rotate-90")} />
      </summary>
      <div
        className="grid transition-[grid-template-rows] duration-200"
        style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="ml-2 flex flex-col gap-0.5 border-l py-1 pl-2">
            {node.children.map((child, i) =>
              child.kind === "leaf" ? <TreeLeaf key={i} leaf={child} /> : <TreeNode key={i} node={child} />,
            )}
          </div>
        </div>
      </div>
    </details>
  );
}

export function SubSidebar({ title, items }: { title: string; items: SubSidebarItem[] }) {
  return (
    <nav aria-label={title} className="bg-background flex h-full w-52 shrink-0 flex-col gap-3 border-r p-3">
      <p className="text-foreground px-2 pt-1 text-sm font-semibold">{title}</p>
      <div className="flex flex-col gap-1">
        {items.map((item, i) =>
          item.kind === "leaf" ? <TreeLeaf key={i} leaf={item} /> : <TreeNode key={i} node={item} />,
        )}
      </div>
    </nav>
  );
}
