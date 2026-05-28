import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type React from "react";

export function StepHeader({
  backHref,
  title,
  subtitle,
}: {
  backHref: string;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3.5">
      <Link href={backHref} className="sc-back">
        <ArrowLeft size={14} /> Volver
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[22px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="m-0 text-[13px] text-[var(--muted-foreground)]">{subtitle}</p>}
      </div>
    </div>
  );
}
