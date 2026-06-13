import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Copy, Download, Mail } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getViewerOrganizationByIdAssert } from "~/hooks/get-viewer-organizations";
import { assertLocale, getRosetta } from "~/lib/i18n.server";

type InvoiceStatus = "paid" | "refunded" | "failed";
type Invoice = { id: string; date: string; amount: string; status: InvoiceStatus };

/** Mock billing data — real plan/usage/invoices land in the billing backend pass. */
const SEATS = 5;
const SEATS_TOTAL = 10;

const INVOICES: Invoice[] = /*#__PURE__*/ [
  { id: "INV-0042", date: "1 may 2026", amount: "$240.00", status: "paid" },
  { id: "INV-0041", date: "1 abr 2026", amount: "$240.00", status: "paid" },
  { id: "INV-0040", date: "1 mar 2026", amount: "$192.00", status: "paid" },
  { id: "INV-0039", date: "1 feb 2026", amount: "$192.00", status: "refunded" },
  { id: "INV-0038", date: "1 ene 2026", amount: "$168.00", status: "failed" },
  { id: "INV-0037", date: "1 dic 2025", amount: "$168.00", status: "paid" },
];

export async function generateMetadata(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/billing">,
): Promise<Metadata> {
  const { t, locale } = await getRosetta(LOCALES);
  return { title: t("page_title") };
}

