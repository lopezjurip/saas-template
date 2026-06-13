import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { IdCard, Mail, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ComponentProps } from "react";

type IdentityKind = "email" | "phone" | "document";

const IDENTITY_HREF: Record<IdentityKind, Route> = {
  email: "/auth/onboarding/email" as Route,
  phone: "/auth/onboarding/phone" as Route,
  document: "/auth/onboarding/document" as Route,
};

export function IdentityChip({
  kind,
  value,
  className,
  ...props
}: {
  kind: IdentityKind;
  value: string;
} & ComponentProps<"div">) {
  const Icon = kind === "email" ? Mail : kind === "phone" ? Phone : IdCard;
  const metaLabel = kind === "email" ? "Correo" : kind === "phone" ? "Teléfono" : "Documento";
  const href = IDENTITY_HREF[kind];
  return (
    <div {...props} className={cn("flex items-center gap-2.5 rounded-md border bg-muted/45 px-3 py-2.5", className)}>
      <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm/normal font-semibold text-muted-foreground">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">{value}</div>
        <div className="mt-px text-xs text-muted-foreground">{metaLabel}</div>
      </div>
      <Link
        href={href}
        className="rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        Cambiar
      </Link>
    </div>
  );
}
