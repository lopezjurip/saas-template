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
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 self-start -ml-1.5 rounded-md px-1.5 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <ArrowLeft size={14} /> Volver
      </Link>
      <div className="flex flex-col gap-1">
        <h1 className="m-0 text-[22px] font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="m-0 text-[13px] text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}
