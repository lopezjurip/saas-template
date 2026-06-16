"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@packages/ui-common/shadcn/components/ui/select";
import { Switch } from "@packages/ui-common/shadcn/components/ui/switch";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { EntityLogoControls } from "~/components/entity-logo-controls";
import { useRosetta } from "~/lib/i18n.client";

type Access = "none" | "viewer" | "editor";

export function GeneralSettings({
  organizationId,
  organizationName,
  slug,
  logoSrc,
}: {
  organizationId: number;
  organizationName: string;
  slug: string;
  logoSrc: string | null;
}) {
  const { t } = useRosetta(LOCALES);
  const [autoJoin, setAutoJoin] = useState(false);
  const [access, setAccess] = useState<Access>("none");
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-[26px] px-6 py-8">
      <header className="flex flex-col gap-1.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.08em]">
          {organizationName} · {t("eyebrow")}
        </span>
        <h1 className="text-foreground m-0 text-xl font-semibold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground m-0 max-w-[60ch] text-sm leading-[1.55] text-pretty">{t("subtitle")}</p>
      </header>

      <section className="border-border bg-background flex flex-col gap-4 rounded-xl border p-5">
        <EntityLogoControls
          bucket="organizations"
          ownerKey={String(organizationId)}
          name={organizationName}
          src={logoSrc}
          shape="square"
          helpText={t("logo_hint")}
        />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-name">{t("name_label")}</Label>
          <Input id="org-name" defaultValue={organizationName} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="org-slug">{t("slug_label")}</Label>
          <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm/normal">
              acme.com/o/
            </span>
            <Input id="org-slug" defaultValue={slug} className="pl-[104px]" />
          </div>
          <p className="text-muted-foreground text-xs leading-normal">{t("slug_hint")}</p>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
          {t("access_on_join")}
        </span>
        <div className="border-border bg-background flex flex-col overflow-hidden rounded-md border">
          <div className="border-border grid grid-cols-[1fr_auto] items-start gap-3.5 border-b px-4 py-3.5">
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-foreground text-sm font-medium">{t("auto_join_title")}</span>
              <span className="text-muted-foreground text-xs leading-[1.45] text-pretty">{t("auto_join_desc")}</span>
            </div>
            <Switch checked={autoJoin} onCheckedChange={setAutoJoin} aria-label={t("auto_join_title")} />
          </div>
          <div className="grid grid-cols-[1fr_260px] items-center gap-3.5 px-4 py-3.5">
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-foreground text-sm font-medium">{t("default_access_title")}</span>
              <span className="text-muted-foreground text-xs leading-[1.45] text-pretty">
                {t("default_access_desc")}
              </span>
            </div>
            <Select value={access} onValueChange={(value) => setAccess(value as Access)}>
              <SelectTrigger className="w-full text-sm/normal">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t("access_none")}</SelectItem>
                <SelectItem value="viewer">{t("access_viewer")}</SelectItem>
                <SelectItem value="editor">{t("access_editor")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-[0.06em]">
          {t("danger_zone")}
        </span>
        <div className="border-border bg-background flex flex-col overflow-hidden rounded-xl border">
          <div className="border-border grid grid-cols-[1fr_auto] items-center gap-3.5 border-b px-4 py-3.5">
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-foreground text-sm font-medium">{t("transfer_title")}</span>
              <span className="text-muted-foreground text-xs leading-[1.45]">{t("transfer_desc")}</span>
            </div>
            <Button variant="outline" size="sm">
              {t("transfer_action")}
            </Button>
          </div>
          <div className="grid grid-cols-[1fr_auto] items-center gap-3.5 px-4 py-3.5">
            <div className="flex min-w-0 flex-col gap-[3px]">
              <span className="text-destructive text-sm font-medium">{t("delete_title")}</span>
              <span className="text-muted-foreground text-xs leading-[1.45]">{t("delete_desc")}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteOpen((open) => !open)}
              className="border-destructive/45 text-destructive hover:bg-destructive/6"
            >
              <Trash2 size={14} /> {t("delete_action")}
            </Button>
          </div>
        </div>

        {deleteOpen ? (
          <div className="border-destructive/45 bg-destructive/4 flex flex-col gap-3 rounded-xl border px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <strong className="text-destructive text-sm/normal font-semibold">
                {t("delete_confirm_title", { name: organizationName })}
              </strong>
              <span className="text-muted-foreground text-xs leading-normal text-pretty">
                {t("delete_confirm_desc", { slug })}
              </span>
            </div>
            <Input placeholder={slug} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                {t("cancel")}
              </Button>
              <Button variant="destructive">
                <Trash2 size={15} /> {t("delete_final")}
              </Button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

const LOCALE_ES = {
  eyebrow: "Organización",
  title: "Ajustes de la organización",
  subtitle:
    "La identidad de la organización y qué reciben las personas nuevas al unirse. Cambia cualquier cosa cuando quieras.",
  logo_hint: "Usa una imagen cuadrada. Si no subes una, mostramos las iniciales.",
  remove: "Quitar",
  name_label: "Nombre de la organización",
  slug_label: "Identificador (slug)",
  slug_hint: "Aparece en enlaces y URLs. Cambiarlo rompe los enlaces antiguos.",
  domains: "Dominios",
  add_domain: "Agregar dominio",
  verified: "Verificado",
  pending_dns: "Pendiente · DNS",
  domain_members: "12 personas usan este dominio",
  domain_dns: "Agrega el registro TXT para verificar",
  view_record: "Ver registro",
  access_on_join: "Acceso al unirse",
  auto_join_title: "Unirse automáticamente por dominio",
  auto_join_desc: "Cualquier persona con un correo @empresa.com entra sin invitación.",
  default_access_title: "Permisos por defecto",
  default_access_desc: "Con qué nace una persona nueva. Ajustas lo individual después.",
  access_none: "Sin permisos (el admin los asigna)",
  access_viewer: "Viewer · solo lectura",
  access_editor: "Editor · crea y publica",
  danger_zone: "Zona de riesgo",
  transfer_title: "Transferir propiedad",
  transfer_desc: "Pasa el acceso total y la facturación a otro miembro.",
  transfer_action: "Transferir…",
  delete_title: "Eliminar organización",
  delete_desc: "Borra miembros, invitaciones y contenido. No se puede deshacer.",
  delete_action: "Eliminar…",
  delete_confirm_title: "Eliminar {{name}}",
  delete_confirm_desc: "Escribe {{slug}} para confirmar. Se cerrarán las sesiones de los miembros.",
  cancel: "Cancelar",
  delete_final: "Eliminar definitivamente",
};

const LOCALE_EN: typeof LOCALE_ES = {
  eyebrow: "Organization",
  title: "Organization settings",
  subtitle: "The organization's identity and what new people get when they join. Change anything whenever you want.",
  logo_hint: "Use a square image. If you don't upload one, we show the initials.",
  remove: "Remove",
  name_label: "Organization name",
  slug_label: "Identifier (slug)",
  slug_hint: "Shows up in links and URLs. Changing it breaks old links.",
  domains: "Domains",
  add_domain: "Add domain",
  verified: "Verified",
  pending_dns: "Pending · DNS",
  domain_members: "12 people use this domain",
  domain_dns: "Add the TXT record to verify",
  view_record: "View record",
  access_on_join: "Access on join",
  auto_join_title: "Auto-join by domain",
  auto_join_desc: "Anyone with an @empresa.com email joins without an invitation.",
  default_access_title: "Default permissions",
  default_access_desc: "What a new person starts with. You tweak the individual ones later.",
  access_none: "No permissions (admin assigns them)",
  access_viewer: "Viewer · read only",
  access_editor: "Editor · creates and publishes",
  danger_zone: "Danger zone",
  transfer_title: "Transfer ownership",
  transfer_desc: "Hand full access and billing to another member.",
  transfer_action: "Transfer…",
  delete_title: "Delete organization",
  delete_desc: "Deletes members, invitations and content. Cannot be undone.",
  delete_action: "Delete…",
  delete_confirm_title: "Delete {{name}}",
  delete_confirm_desc: "Type {{slug}} to confirm. Member sessions will be closed.",
  cancel: "Cancel",
  delete_final: "Delete permanently",
};

const LOCALE_PT: typeof LOCALE_ES = {
  eyebrow: "Organização",
  title: "Configurações da organização",
  subtitle:
    "A identidade da organização e o que as novas pessoas recebem ao entrar. Mude qualquer coisa quando quiser.",
  logo_hint: "Use uma imagem quadrada. Se você não enviar uma, mostramos as iniciais.",
  remove: "Remover",
  name_label: "Nome da organização",
  slug_label: "Identificador (slug)",
  slug_hint: "Aparece em links e URLs. Mudá-lo quebra os links antigos.",
  domains: "Domínios",
  add_domain: "Adicionar domínio",
  verified: "Verificado",
  pending_dns: "Pendente · DNS",
  domain_members: "12 pessoas usam este domínio",
  domain_dns: "Adicione o registro TXT para verificar",
  view_record: "Ver registro",
  access_on_join: "Acesso ao entrar",
  auto_join_title: "Entrar automaticamente por domínio",
  auto_join_desc: "Qualquer pessoa com um e-mail @empresa.com entra sem convite.",
  default_access_title: "Permissões padrão",
  default_access_desc: "Com o que uma pessoa nova começa. Você ajusta as individuais depois.",
  access_none: "Sem permissões (o admin as atribui)",
  access_viewer: "Viewer · somente leitura",
  access_editor: "Editor · cria e publica",
  danger_zone: "Zona de risco",
  transfer_title: "Transferir propriedade",
  transfer_desc: "Passe o acesso total e a cobrança para outro membro.",
  transfer_action: "Transferir…",
  delete_title: "Excluir organização",
  delete_desc: "Apaga membros, convites e conteúdo. Não pode ser desfeito.",
  delete_action: "Excluir…",
  delete_confirm_title: "Excluir {{name}}",
  delete_confirm_desc: "Digite {{slug}} para confirmar. As sessões dos membros serão encerradas.",
  cancel: "Cancelar",
  delete_final: "Excluir definitivamente",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
