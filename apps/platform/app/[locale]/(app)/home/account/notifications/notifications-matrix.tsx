"use client";

import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { useState } from "react";
import { useRosetta } from "~/lib/i18n.client";

type RowKey =
  | "sysSecurity"
  | "sysActivity"
  | "sysBilling"
  | "sysInvites"
  | "mktProduct"
  | "mktTips"
  | "mktSurveys"
  | "chanEmail"
  | "chanPush"
  | "chanSms";

type LocaleKey = keyof typeof LOCALE_ES;

type NotifRowDef = {
  key: RowKey;
  titleKey: LocaleKey;
  descKey: LocaleKey;
  locked?: boolean;
};

type NotifGroupDef = {
  titleKey: LocaleKey;
  metaKey?: LocaleKey;
  rows: NotifRowDef[];
};

const NOTIF_GROUPS: NotifGroupDef[] = /*#__PURE__*/ [
  {
    titleKey: "group_system",
    rows: [
      { key: "sysSecurity", titleKey: "sysSecurity_title", descKey: "sysSecurity_desc", locked: true },
      { key: "sysActivity", titleKey: "sysActivity_title", descKey: "sysActivity_desc" },
      { key: "sysBilling", titleKey: "sysBilling_title", descKey: "sysBilling_desc" },
      { key: "sysInvites", titleKey: "sysInvites_title", descKey: "sysInvites_desc" },
    ],
  },
  {
    titleKey: "group_marketing",
    rows: [
      { key: "mktProduct", titleKey: "mktProduct_title", descKey: "mktProduct_desc" },
      { key: "mktTips", titleKey: "mktTips_title", descKey: "mktTips_desc" },
      { key: "mktSurveys", titleKey: "mktSurveys_title", descKey: "mktSurveys_desc" },
    ],
  },
  {
    titleKey: "group_channels",
    metaKey: "group_channels_meta",
    rows: [
      { key: "chanEmail", titleKey: "chanEmail_title", descKey: "chanEmail_desc" },
      { key: "chanPush", titleKey: "chanPush_title", descKey: "chanPush_desc" },
      { key: "chanSms", titleKey: "chanSms_title", descKey: "chanSms_desc" },
    ],
  },
];

const INITIAL_VALUES = /*#__PURE__*/ {
  sysSecurity: true,
  sysActivity: true,
  sysBilling: true,
  sysInvites: true,
  mktProduct: true,
  mktTips: false,
  mktSurveys: false,
  chanEmail: true,
  chanPush: true,
  chanSms: false,
} satisfies Record<RowKey, boolean>;

