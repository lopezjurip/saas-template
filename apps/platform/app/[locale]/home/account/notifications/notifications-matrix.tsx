"use client";

import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { useState } from "react";

type NotifRow = {
  key: string;
  title: string;
  desc: string;
  locked?: boolean;
};

type NotifGroup = {
  title: string;
  meta?: string;
  rows: NotifRow[];
};

const NOTIF_GROUPS: NotifGroup[] = /*#__PURE__*/ [
  {
    title: "Sistema y seguridad",
    rows: [
      {
        key: "sysSecurity",
        title: "Alertas de seguridad",
        desc: "Inicio de sesión desde un dispositivo nuevo, cambio de contraseña, agregación de un método.",
        locked: true,
      },
      {
        key: "sysActivity",
        title: "Actividad semanal",
        desc: "Resumen de tus sesiones activas y dispositivos.",
      },
      {
        key: "sysBilling",
        title: "Cambios en facturación",
        desc: "Cobros, fallos de pago y cambios de plan en tus organizaciones.",
      },
      {
        key: "sysInvites",
        title: "Invitaciones a organizaciones",
        desc: "Cuando alguien te invita a unirte a su organización.",
      },
    ],
  },
  {
    title: "Producto y marketing",
    rows: [
      {
        key: "mktProduct",
        title: "Novedades del producto",
        desc: "Funciones nuevas, betas abiertas, mejoras importantes. Una vez al mes.",
      },
      {
        key: "mktTips",
        title: "Tips y guías",
        desc: "Trucos cortos para aprovechar mejor la herramienta.",
      },
      {
        key: "mktSurveys",
        title: "Encuestas y entrevistas",
        desc: "Ayúdanos a mejorar. A veces hay incentivo.",
      },
    ],
  },
  {
    title: "Canales",
    meta: "Dónde te llegan las que activaste",
    rows: [
      { key: "chanEmail", title: "Correo electrónico", desc: "juan@empresa.com" },
      { key: "chanPush", title: "Push en el navegador", desc: "Activo en este Mac · Chrome" },
      { key: "chanSms", title: "SMS", desc: "+56 9 1234 5678 · solo alertas críticas" },
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
} satisfies Record<string, boolean>;

export function NotificationsMatrix() {
  const [values, setValues] = useState<Record<string, boolean>>(INITIAL_VALUES);

  function onChange(key: string, next: boolean) {
    setValues((prev) => ({ ...prev, [key]: next }));
  }

  return (
    <div className="flex flex-col gap-[22px]">
      {NOTIF_GROUPS.map((group) => (
        <div key={group.title} className="flex flex-col gap-2.5">
          <div className="flex min-h-7 items-center justify-between gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {group.title}
            </span>
            {group.meta && <span className="text-[11.5px] text-muted-foreground">{group.meta}</span>}
          </div>
          <div className="flex flex-col overflow-hidden rounded-md border bg-background">
            {group.rows.map((row) => (
              <div
                key={row.key}
                className="grid grid-cols-[1fr_auto] items-start gap-3.5 border-b px-4 py-3.5 last:border-b-0"
              >
                <div className="flex min-w-0 flex-col gap-[3px]">
                  <span className="text-[13.5px] font-medium text-foreground">{row.title}</span>
                  <span className="text-pretty text-xs leading-relaxed text-muted-foreground">{row.desc}</span>
                  {row.locked && (
                    <span className="mt-0.5 text-[10.5px] tracking-[0.03em] text-muted-foreground">
                      Siempre activa por seguridad
                    </span>
                  )}
                </div>
                <Switch
                  checked={values[row.key]}
                  disabled={row.locked}
                  onCheckedChange={(next) => onChange(row.key, next)}
                  aria-label={row.title}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
