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
    <div className="sc-identity">
      <div className="sc-identity-avatar">
        <Icon size={15} />
      </div>
      <div className="sc-identity-body">
        <div className="sc-identity-value">{value}</div>
        <div className="sc-identity-meta">{metaLabel}</div>
      </div>
      <Link href={href} className="sc-identity-change">
        Cambiar
      </Link>
    </div>
  );
}