export function NotificationsMatrix() {
  const { t } = useRosetta(LOCALES);
  const [values, setValues] = useState<Record<string, boolean>>(INITIAL_VALUES);

  function onChange(key: string, next: boolean) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {NOTIF_GROUPS.map((group) => (
        <div key={group.titleKey} className="flex flex-col gap-2.5">
          <div className="flex min-h-7 items-center justify-between gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {t(group.titleKey)}
            </span>
            {group.metaKey && <span className="text-xs text-muted-foreground">{t(group.metaKey)}</span>}
          </div>
          <div className="flex flex-col overflow-hidden rounded-md border bg-background">
            {group.rows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[1fr_auto] items-start gap-3.5 border-b px-4 py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col gap-[3px]">
                  <span className="text-sm font-medium text-foreground">{t(row.titleKey)}</span>
                  <span className="text-pretty text-xs leading-relaxed text-muted-foreground">{t(row.descKey)}</span>
                  {row.locked && (
                    <span className="mt-0.5 text-tiny tracking-[0.03em] text-muted-foreground">
                      {t("locked_always_on")}
                    </span>
                  )}
                </div>
                <Switch
                  checked={values[row.key]}
                  disabled={row.locked}
                  onCheckedChange={(next) => onChange(row.key, next)}
                  aria-label={t(row.titleKey)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const LOCALE_ES = {
  // group titles
  group_system: "Sistema y seguridad",
  group_marketing: "Producto y marketing",
  group_channels: "Canales",
  group_channels_meta: "Dónde te llegan las que activaste",
  // system rows
  sysSecurity_title: "Alertas de seguridad",
  sysSecurity_desc: "Inicio de sesión desde un dispositivo nuevo, cambio de contraseña, agregación de un método.",
  sysActivity_title: "Actividad semanal",
  sysActivity_desc: "Resumen de tus sesiones activas y dispositivos.",
  sysBilling_title: "Cambios en facturación",
  sysBilling_desc: "Cobros, fallos de pago y cambios de plan en tus organizaciones.",
  sysInvites_title: "Invitaciones a organizaciones",
  sysInvites_desc: "Cuando alguien te invita a unirte a su organización.",
  // marketing rows
  mktProduct_title: "Novedades del producto",
  mktProduct_desc: "Funciones nuevas, betas abiertas, mejoras importantes. Una vez al mes.",
  mktTips_title: "Tips y guías",
  mktTips_desc: "Trucos cortos para aprovechar mejor la herramienta.",
  mktSurveys_title: "Encuestas y entrevistas",
  mktSurveys_desc: "Ayúdanos a mejorar. A veces hay incentivo.",
  // channel rows
  chanEmail_title: "Correo electrónico",
  chanEmail_desc: "juan@empresa.com",
  chanPush_title: "Push en el navegador",
  chanPush_desc: "Activo en este Mac · Chrome",
  chanSms_title: "SMS",
  chanSms_desc: "+56 9 1234 5678 · solo alertas críticas",
  // locked label
  locked_always_on: "Siempre activa por seguridad",
};

const LOCALE_EN: typeof LOCALE_ES = {
  group_system: "System & security",
  group_marketing: "Product & marketing",
  group_channels: "Channels",
  group_channels_meta: "Where your active notifications arrive",
  sysSecurity_title: "Security alerts",
  sysSecurity_desc: "Sign-in from a new device, password change, new method added.",
  sysActivity_title: "Weekly activity",
  sysActivity_desc: "Summary of your active sessions and devices.",
  sysBilling_title: "Billing changes",
  sysBilling_desc: "Charges, payment failures, and plan changes in your organizations.",
  sysInvites_title: "Organization invitations",
  sysInvites_desc: "When someone invites you to join their organization.",
  mktProduct_title: "Product updates",
  mktProduct_desc: "New features, open betas, important improvements. Once a month.",
  mktTips_title: "Tips & guides",
  mktTips_desc: "Short tricks to get more out of the tool.",
  mktSurveys_title: "Surveys & interviews",
  mktSurveys_desc: "Help us improve. Sometimes there is an incentive.",
  chanEmail_title: "Email",
  chanEmail_desc: "juan@empresa.com",
  chanPush_title: "Browser push",
  chanPush_desc: "Active on this Mac · Chrome",
  chanSms_title: "SMS",
  chanSms_desc: "+56 9 1234 5678 · critical alerts only",
  locked_always_on: "Always on for security",
};

const LOCALE_PT: typeof LOCALE_ES = {
  group_system: "Sistema e segurança",
  group_marketing: "Produto e marketing",
  group_channels: "Canais",
  group_channels_meta: "Onde chegam as que você ativou",
  sysSecurity_title: "Alertas de segurança",
  sysSecurity_desc: "Entrada de um novo dispositivo, alteração de senha, adição de um método.",
  sysActivity_title: "Atividade semanal",
  sysActivity_desc: "Resumo das suas sessões ativas e dispositivos.",
  sysBilling_title: "Alterações de cobrança",
  sysBilling_desc: "Cobranças, falhas de pagamento e mudanças de plano nas suas organizações.",
  sysInvites_title: "Convites para organizações",
  sysInvites_desc: "Quando alguém te convida para entrar na organização.",
  mktProduct_title: "Novidades do produto",
  mktProduct_desc: "Novas funcionalidades, betas abertos, melhorias importantes. Uma vez por mês.",
  mktTips_title: "Dicas e guias",
  mktTips_desc: "Truques rápidos para aproveitar melhor a ferramenta.",
  mktSurveys_title: "Pesquisas e entrevistas",
  mktSurveys_desc: "Ajude-nos a melhorar. Às vezes há incentivo.",
  chanEmail_title: "E-mail",
  chanEmail_desc: "juan@empresa.com",
  chanPush_title: "Push no navegador",
  chanPush_desc: "Ativo neste Mac · Chrome",
  chanSms_title: "SMS",
  chanSms_desc: "+56 9 1234 5678 · somente alertas críticos",
  locked_always_on: "Sempre ativo por segurança",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
