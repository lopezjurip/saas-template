"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { RUT_FORMAT, RUT_NORMALIZE } from "@packages/utils/rut";
import { ArrowRight, ChevronDown, IdCard, Mail, Phone, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLastAuthMethod } from "~/hooks/use-last-auth-method";
import { AUTH_TWEAKS } from "~/lib/auth-tweaks";
import { AuthCard } from "./_components/auth-card";
import { AuthFooter, AuthHeader } from "./_components/auth-header";
import { rememberAuthMethod } from "./_components/method-button";
import { actionContinueAuth, signInWithOAuth } from "./actions";
import { MAIN_OAUTH, MORE_OAUTH, type OAuthProvider } from "./providers";

type LocalType = "email" | "phone" | "document";

type LocalTypeConfig = {
  label: string;
  Icon: React.ComponentType<{ size?: number }>;
  placeholder: string;
  autoComplete: string;
  inputType: string;
};

const LOCAL_CONFIG: Record<LocalType, LocalTypeConfig> = {
  email: { label: "Correo", Icon: Mail, placeholder: "tu@empresa.cl", autoComplete: "email", inputType: "email" },
  phone: { label: "Teléfono", Icon: Phone, placeholder: "+56 9 1234 5678", autoComplete: "tel", inputType: "tel" },
  document: { label: "Documento", Icon: IdCard, placeholder: "12.345.678-9", autoComplete: "off", inputType: "text" },
};

function FORMAT_RUT_TYPING(raw: string): string {
  const cleaned = RUT_NORMALIZE(raw);
  if (!cleaned) return "";
  return RUT_FORMAT(cleaned);
}

function DETECT_LOCAL_TYPE(value: string): LocalType | null {
  const v = value.trim();
  if (!v) return null;
  if (v.includes("@")) return "email";
  if (/[kK]/.test(v) || /\d-[\dkK]$/.test(v.replace(/\./g, ""))) return "document";
  const digits = v.replace(/\D/g, "");
  if (v.startsWith("+") || (digits.length >= 8 && /^[\d\s\-()+]+$/.test(v) && digits.length <= 15)) {
    if (v.startsWith("+") || /\s/.test(v) || /\(/.test(v)) return "phone";
    if (digits.length >= 10) return "phone";
    return "document";
  }
  return "email";
}

function LocalMethodsSmart({ next }: { next: string }) {
  const [value, setValue] = useState("");
  const detected = DETECT_LOCAL_TYPE(value);
  const Icon = detected ? LOCAL_CONFIG[detected].Icon : Search;
  const fieldName = detected ?? "email";

  function onChange(raw: string) {
    const guess = DETECT_LOCAL_TYPE(raw);
    setValue(guess === "document" && /[\dkK]/.test(raw) ? FORMAT_RUT_TYPING(raw) : raw);
  }

  return (
    <form
      action={actionContinueAuth}
      className="flex flex-col gap-2.5"
      onSubmit={() => detected && rememberAuthMethod(detected)}
    >
      <input type="hidden" name="next" value={next} />
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label htmlFor="smart-input">Cuenta</Label>
          {detected && (
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {LOCAL_CONFIG[detected].label.toLowerCase()} detectado
            </span>
          )}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            <Icon size={16} />
          </span>
          <Input
            id="smart-input"
            name={fieldName}
            className="h-10 pl-9"
            placeholder="Correo, teléfono o RUT"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <p className="mt-1.5 text-muted-foreground text-xs leading-relaxed">
          Si no tienes cuenta, te enviaremos un enlace mágico para crearla.
        </p>
      </div>
      <Button type="submit" className="h-10 w-full">
        <span>Continuar</span>
        <ArrowRight size={16} />
      </Button>
    </form>
  );
}

function LocalMethodsSelector({ next }: { next: string }) {
  const [tab, setTab] = useState<LocalType>("email");
  const [doc, setDoc] = useState("");
  const cfg = LOCAL_CONFIG[tab];

  return (
    <div className="flex flex-col gap-3">
      <div className="inline-grid grid-flow-col auto-cols-fr w-full gap-0 rounded-md bg-muted p-1" role="tablist">
        {(Object.keys(LOCAL_CONFIG) as LocalType[]).map((t) => {
          const TabIcon = LOCAL_CONFIG[t].Icon;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              className="inline-flex h-[30px] items-center justify-center gap-1.5 rounded-sm text-[13px] font-medium text-muted-foreground transition-all data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm"
              data-active={tab === t}
              onClick={() => setTab(t)}
            >
              <TabIcon size={13} />
              <span>{LOCAL_CONFIG[t].label}</span>
            </button>
          );
        })}
      </div>

      <form action={actionContinueAuth} className="flex flex-col gap-3" onSubmit={() => rememberAuthMethod(tab)}>
        <input type="hidden" name="next" value={next} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`local-${tab}`}>{cfg.label}</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              <cfg.Icon size={16} />
            </span>
            <Input
              key={tab}
              id={`local-${tab}`}
              name={tab}
              className="h-10 pl-9"
              placeholder={cfg.placeholder}
              autoComplete={cfg.autoComplete}
              type={cfg.inputType}
              value={tab === "document" ? doc : undefined}
              onChange={tab === "document" ? (e) => setDoc(FORMAT_RUT_TYPING(e.target.value)) : undefined}
              required
            />
          </div>
        </div>
        <Button type="submit" className="h-10 w-full">
          <span>Continuar</span>
          <ArrowRight size={16} />
        </Button>
      </form>
    </div>
  );
}

