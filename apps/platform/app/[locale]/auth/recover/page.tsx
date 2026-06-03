import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { SINGLE } from "@packages/utils/array";
import {
  ArrowLeft,
  ArrowRight,
  Fingerprint,
  KeyRound,
  Lock,
  type LucideIcon,
  Mail,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IS_SUPPORTED_LOCALE, ROSETTA } from "~/lib/i18n";
import { AuthCard } from "../_components/auth-card";

type RecoverRoute = "passkey" | "email" | "sms" | "codes";
type RouteDef = { Icon: LucideIcon; metaKey: `${RecoverRoute}_meta` };
const ROUTE_DEFS: Record<RecoverRoute, RouteDef> = /*#__PURE__*/ {
  passkey: { Icon: Fingerprint, metaKey: "passkey_meta" },
  email: { Icon: Mail, metaKey: "email_meta" },
  sms: { Icon: Phone, metaKey: "sms_meta" },
  codes: { Icon: KeyRound, metaKey: "codes_meta" },
};
const ROUTE_ORDER: RecoverRoute[] = /*#__PURE__*/ ["passkey", "email", "sms", "codes"];

export async function generateMetadata(props: PageProps<"/[locale]/auth/recover">): Promise<Metadata> {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES, locale);
  return { title: t("page_title") };
}

