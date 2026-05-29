import { IdCard, Mail, Phone } from "lucide-react";
import Link from "next/link";

export function IdentityChip({
  kind,
  value,
  href,
}: {
  kind: "email" | "phone" | "document";
  value: string;
  href: string;
}) {
  const Icon = kind === "email" ? Mail : kind === "phone" ? Phone : IdCard;
  const metaLabel = kind === "email" ? "Correo" : kind === "phone" ? "Teléfono" : "Documento";
  return (
    <div className="flex items-center gap-2.5 rounded-md border bg-muted/45 px-3 py-2.5">
      <div className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-[13px] font-semibold text-muted-foreground">
        <Icon size={15} />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">{value}</div>
        <div className="mt-px text-[11.5px] text-muted-foreground">{metaLabel}</div>
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