function OAuthSection({ next }: { next: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const last = useLastAuthMethod();

  const showMore = searchParams.get("social_extras") === "true";

  const expandedQuery = new URLSearchParams(searchParams.toString());
  expandedQuery.set("social_extras", "true");
  const expandedHref = `${pathname}?${expandedQuery.toString()}`;

  function isRecent(p: OAuthProvider) {
    return last === `oauth:${p.id}`;
  }
  const moreHasRecent = MORE_OAUTH.some(isRecent);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2">
        {MAIN_OAUTH.map((p) => (
          <ProviderButton key={p.id} provider={p} recent={isRecent(p)} next={next} />
        ))}
      </div>

      {MORE_OAUTH.length > 0 &&
        (showMore ? (
          <div className="grid gap-2">
            {MORE_OAUTH.map((p) => (
              <ProviderButton key={p.id} provider={p} recent={isRecent(p)} next={next} />
            ))}
          </div>
        ) : (
          <Button asChild variant="ghost" className="relative h-8 w-full text-xs text-muted-foreground">
            <Link href={expandedHref} scroll={false}>
              Más opciones
              <ChevronDown size={12} />
              {moreHasRecent && (
                <span className="absolute -top-2 right-2.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.04em] leading-none text-white">
                  reciente
                </span>
              )}
            </Link>
          </Button>
        ))}
    </div>
  );
}

export default function AuthEntryPage() {
  const next = useSearchParams().get("next") ?? "/";

  return (
    <AuthCard>
      <div className="flex flex-col gap-5.5">
        <AuthHeader />
        <div className="flex flex-col gap-4">
          <OAuthSection next={next} />
          <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.08em] font-medium text-muted-foreground before:h-px before:flex-1 before:bg-border before:content-[''] after:h-px after:flex-1 after:bg-border after:content-['']">
            o usa tu cuenta
          </div>
          {AUTH_TWEAKS.STEP1_VARIANT === "smart" ? (
            <LocalMethodsSmart next={next} />
          ) : (
            <LocalMethodsSelector next={next} />
          )}
        </div>
        <div className="text-center text-[13px] text-muted-foreground">
          ¿Primera vez?{" "}
          <a
            className="cursor-pointer text-foreground underline decoration-border underline-offset-[3px] hover:decoration-foreground"
            href="#"
          >
            Te enviaremos un enlace mágico
          </a>
        </div>
        <AuthFooter />
      </div>
    </AuthCard>
  );
}

function ProviderButton({ provider, recent, next }: { provider: OAuthProvider; recent: boolean; next: string }) {
  return (
    <form action={signInWithOAuth} className="w-full">
      <input type="hidden" name="provider" value={provider.id} />
      <input type="hidden" name="next" value={next} />
      <Button
        type="submit"
        variant="outline"
        className={cn("relative h-10 w-full", recent && "outline outline-2 outline-offset-2 outline-emerald-500")}
      >
        <provider.Mark size={18} />
        <span>Continuar con {provider.label}</span>
        {recent && (
          <span className="absolute -top-2 right-2.5 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.04em] leading-none text-white">
            reciente
          </span>
        )}
      </Button>
    </form>
  );
}
