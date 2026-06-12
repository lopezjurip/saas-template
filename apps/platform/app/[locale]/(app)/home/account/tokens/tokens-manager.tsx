"use client";

import { Badge } from "@packages/ui-common/shadcn/components/ui/badge";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Checkbox } from "@packages/ui-common/shadcn/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@packages/ui-common/shadcn/components/ui/dialog";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@packages/ui-common/shadcn/components/ui/table";
import { cn } from "@packages/ui-common/shadcn/lib/utils";
import { Copy, KeyRound, Plus } from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";

type TokenRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  created: string;
  lastUsed: string;
  stale?: boolean;
  expired?: boolean;
};

const TOKEN_SCOPES = /*#__PURE__*/ ["read", "write", "billing", "admin"];

function RANDOM_PREFIX(): string {
  const head = Math.random().toString(16).slice(2, 6);
  const tail = Math.random().toString(16).slice(2, 6);
  return `hum_live_${head}…${tail}`;
}

export function TokensManager() {
  const { t } = useRosetta(LOCALES);

  const INITIAL_TOKENS = /*#__PURE__*/ [
    {
      id: "t1",
      name: "CI · deploys",
      prefix: "hum_live_3f9c…7e2b",
      scopes: ["read", "write"],
      created: "12 ene 2026",
      lastUsed: "hace 4 h",
    },
    {
      id: "t2",
      name: "Scripts locales",
      prefix: "hum_live_88a1…1d04",
      scopes: ["read"],
      created: "3 mar 2026",
      lastUsed: "hace 2 días",
    },
    {
      id: "t3",
      name: "Integración Zapier",
      prefix: "hum_live_c512…9aff",
      scopes: ["read", "write"],
      created: "14 abr 2026",
      lastUsed: t("mock_never"),
      stale: true,
    },
  ] satisfies TokenRow[];

  const [tokens, setTokens] = useState<TokenRow[]>(INITIAL_TOKENS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);

  function onToggleScope(scope: string, checked: boolean) {
    setScopes((prev) => (checked ? [...prev, scope] : prev.filter((s) => s !== scope)));
  }

  function onCreate() {
    const trimmed = name.trim();
    if (!trimmed || scopes.length === 0) return;
    setTokens((prev) => [
      {
        id: `t${Date.now()}`,
        name: trimmed,
        prefix: RANDOM_PREFIX(),
        scopes: [...scopes],
        created: t("mock_today"),
        lastUsed: t("mock_never"),
        stale: true,
      },
      ...prev,
    ]);
    setName("");
    setScopes(["read"]);
    setOpen(false);
  }

  function onRevoke(id: string) {
    setTokens((prev) => prev.filter((tk) => tk.id !== id));
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center justify-between gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {t("active_tokens")}
        </span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="h-[30px] gap-1.5 px-3 text-[12.5px]">
              <Plus size={13} strokeWidth={2} /> {t("create_token")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialog_title")}</DialogTitle>
              <DialogDescription>{t("dialog_description")}</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="token-name">{t("label_name")}</Label>
                <Input
                  id="token-name"
                  placeholder={t("placeholder_name")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>{t("label_permissions")}</Label>
                <div className="flex flex-col gap-2">
                  {TOKEN_SCOPES.map((scope) => (
                    <label
                      key={scope}
                      htmlFor={`scope-${scope}`}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-foreground"
                    >
                      <Checkbox
                        id={`scope-${scope}`}
                        checked={scopes.includes(scope)}
                        onCheckedChange={(checked) => onToggleScope(scope, checked === true)}
                      />
                      <span className="font-mono text-[12.5px]">{scope}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("cancel")}
                </Button>
              </DialogClose>
              <Button type="button" onClick={onCreate} disabled={name.trim().length === 0 || scopes.length === 0}>
                {t("create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tokens.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed bg-muted/25 px-5 py-7 text-center">
          <span className="inline-flex size-11 items-center justify-center rounded-xl border bg-background text-foreground">
            <KeyRound size={22} />
          </span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-sm font-medium text-foreground">{t("empty_title")}</strong>
            <span className="text-[12.5px] text-muted-foreground">{t("empty_desc")}</span>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="h-[30px] gap-1.5 px-3 text-[12.5px]">
            <Plus size={13} strokeWidth={2} /> {t("create_first")}
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t("col_name")}</TableHead>
                <TableHead>{t("col_prefix")}</TableHead>
                <TableHead>{t("col_permissions")}</TableHead>
                <TableHead>{t("col_created")}</TableHead>
                <TableHead>{t("col_last_used")}</TableHead>
                <TableHead className="text-right">{t("col_action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tokens.map((tk) => (
                <TableRow key={tk.id} className={cn(tk.expired && "opacity-65")}>
                  <TableCell>
                    <span className="inline-flex flex-wrap items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-[7px] bg-muted text-foreground">
                        <KeyRound size={14} />
                      </span>
                      <span className="text-sm font-medium text-foreground">{tk.name}</span>
                      {tk.expired && (
                        <Badge variant="outline" className="text-tiny">
                          {t("badge_expired")}
                        </Badge>
                      )}
                      {tk.stale && !tk.expired && (
                        <Badge variant="outline" className="text-tiny">
                          {t("badge_stale")}
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-xs text-muted-foreground">{tk.prefix}</span>
                      <button
                        type="button"
                        aria-label={t("aria_copy_prefix")}
                        onClick={() => navigator.clipboard?.writeText(tk.prefix)}
                        className="inline-flex size-[22px] items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                      >
                        <Copy size={12} />
                      </button>
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex flex-wrap gap-1">
                      {tk.scopes.map((sc) => (
                        <Badge key={sc} variant="outline" className="text-tiny">
                          {sc}
                        </Badge>
                      ))}
                    </span>
                  </TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground">{tk.created}</TableCell>
                  <TableCell className="text-[12.5px] text-muted-foreground">{tk.lastUsed}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      onClick={() => onRevoke(tk.id)}
                      className="inline-flex h-[30px] items-center rounded-md px-3 text-[12.5px] font-medium text-destructive hover:bg-accent"
                    >
                      {t("revoke")}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const LOCALE_ES = {
  active_tokens: "Tokens activos",
  create_token: "Crear token",
  dialog_title: "Crear token personal",
  dialog_description: "Dale un nombre descriptivo y elige los permisos. El secreto solo se muestra una vez.",
  label_name: "Nombre",
  placeholder_name: "p. ej. CI · deploys",
  label_permissions: "Permisos",
  cancel: "Cancelar",
  create: "Crear token",
  empty_title: "Aún no tienes tokens",
  empty_desc: "Crea uno cuando necesites integrar con la API.",
  create_first: "Crear mi primer token",
  col_name: "Nombre",
  col_prefix: "Prefijo",
  col_permissions: "Permisos",
  col_created: "Creado",
  col_last_used: "Último uso",
  col_action: "Acción",
  badge_expired: "Caducado",
  badge_stale: "Sin uso",
  aria_copy_prefix: "Copiar prefijo",
  revoke: "Revocar",
  mock_today: "hoy",
  mock_never: "nunca",
};

const LOCALE_EN: typeof LOCALE_ES = {
  active_tokens: "Active tokens",
  create_token: "Create token",
  dialog_title: "Create personal token",
  dialog_description: "Give it a descriptive name and choose permissions. The secret is shown only once.",
  label_name: "Name",
  placeholder_name: "e.g. CI · deploys",
  label_permissions: "Permissions",
  cancel: "Cancel",
  create: "Create token",
  empty_title: "No tokens yet",
  empty_desc: "Create one when you need to integrate with the API.",
  create_first: "Create my first token",
  col_name: "Name",
  col_prefix: "Prefix",
  col_permissions: "Permissions",
  col_created: "Created",
  col_last_used: "Last used",
  col_action: "Action",
  badge_expired: "Expired",
  badge_stale: "Unused",
  aria_copy_prefix: "Copy prefix",
  revoke: "Revoke",
  mock_today: "today",
  mock_never: "never",
};

const LOCALE_PT: typeof LOCALE_ES = {
  active_tokens: "Tokens ativos",
  create_token: "Criar token",
  dialog_title: "Criar token pessoal",
  dialog_description: "Dê um nome descritivo e escolha as permissões. O segredo é exibido apenas uma vez.",
  label_name: "Nome",
  placeholder_name: "ex.: CI · deploys",
  label_permissions: "Permissões",
  cancel: "Cancelar",
  create: "Criar token",
  empty_title: "Nenhum token ainda",
  empty_desc: "Crie um quando precisar integrar com a API.",
  create_first: "Criar meu primeiro token",
  col_name: "Nome",
  col_prefix: "Prefixo",
  col_permissions: "Permissões",
  col_created: "Criado",
  col_last_used: "Último uso",
  col_action: "Ação",
  badge_expired: "Expirado",
  badge_stale: "Sem uso",
  aria_copy_prefix: "Copiar prefixo",
  revoke: "Revogar",
  mock_today: "hoje",
  mock_never: "nunca",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
