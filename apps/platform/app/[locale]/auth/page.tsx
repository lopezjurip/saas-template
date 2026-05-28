"use client";

import { SINGLE } from "@packages/utils/array";
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
          <label className="sc-label" style={{ margin: 0 }} htmlFor="smart-input">
            Cuenta
          </label>
          {detected && (
            <span className="text-[11px] text-[var(--muted-foreground)] inline-flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--recent)]" />
              {LOCAL_CONFIG[detected].label.toLowerCase()} detectado
            </span>
          )}
        </div>
        <div className="sc-input-icon-wrap">
          <span className="sc-input-icon">
            <Icon size={16} />
          </span>
          <input
            id="smart-input"
            name={fieldName}
            className="sc-input"
            placeholder="Correo, teléfono o RUT"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            required
          />
        </div>
        <p className="sc-hint" style={{ marginTop: 6 }}>
          Si no tienes cuenta, te enviaremos un enlace mágico para crearla.
        </p>
      </div>
      <button type="submit" className="sc-btn sc-btn-primary sc-btn-block">
        <span>Continuar</span>
        <ArrowRight size={16} />
      </button>
    </form>
  );
}

function LocalMethodsSelector({ next }: { next: string }) {
  const [tab, setTab] = useState<LocalType>("email");
  const [doc, setDoc] = useState("");
  const cfg = LOCAL_CONFIG[tab];

  return (
    <div className="flex flex-col gap-3">
      <div className="sc-tabs" role="tablist">
        {(Object.keys(LOCAL_CONFIG) as LocalType[]).map((t) => {
          const TabIcon = LOCAL_CONFIG[t].Icon;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              className="sc-tab"
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
        <div>
          <label className="sc-label" htmlFor={`local-${tab}`}>
            {cfg.label}
          </label>
          <div className="sc-input-icon-wrap">
            <span className="sc-input-icon">
              <cfg.Icon size={16} />
            </span>
            <input
              key={tab}
              id={`local-${tab}`}
              name={tab}
              className="sc-input"
              placeholder={cfg.placeholder}
              autoComplete={cfg.autoComplete}
              type={cfg.inputType}
              value={tab === "document" ? doc : undefined}
              onChange={tab === "document" ? (e) => setDoc(FORMAT_RUT_TYPING(e.target.value)) : undefined}
              required
            />
          </div>
        </div>
        <button type="submit" className="sc-btn sc-btn-primary sc-btn-block">
          <span>Continuar</span>
          <ArrowRight size={16} />
        </button>
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
      <div className="sc-oauth-row">
        {MAIN_OAUTH.map((p) => (
          <ProviderButton key={p.id} provider={p} recent={isRecent(p)} next={next} />
        ))}
      </div>

      {MORE_OAUTH.length > 0 &&
        (showMore ? (
          <div className="sc-oauth-row">
            {MORE_OAUTH.map((p) => (
              <ProviderButton key={p.id} provider={p} recent={isRecent(p)} next={next} />
            ))}
          </div>
        ) : (
          <Link
            href={expandedHref}
            scroll={false}
            className="sc-btn sc-btn-ghost sc-btn-block"
            style={{ height: 32, fontSize: 12, color: "var(--muted-foreground)" }}
          >
            Más opciones
            <ChevronDown size={12} />
            {moreHasRecent && <span className="sc-recent-badge">reciente</span>}
          </Link>
        ))}
    </div>
  );
}

export default async function AuthEntryPage(props: PageProps<"/[locale]/auth">) {
  const sp = await props.searchParams;
  const next = SINGLE(sp["next"]) ?? "/";

  return (
    <AuthCard>
      <div className="flex flex-col gap-5.5">
        <AuthHeader />
        <div className="flex flex-col gap-4">
          <OAuthSection next={next} />
          <div className="sc-divider">o usa tu cuenta</div>
          {AUTH_TWEAKS.STEP1_VARIANT === "smart" ? (
            <LocalMethodsSmart next={next} />
          ) : (
            <LocalMethodsSelector next={next} />
          )}
        </div>
        <div className="text-center text-[13px] text-muted-foreground">
          ¿Primera vez?{" "}
          <a className="sc-link" style={{ color: "var(--foreground)" }} href="#">
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
      <button type="submit" className={`sc-btn sc-btn-outline sc-btn-block ${recent ? "sc-recent" : ""}`}>
        <provider.Mark size={18} />
        <span>Continuar con {provider.label}</span>
        {recent && <span className="sc-recent-badge">reciente</span>}
      </button>
    </form>
  );
}
