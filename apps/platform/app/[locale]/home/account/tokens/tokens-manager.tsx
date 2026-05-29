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
    lastUsed: "nunca",
    stale: true,
  },
] satisfies TokenRow[];

function RANDOM_PREFIX(): string {
  const head = Math.random().toString(16).slice(2, 6);
  const tail = Math.random().toString(16).slice(2, 6);
  return `hum_live_${head}…${tail}`;
}

export function TokensManager() {
  const [tokens, setTokens] = useState<TokenRow[]>(INITIAL_TOKENS);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read"]);

  const onToggleScope = (scope: string, checked: boolean) => {
    setScopes((prev) => (checked ? [...prev, scope] : prev.filter((s) => s !== scope)));
  };

  const onCreate = () => {
    const trimmed = name.trim();
    if (!trimmed || scopes.length === 0) return;
    setTokens((prev) => [
      {
        id: `t${Date.now()}`,
        name: trimmed,
        prefix: RANDOM_PREFIX(),
        scopes: [...scopes],
        created: "hoy",
        lastUsed: "nunca",
        stale: true,
      },
      ...prev,
    ]);
    setName("");
    setScopes(["read"]);
    setOpen(false);
  };

  const onRevoke = (id: string) => {
    setTokens((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center justify-between gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">Tokens activos</span>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="h-[30px] gap-1.5 px-3 text-[12.5px]">
              <Plus size={13} strokeWidth={2} /> Crear token
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear token personal</DialogTitle>
              <DialogDescription>
                Dale un nombre descriptivo y elige los permisos. El secreto solo se muestra una vez.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="token-name">Nombre</Label>
                <Input
                  id="token-name"
                  placeholder="p. ej. CI · deploys"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Permisos</Label>
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
                  Cancelar
                </Button>
              </DialogClose>
              <Button type="button" onClick={onCreate} disabled={name.trim().length === 0 || scopes.length === 0}>
                Crear token
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
            <strong className="text-sm font-medium text-foreground">Aún no tienes tokens</strong>
            <span className="text-[12.5px] text-muted-foreground">Crea uno cuando necesites integrar con la API.</span>
          </div>
          <Button type="button" onClick={() => setOpen(true)} className="h-[30px] gap-1.5 px-3 text-[12.5px]">
            <Plus size={13} strokeWidth={2} /> Crear mi primer token
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border bg-background">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Nombre</TableHead>
                <TableHead>Prefijo</TableHead>
                <TableHead>Permisos</TableHead>
                <TableHead>Creado</TableHead>
                <TableHead>Último uso</TableHead>
                <TableHead className="text-right">Acción</TableHead>
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
                        <Badge variant="outline" className="text-[10.5px]">
                          Caducado
                        </Badge>
                      )}
                      {tk.stale && !tk.expired && (
                        <Badge variant="outline" className="text-[10.5px]">
                          Sin uso
                        </Badge>
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-mono text-[11.5px] text-muted-foreground">{tk.prefix}</span>
                      <button
                        type="button"
                        aria-label="Copiar prefijo"
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
                        <Badge key={sc} variant="outline" className="text-[10.5px]">
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
                      Revocar
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
