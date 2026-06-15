"use client";

// Local component — used only in notifications/page.tsx

import { createSupabaseBrowserClient } from "@packages/supabase/client.browser";
import type { Database } from "@packages/supabase/types";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { useEffect, useState } from "react";
import { debug } from "~/lib/debug";
import { useRosetta } from "~/lib/i18n.client";

const log = debug("app:[locale]:home:account:notifications:contacts");

type MessageChannel = Database["public"]["Enums"]["message_channel"];
type ContactRow = Database["public"]["Tables"]["profile_contacts"]["Row"];

/** Channels that represent contacts in profile_contacts. */
const CONTACT_CHANNELS: MessageChannel[] = ["email", "whatsapp", "sms"];

function ADD_FORM_ID(channel: MessageChannel): string {
  return `contact-add-${channel}`;
}

/**
 * Contacts management panel: list, add, and remove profile_contacts rows.
 *
 * Verification send is stubbed with a "coming soon" state — the delivery
 * agent (Agent D) must wire the actual send step.
 * contact_verified_at is NOT settable from this UI; only the delivery agent
 * sets it after successful verification.
 */
export function ContactsManage() {
  const { t } = useRosetta(LOCALES);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<MessageChannel | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function loadContacts() {
    const supabase = createSupabaseBrowserClient();
    supabase
      .from("profile_contacts")
      .select("*")
      .order("profile_contact_created_at")
      .then(({ data, error: err }) => {
        if (err) {
          log.error("[loadContacts] fetch failed", { error: err });
        }
        setContacts(data ?? []);
        setLoading(false);
      });
  }

  useEffect(function initialLoad() {
    loadContacts();
  }, []);

  function startAdding(channel: MessageChannel) {
    setAdding(channel);
    setInputValue("");
    setError(null);
  }

  function cancelAdding() {
    setAdding(null);
    setInputValue("");
    setError(null);
  }

  async function submitContact() {
    if (!adding) return;
    const value = inputValue.trim();
    if (!value) {
      setError(t("error_empty"));
      return;
    }

    // Basic client-side validation
    if (adding === "email" && !value.includes("@")) {
      setError(t("error_invalid_email"));
      return;
    }
    if ((adding === "sms" || adding === "whatsapp") && !/^\+[1-9]\d{7,14}$/.test(value.replace(/[\s\-().]/g, ""))) {
      setError(t("error_invalid_phone"));
      return;
    }

    const normalized = adding === "email" ? value.toLowerCase() : value.replace(/[\s\-().]/g, "");

    setSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError(t("error_generic"));
      setSubmitting(false);
      return;
    }

    const { error: upsertError } = await supabase
      .from("profile_contacts")
      .insert({ message_channel: adding, contact_value: normalized, profile_id: user.id });

    setSubmitting(false);

    if (upsertError) {
      if (upsertError.code === "23505") {
        setError(t("error_duplicate"));
      } else {
        log.error("[submitContact] insert failed", { channel: adding, error: upsertError });
        setError(t("error_generic"));
      }
      return;
    }

    setAdding(null);
    setInputValue("");
    loadContacts();
  }

  async function deleteContact(contactId: string) {
    setDeleting(contactId);
    const supabase = createSupabaseBrowserClient();
    const { error: delError } = await supabase.from("profile_contacts").delete().eq("profile_contact_id", contactId);

    if (delError) {
      log.error("[deleteContact] delete failed", { contactId, error: delError });
    } else {
      setContacts((prev) => prev.filter((c) => c["profile_contact_id"] !== contactId));
    }
    setDeleting(null);
  }

  const CHANNEL_LABEL: Record<MessageChannel, string> = {
    email: t("channel_email"),
    sms: t("channel_sms"),
    whatsapp: t("channel_whatsapp"),
    in_app: "",
    web_push: "",
  };

  const CHANNEL_PLACEHOLDER: Record<MessageChannel, string> = {
    email: t("placeholder_email"),
    sms: t("placeholder_phone"),
    whatsapp: t("placeholder_phone"),
    in_app: "",
    web_push: "",
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5">
        <div className="flex min-h-7 items-center gap-2.5">
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {t("section_title")}
          </span>
        </div>
        <div className="flex flex-col overflow-hidden rounded-md border bg-background">
          <div className="px-4 py-3.5">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex min-h-7 items-center gap-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {t("section_title")}
        </span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-md border bg-background">
        {/* Existing contacts */}
        {contacts.map((contact) => {
          const channel = contact["message_channel"] as MessageChannel;
          const isVerified = Boolean(contact["contact_verified_at"]);
          const isDeleting = deleting === contact["profile_contact_id"];

          return (
            <div
              key={contact["profile_contact_id"]}
              className="grid grid-cols-[1fr_auto] items-center gap-3.5 border-b px-4 py-3.5 last:border-b-0"
            >
              <div className="flex min-w-0 flex-col gap-[3px]">
                <span className="text-sm font-medium text-foreground">{contact["contact_value"]}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{CHANNEL_LABEL[channel]}</span>
                  {isVerified ? (
                    <span className="text-tiny font-medium text-green-600 dark:text-green-400">{t("verified")}</span>
                  ) : (
                    <span
                      className="text-tiny font-medium text-amber-600 dark:text-amber-400"
                      title={t("verification_coming_soon_tooltip")}
                    >
                      {/* TODO(delivery): wire verification send to channel sender (Agent D) */}
                      {t("verification_coming_soon")}
                    </span>
                  )}
                </div>
              </div>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => deleteContact(contact["profile_contact_id"])}
                disabled={isDeleting}
                aria-label={t("remove")}
              >
                {t("remove")}
              </Button>
            </div>
          );
        })}

        {/* Add contact form (shown inline when adding) */}
        {adding ? (
          <div className="flex flex-col gap-3 border-b px-4 py-3.5 last:border-b-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {t("add_title", { channel: CHANNEL_LABEL[adding] })}
              </span>
            </div>
            <div className="flex gap-2">
              <Input
                id={ADD_FORM_ID(adding)}
                type={adding === "email" ? "email" : "tel"}
                placeholder={CHANNEL_PLACEHOLDER[adding]}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submitContact();
                  if (e.key === "Escape") cancelAdding();
                }}
                aria-invalid={error ? true : undefined}
                autoFocus
              />
              <Button size="default" onClick={submitContact} disabled={submitting}>
                {t("save")}
              </Button>
              <Button size="default" variant="ghost" onClick={cancelAdding} disabled={submitting}>
                {t("cancel")}
              </Button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        ) : (
          /* Add buttons */
          <div className="flex flex-wrap gap-2 px-4 py-3.5">
            {CONTACT_CHANNELS.map((ch) => (
              <Button key={ch} size="sm" variant="outline" onClick={() => startAdding(ch)}>
                + {CHANNEL_LABEL[ch]}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const LOCALE_ES = {
  section_title: "Contactos",
  channel_email: "Correo electrónico",
  channel_sms: "SMS",
  channel_whatsapp: "WhatsApp",
  placeholder_email: "correo@ejemplo.com",
  placeholder_phone: "+56 9 1234 5678",
  verified: "Verificado",
  verification_coming_soon: "Pendiente de verificación",
  verification_coming_soon_tooltip: "La verificación estará disponible pronto",
  remove: "Eliminar",
  add_title: "Agregar {{channel}}",
  save: "Guardar",
  cancel: "Cancelar",
  error_empty: "El valor no puede estar vacío",
  error_invalid_email: "Ingresa un correo válido",
  error_invalid_phone: "Ingresa un número en formato E.164 (ej: +56912345678)",
  error_duplicate: "Este contacto ya está registrado",
  error_generic: "No pudimos guardar el contacto",
};

const LOCALE_EN: typeof LOCALE_ES = {
  section_title: "Contacts",
  channel_email: "Email",
  channel_sms: "SMS",
  channel_whatsapp: "WhatsApp",
  placeholder_email: "you@example.com",
  placeholder_phone: "+1 555 123 4567",
  verified: "Verified",
  verification_coming_soon: "Verification pending",
  verification_coming_soon_tooltip: "Verification will be available soon",
  remove: "Remove",
  add_title: "Add {{channel}}",
  save: "Save",
  cancel: "Cancel",
  error_empty: "Value cannot be empty",
  error_invalid_email: "Enter a valid email address",
  error_invalid_phone: "Enter a number in E.164 format (e.g. +15551234567)",
  error_duplicate: "This contact is already registered",
  error_generic: "Could not save the contact",
};

const LOCALE_PT: typeof LOCALE_ES = {
  section_title: "Contatos",
  channel_email: "E-mail",
  channel_sms: "SMS",
  channel_whatsapp: "WhatsApp",
  placeholder_email: "voce@exemplo.com",
  placeholder_phone: "+55 11 91234-5678",
  verified: "Verificado",
  verification_coming_soon: "Verificação pendente",
  verification_coming_soon_tooltip: "A verificação estará disponível em breve",
  remove: "Remover",
  add_title: "Adicionar {{channel}}",
  save: "Salvar",
  cancel: "Cancelar",
  error_empty: "O valor não pode estar vazio",
  error_invalid_email: "Insira um e-mail válido",
  error_invalid_phone: "Insira um número no formato E.164 (ex: +5511912345678)",
  error_duplicate: "Este contato já está registrado",
  error_generic: "Não foi possível salvar o contato",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