export default async function RecoverPage(props: PageProps<"/[locale]/auth/recover">) {
  const { locale } = await props.params;
  if (!IS_SUPPORTED_LOCALE(locale)) notFound();
  const { t } = ROSETTA(LOCALES, locale);
  const sp = await props.searchParams;

  const stage = (SINGLE(sp["stage"]) ?? "choose") as "choose" | "sent" | "locked";
  const route = (SINGLE(sp["route"]) ?? "email") as RecoverRoute;
  const dest = ROUTE_DEFS[route];
  const base = `/${locale}/auth/recover`;

  if (stage === "sent") {
    let title = t("sent_email_title");
    if (route === "codes") title = t("sent_codes_title");
    else if (route === "passkey") title = t("sent_passkey_title");
    else if (route === "sms") title = t("sent_sms_title");

    let desc = t("sent_code_desc", { dest: t(dest.metaKey) });
    if (route === "codes") desc = t("sent_codes_desc");
    else if (route === "passkey") desc = t("sent_passkey_desc");

    return (
      <AuthCard>
        <div className="flex flex-col gap-[22px]">
          <header className="flex flex-col items-center gap-3 text-center">
            <span className="bg-muted text-foreground inline-flex size-10 items-center justify-center rounded-[10px]">
              <dest.Icon size={20} />
            </span>
            <div>
              <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em]">{title}</h1>
              <p className="text-muted-foreground mb-0 mt-1 text-[13px] [text-wrap:pretty]">{desc}</p>
            </div>
          </header>

          {route === "passkey" ? (
            <Button className="w-full">
              <Fingerprint size={16} /> {t("use_passkey")}
            </Button>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="recover-code">{route === "codes" ? t("backup_code") : t("verification_code")}</Label>
              <Input
                id="recover-code"
                className="text-center font-mono text-[15px] tracking-[0.3em]"
                placeholder={route === "codes" ? "XXXX-XXXX" : "••••••"}
              />
              <Button className="mt-1 w-full">
                {t("continue")} <ArrowRight size={16} />
              </Button>
            </div>
          )}

          <div className="flex flex-col items-center gap-3">
            <Link
              href={base}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[12.5px]"
            >
              <ArrowLeft size={14} /> {t("choose_other")}
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  if (stage === "locked") {
    return (
      <AuthCard>
        <div className="flex flex-col gap-[22px]">
          <header className="flex flex-col items-center gap-3 text-center">
            <span className="bg-muted text-muted-foreground inline-flex size-10 items-center justify-center rounded-[10px]">
              <Lock size={20} />
            </span>
            <div>
              <h1 className="m-0 text-[20px] font-semibold tracking-[-0.02em]">{t("locked_title")}</h1>
              <p className="text-muted-foreground mb-0 mt-1 text-[13px] [text-wrap:pretty]">{t("locked_desc")}</p>
            </div>
          </header>

          <div className="border-border bg-muted/35 flex flex-col gap-2.5 rounded-lg border px-4 py-3.5">
            <span className="text-muted-foreground text-[11px] font-semibold uppercase tracking-[0.07em]">
              {t("locked_how")}
            </span>
            <ol className="text-foreground m-0 list-decimal pl-5 text-[12.5px] leading-[1.7]">
              <li>{t("locked_step1")}</li>
              <li>{t("locked_step2")}</li>
              <li>{t("locked_step3")}</li>
            </ol>
          </div>

          <div className="flex flex-col gap-2">
            <Button className="w-full">
              <Mail size={16} /> {t("contact_support")}
            </Button>
            <div className="border-border bg-background flex items-start gap-2 rounded-md border px-3 py-2.5">
              <span className="text-muted-foreground mt-px shrink-0">
                <ShieldCheck size={14} />
              </span>
              <span className="text-muted-foreground text-[12px] leading-[1.5] [text-wrap:pretty]">
                {t("locked_admin")}
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <Link
              href={base}
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[12.5px]"
            >
              <ArrowLeft size={14} /> {t("back")}
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
      <div className="flex flex-col gap-[22px]">
        <header className="flex flex-col items-center gap-3 text-center">
          <span className="bg-muted text-foreground inline-flex size-10 items-center justify-center rounded-[10px]">
            <KeyRound size={20} />
          </span>
          <div>
            <h1 className="m-0 text-[22px] font-semibold tracking-[-0.02em]">{t("choose_title")}</h1>
            <p className="text-muted-foreground mb-0 mt-1 text-[13px] [text-wrap:pretty]">{t("choose_desc")}</p>
          </div>
        </header>

        <div className="flex flex-col gap-2">
          {ROUTE_ORDER.map((id) => {
            const def = ROUTE_DEFS[id];
            return (
              <Link
                key={id}
                href={`${base}?stage=sent&route=${id}`}
                className={cn(
                  "group border-border bg-background grid grid-cols-[34px_1fr_16px] items-center gap-3 rounded-lg border px-3 py-2.5 text-left",
                  "hover:border-foreground/30 hover:bg-accent/50 transition-[background,border-color]",
                )}
              >
                <span className="bg-muted text-foreground inline-flex size-[34px] shrink-0 items-center justify-center rounded-[9px]">
                  <def.Icon size={16} />
                </span>
                <span className="flex min-w-0 flex-col gap-px">
                  <span className="text-foreground text-[13.5px] font-medium">{t(`${id}_label`)}</span>
                  <span className="text-muted-foreground truncate text-[11.5px]">{t(def.metaKey)}</span>
                </span>
                <span className="text-muted-foreground/60 group-hover:text-foreground shrink-0 transition-colors">
                  <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-3">
          <span className="text-muted-foreground text-center text-[12px] [text-wrap:pretty]">
            {t("no_methods")}{" "}
            <Link href={`${base}?stage=locked`} className="text-foreground underline underline-offset-[3px]">
              {t("lost_all")}
            </Link>
          </span>
          <Link
            href={`/${locale}/auth`}
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-[12.5px]"
          >
            <ArrowLeft size={14} /> {t("back_signin")}
          </Link>
        </div>
      </div>
    </AuthCard>
  );
}

const LOCALE_ES = {
  page_title: "Recuperar acceso",
  choose_title: "¿Perdiste el acceso?",
  choose_desc: "Elige otra forma de confirmar que eres tú. Recuperamos tu cuenta, no la creamos de nuevo.",
  passkey_label: "Usar una passkey",
  passkey_meta: "En otro dispositivo donde ya iniciaste sesión",
  email_label: "Código a tu correo",
  email_meta: "j•••@empresa.com",
  sms_label: "Código por SMS",
  sms_meta: "+56 9 •••• 5678",
  codes_label: "Códigos de respaldo",
  codes_meta: "Los que guardaste al activar la seguridad",
  no_methods: "¿No tienes ninguno de estos?",
  lost_all: "Perdí todos mis métodos",
  back_signin: "Volver a iniciar sesión",
  sent_email_title: "Revisa tu correo",
  sent_sms_title: "Revisa tu teléfono",
  sent_passkey_title: "Confirma con tu passkey",
  sent_codes_title: "Ingresa un código de respaldo",
  sent_code_desc: "Enviamos un código a {{dest}}. Caduca en 10 minutos.",
  sent_passkey_desc: "Tu navegador te pedirá la huella, el rostro o el PIN del dispositivo.",
  sent_codes_desc: "Escribe uno de los códigos de un solo uso que guardaste.",
  use_passkey: "Usar passkey",
  verification_code: "Código de verificación",
  backup_code: "Código de respaldo",
  continue: "Continuar",
  choose_other: "Elegir otra forma",
  locked_title: "Recuperación asistida",
  locked_desc:
    "Si perdiste todos tus métodos, podemos verificar tu identidad manualmente. Por seguridad, tarda un poco.",
  locked_how: "Cómo sigue",
  locked_step1: "Nos escribes desde un correo de contacto.",
  locked_step2: "Confirmamos datos de tu cuenta o tu admin valida.",
  locked_step3: "Restablecemos el acceso en 24–48 h hábiles.",
  contact_support: "Escribir a soporte",
  locked_admin:
    "¿Entraste a una organización? Tu admin puede ayudarte a recuperar el acceso más rápido desde Miembros.",
  back: "Volver",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Recover access",
  choose_title: "Lost access?",
  choose_desc: "Pick another way to confirm it's you. We recover your account, we don't create a new one.",
  passkey_label: "Use a passkey",
  passkey_meta: "On another device where you're already signed in",
  email_label: "Code to your email",
  email_meta: "j•••@empresa.com",
  sms_label: "Code via SMS",
  sms_meta: "+56 9 •••• 5678",
  codes_label: "Backup codes",
  codes_meta: "The ones you saved when you set up security",
  no_methods: "Have none of these?",
  lost_all: "I lost all my methods",
  back_signin: "Back to sign in",
  sent_email_title: "Check your email",
  sent_sms_title: "Check your phone",
  sent_passkey_title: "Confirm with your passkey",
  sent_codes_title: "Enter a backup code",
  sent_code_desc: "We sent a code to {{dest}}. It expires in 10 minutes.",
  sent_passkey_desc: "Your browser will ask for your fingerprint, face or device PIN.",
  sent_codes_desc: "Type one of the one-time codes you saved.",
  use_passkey: "Use passkey",
  verification_code: "Verification code",
  backup_code: "Backup code",
  continue: "Continue",
  choose_other: "Choose another way",
  locked_title: "Assisted recovery",
  locked_desc: "If you lost all your methods, we can verify your identity manually. For security, it takes a while.",
  locked_how: "What happens next",
  locked_step1: "You write to us from a contact email.",
  locked_step2: "We confirm your account details or your admin validates.",
  locked_step3: "We restore access in 24–48 business hours.",
  contact_support: "Contact support",
  locked_admin: "Joined an organization? Your admin can help you recover access faster from Members.",
  back: "Back",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Recuperar acesso",
  choose_title: "Perdeu o acesso?",
  choose_desc: "Escolha outra forma de confirmar que é você. Recuperamos sua conta, não a criamos de novo.",
  passkey_label: "Usar uma passkey",
  passkey_meta: "Em outro dispositivo onde você já entrou",
  email_label: "Código para seu e-mail",
  email_meta: "j•••@empresa.com",
  sms_label: "Código por SMS",
  sms_meta: "+56 9 •••• 5678",
  codes_label: "Códigos de backup",
  codes_meta: "Os que você guardou ao ativar a segurança",
  no_methods: "Não tem nenhum destes?",
  lost_all: "Perdi todos os meus métodos",
  back_signin: "Voltar a entrar",
  sent_email_title: "Verifique seu e-mail",
  sent_sms_title: "Verifique seu telefone",
  sent_passkey_title: "Confirme com sua passkey",
  sent_codes_title: "Digite um código de backup",
  sent_code_desc: "Enviamos um código para {{dest}}. Expira em 10 minutos.",
  sent_passkey_desc: "Seu navegador vai pedir a digital, o rosto ou o PIN do dispositivo.",
  sent_codes_desc: "Digite um dos códigos de uso único que você guardou.",
  use_passkey: "Usar passkey",
  verification_code: "Código de verificação",
  backup_code: "Código de backup",
  continue: "Continuar",
  choose_other: "Escolher outra forma",
  locked_title: "Recuperação assistida",
  locked_desc:
    "Se você perdeu todos os seus métodos, podemos verificar sua identidade manualmente. Por segurança, demora um pouco.",
  locked_how: "Como segue",
  locked_step1: "Você nos escreve de um e-mail de contato.",
  locked_step2: "Confirmamos os dados da sua conta ou seu admin valida.",
  locked_step3: "Restabelecemos o acesso em 24–48 h úteis.",
  contact_support: "Falar com o suporte",
  locked_admin: "Entrou em uma organização? Seu admin pode ajudar a recuperar o acesso mais rápido em Membros.",
  back: "Voltar",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