export default async function OrganizationBillingPage(
  props: PageProps<"/[locale]/t/[tenant_slug]/[organization_id]/settings/billing">,
) {
  const { locale, organization_id: organization_id_param } = await props.params;
  assertLocale(locale);
  const { t } = await getRosetta(LOCALES, locale);

  const organization_id = Number(organization_id_param);
  if (!Number.isInteger(organization_id) || organization_id <= 0) notFound();

  const {
    data: { organization },
  } = await getViewerOrganizationByIdAssert(organization_id);

  const pct = Math.min(100, Math.round((SEATS / SEATS_TOTAL) * 100));
  const free = SEATS_TOTAL - SEATS;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
          {organization["organization_name"]} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
      </header>

      <section className="border-border from-muted/40 to-background flex flex-col gap-4 rounded-xl border bg-linear-to-b p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-1">
            <span className="inline-flex items-center gap-2">
              <span className="text-muted-foreground whitespace-nowrap text-tiny font-semibold uppercase tracking-[0.06em]">
                {t("current_plan")}
              </span>
              <Badge variant="outline" className="text-muted-foreground">
                {t("period_yearly")}
              </Badge>
            </span>
            <span className="text-foreground text-2xl font-semibold leading-[1.1] tracking-tight">Pro</span>
            <span className="text-muted-foreground max-w-[44ch] text-xs text-pretty">{t("plan_blurb")}</span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="text-foreground text-xl font-semibold tabular-nums tracking-tight">$24</span>
            <span className="text-muted-foreground text-xs">{t("plan_per")}</span>
          </div>
        </div>

        <div className="border-border flex flex-col gap-2 border-t pt-3.5">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{t("seats_in_use")}</span>
            <span className="text-foreground font-medium tabular-nums">
              {SEATS} / {SEATS_TOTAL}
            </span>
          </div>
          <div className="bg-muted h-2 overflow-hidden rounded-full">
            <div className="bg-foreground h-full rounded-full" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-muted-foreground text-xs">{t("seats_free", { count: free })}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button size="sm" className="h-9">
            {t("change_plan")}
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            {t("buy_seats")}
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground ml-auto h-9">
            {t("cancel_plan")}
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
          {t("payment_method")}
        </span>
        <div className="flex flex-col gap-2">
          <div className="border-border bg-background grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3">
            <span className="bg-foreground text-background inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-tiny font-bold tracking-wider">
              VISA
            </span>
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-foreground text-sm font-medium">Visa ···· 4242</span>
              <span className="text-muted-foreground text-xs">{t("card_meta")}</span>
            </div>
            <Button variant="outline" size="sm">
              {t("update")}
            </Button>
          </div>
          <div className="border-border bg-background grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md border px-3.5 py-3">
            <span className="bg-muted text-foreground inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
              <Mail size={16} />
            </span>
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-foreground text-sm font-medium">{t("billing_email")}</span>
              <span className="text-muted-foreground text-xs">finanzas@empresa.com</span>
            </div>
            <Button variant="outline" size="sm">
              {t("change")}
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center justify-between gap-2.5">
          <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
            {t("invoices")}
          </span>
          <Button variant="outline" size="sm">
            <Copy size={13} /> {t("export_all")}
          </Button>
        </div>
        <div className="border-border bg-background flex flex-col overflow-hidden rounded-md border">
          {INVOICES.map((inv, i) => (
            <div
              key={inv.id}
              className={cn(
                "grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-3.5 py-2.5",
                i > 0 && "border-border border-t",
              )}
            >
              <span className="text-muted-foreground font-mono text-xs tabular-nums">{inv.id}</span>
              <span className="text-foreground text-xs">{inv.date}</span>
              <span className="text-foreground text-xs font-medium tabular-nums">{inv.amount}</span>
              <InvoiceStatusBadge status={inv.status} label={t(`status_${inv.status}`)} />
              <Button variant="ghost" size="icon" className="size-[30px]" aria-label={t("download_pdf")}>
                <Download size={15} />
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InvoiceStatusBadge({ status, label }: { status: InvoiceStatus; label: string }) {
  if (status === "paid") {
    return (
      <Badge className="border-emerald-600/30 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{label}</Badge>
    );
  }
  if (status === "refunded") {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        {label}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-destructive/35 bg-destructive/10 text-destructive">
      {label}
    </Badge>
  );
}

const LOCALE_ES = {
  page_title: "Facturación",
  eyebrow: "Facturación",
  title: "Plan y facturación",
  subtitle:
    "El plan de esta organización, los asientos en uso y tu historial de pagos. Lo gestiona quien tenga el permiso Facturación.",
  current_plan: "Plan actual",
  period_yearly: "Anual",
  plan_blurb: "Miembros ilimitados, permisos finos, soporte prioritario.",
  plan_per: "por miembro / mes",
  seats_in_use: "Asientos en uso",
  seats_free: "{{count}} asientos disponibles · se factura por asiento ocupado.",
  change_plan: "Cambiar de plan",
  buy_seats: "Comprar asientos",
  cancel_plan: "Cancelar plan",
  payment_method: "Método de pago",
  card_meta: "Expira 04/27 · Juan Pérez",
  billing_email: "Correo de facturación",
  update: "Actualizar",
  change: "Cambiar",
  invoices: "Historial de facturas",
  export_all: "Exportar todo",
  status_paid: "Pagada",
  status_refunded: "Reembolsada",
  status_failed: "Fallida",
  download_pdf: "Descargar PDF",
};

const LOCALE_EN: typeof LOCALE_ES = {
  page_title: "Billing",
  eyebrow: "Billing",
  title: "Plan & billing",
  subtitle:
    "This organization's plan, the seats in use and your payment history. Managed by whoever holds the Billing permission.",
  current_plan: "Current plan",
  period_yearly: "Yearly",
  plan_blurb: "Unlimited members, fine-grained permissions, priority support.",
  plan_per: "per member / month",
  seats_in_use: "Seats in use",
  seats_free: "{{count}} seats available · billed per occupied seat.",
  change_plan: "Change plan",
  buy_seats: "Buy seats",
  cancel_plan: "Cancel plan",
  payment_method: "Payment method",
  card_meta: "Expires 04/27 · Juan Pérez",
  billing_email: "Billing email",
  update: "Update",
  change: "Change",
  invoices: "Invoice history",
  export_all: "Export all",
  status_paid: "Paid",
  status_refunded: "Refunded",
  status_failed: "Failed",
  download_pdf: "Download PDF",
};

const LOCALE_PT: typeof LOCALE_ES = {
  page_title: "Cobrança",
  eyebrow: "Cobrança",
  title: "Plano e cobrança",
  subtitle:
    "O plano desta organização, os assentos em uso e seu histórico de pagamentos. Gerenciado por quem tiver a permissão Cobrança.",
  current_plan: "Plano atual",
  period_yearly: "Anual",
  plan_blurb: "Membros ilimitados, permissões detalhadas, suporte prioritário.",
  plan_per: "por membro / mês",
  seats_in_use: "Assentos em uso",
  seats_free: "{{count}} assentos disponíveis · cobrado por assento ocupado.",
  change_plan: "Mudar de plano",
  buy_seats: "Comprar assentos",
  cancel_plan: "Cancelar plano",
  payment_method: "Forma de pagamento",
  card_meta: "Expira 04/27 · Juan Pérez",
  billing_email: "E-mail de cobrança",
  update: "Atualizar",
  change: "Mudar",
  invoices: "Histórico de faturas",
  export_all: "Exportar tudo",
  status_paid: "Paga",
  status_refunded: "Reembolsada",
  status_failed: "Falhou",
  download_pdf: "Baixar PDF",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
