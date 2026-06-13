import { createServerClient, getSupabaseServerUser } from "@packages/supabase/client.server";
import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { SINGLE } from "@packages/utils/array";
import { Archive, Inbox, MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ROSETTA } from "~/lib/i18n";
import { ROUTE } from "~/lib/route";

export async function generateMetadata(props: PageProps<"/[locale]/home/inbox">) {
  const { locale } = await props.params;
  const { t } = ROSETTA(LOCALES_META, locale);
  return { title: t("title") };
}

export default async function InboxPage(props: PageProps<"/[locale]/home/inbox">) {
  const { locale } = await props.params;
  const sp = await props.searchParams;
  const filter = SINGLE(sp["filter"]) ?? "open";
  const includeArchived = filter === "archived";

  const user = await getSupabaseServerUser();
  if (!user) redirect(`/[locale]/auth?next=${encodeURIComponent("/[locale]/home/inbox")}`);

  const supabase = await createServerClient();
  const { data: rows, error } = await supabase.rpc("viewer_conversations", {
    include_archived: includeArchived,
  });

  const { t } = ROSETTA(LOCALES, locale);

  const conversations = (rows ?? []) as Array<Record<string, unknown>>;

  const openHref = ROUTE("/[locale]/home/inbox", { locale, filter: "open" });
  const archivedHref = ROUTE("/[locale]/home/inbox", { locale, filter: "archived" });

  return (
    <div className="flex h-full flex-col">
      <div className="border-border flex shrink-0 items-center gap-3 border-b px-6 py-4">
        <Inbox size={18} className="text-muted-foreground" />
        <h1 className="text-base font-semibold">{t("title")}</h1>
      </div>

      <div className="border-border flex shrink-0 items-center gap-1 border-b px-4 py-2">
        <Link
          href={openHref}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            !includeArchived
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          {t("filterOpen")}
        </Link>
        <Link
          href={archivedHref}
          className={cn(
            "rounded-md px-3 py-1 text-sm font-medium transition-colors",
            includeArchived
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
          )}
        >
          {t("filterArchived")}
        </Link>
      </div>

      {error ? (
        <div className="flex flex-1 items-center justify-center">
          <p className="text-destructive text-sm">{t("loadError")}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <MessageSquare size={32} className="text-muted-foreground/40" />
          <p className="text-muted-foreground text-sm">{includeArchived ? t("emptyArchived") : t("emptyOpen")}</p>
        </div>
      ) : (
        <div className="divide-border flex-1 divide-y overflow-y-auto">
          {conversations.map((conv) => {
            const id = conv["conversation_id"] as string;
            const subject = (conv["conversation_subject"] as string | null) || t("noSubject");
            const status = conv["conversation_status"] as string;
            const orgId = conv["organization_id"] as number | null;
            const agencyId = conv["agency_id"] as string | null;
            const lastAt = conv["conversation_last_message_at"] as string;

            const scopeLabel = orgId ? t("scopeOrg") : agencyId ? t("scopeAgency") : t("scopePersonal");
            const dateStr = new Date(lastAt).toLocaleDateString(locale, { month: "short", day: "numeric" });

            return (
              <Link
                key={id}
                href={ROUTE("/[locale]/home/inbox/[conversation_id]", { locale, conversation_id: id })}
                className="hover:bg-accent/50 flex items-start gap-3 px-6 py-4 transition-colors"
              >
                <Archive size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium">{subject}</span>
                    <Badge variant="outline" className="shrink-0 text-tiny">
                      {scopeLabel}
                    </Badge>
                    {status === "open" && (
                      <Badge variant="secondary" className="shrink-0 text-tiny">
                        {t("statusOpen")}
                      </Badge>
                    )}
                  </div>
                  <span className="text-muted-foreground text-xs">{dateStr}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const LOCALE_ES_META = {
  title: "Bandeja de entrada",
};

const LOCALE_EN_META: typeof LOCALE_ES_META = {
  title: "Inbox",
};

const LOCALE_PT_META: typeof LOCALE_ES_META = {
  title: "Caixa de entrada",
};

const LOCALES_META = { es: LOCALE_ES_META, en: LOCALE_EN_META, pt: LOCALE_PT_META };

const LOCALE_ES = {
  title: "Bandeja de entrada",
  filterOpen: "Abiertas",
  filterArchived: "Archivadas",
  loadError: "Error cargando conversaciones",
  emptyOpen: "No hay conversaciones abiertas",
  emptyArchived: "No hay conversaciones archivadas",
  noSubject: "(Sin asunto)",
  scopeOrg: "Org",
  scopeAgency: "Agencia",
  scopePersonal: "Personal",
  statusOpen: "Abierta",
};

const LOCALE_EN: typeof LOCALE_ES = {
  title: "Inbox",
  filterOpen: "Open",
  filterArchived: "Archived",
  loadError: "Error loading conversations",
  emptyOpen: "No open conversations",
  emptyArchived: "No archived conversations",
  noSubject: "(No subject)",
  scopeOrg: "Org",
  scopeAgency: "Agency",
  scopePersonal: "Personal",
  statusOpen: "Open",
};

const LOCALE_PT: typeof LOCALE_ES = {
  title: "Caixa de entrada",
  filterOpen: "Abertas",
  filterArchived: "Arquivadas",
  loadError: "Erro ao carregar conversas",
  emptyOpen: "Sem conversas abertas",
  emptyArchived: "Sem conversas arquivadas",
  noSubject: "(Sem assunto)",
  scopeOrg: "Org",
  scopeAgency: "Agência",
  scopePersonal: "Pessoal",
  statusOpen: "Aberta",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
