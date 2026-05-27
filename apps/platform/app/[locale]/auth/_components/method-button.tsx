"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

const STORAGE_KEY = "humane:last_auth_method";

export type AuthMethod = "email" | "phone" | "document";

export function rememberAuthMethod(method: AuthMethod) {
  try {
    window.localStorage.setItem(STORAGE_KEY, method);
  } catch {
    // best-effort
  }
}

export function MethodButton({
  method,
  href,
  label,
  recentLabel,
  variant = "secondary",
}: {
  method: AuthMethod;
  href: string;
  label: string;
  recentLabel: string;
  variant?: "default" | "secondary" | "outline";
}) {
  const [isRecent, setIsRecent] = useState(false);

  useEffect(() => {
    try {
      setIsRecent(window.localStorage.getItem(STORAGE_KEY) === method);
    } catch {
      setIsRecent(false);
    }
  }, [method]);

  return (
    <Button asChild variant={variant} className="w-full justify-between">
      <Link href={href} onClick={() => rememberAuthMethod(method)}>
        <span>{label}</span>
        {isRecent ? (
          <Badge variant="default" className="ml-2 text-xs">
            {recentLabel}
          </Badge>
        ) : null}
      </Link>
    </Button>
  );
}
