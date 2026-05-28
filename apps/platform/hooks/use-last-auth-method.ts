"use client";

import { useEffect, useState } from "react";
import type { AuthMethod } from "~/app/[locale]/auth/_components/method-button";

const STORAGE_KEY = "humane:last_auth_method";

export function useLastAuthMethod(): AuthMethod | null {
  const [method, setMethod] = useState<AuthMethod | null>(null);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setMethod(raw as AuthMethod);
    } catch {
      setMethod(null);
    }
  }, []);
  return method;
}
