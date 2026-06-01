"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@packages/ui-common/shadcn/components/ui/alert";
import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@packages/ui-common/shadcn/components/ui/card";
import { Input } from "@packages/ui-common/shadcn/components/ui/input";
import { Label } from "@packages/ui-common/shadcn/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import {
  type DocumentTripletCountry,
  DocumentTripletFields,
} from "~/app/[locale]/auth/_components/document-triplet-fields";
import { useRosetta } from "~/hooks/use-rosetta";
import { ErrorSafeAction, ErrorSafeActionServer, ErrorSafeActionValidation } from "~/lib/safe-action.client";
import { actionCheckDocument, actionVerifyDocumentLoginOtp } from "./actions";
import {
  type CheckDocumentValues,
  checkDocumentSchema,
  type VerifyLoginOtpValues,
  verifyLoginOtpSchema,
} from "./schemas";

const LOCALE_ES = {
  invalid_data: "Datos inválidos",
  invalid_code: "Código inválido",
  send_failed: "No pudimos enviar el código. Intenta de nuevo.",
  otp_sent_to: "Te enviamos un código a",
  code_label: "Código de 6 dígitos",
  verifying: "Verificando…",
  enter: "Entrar",
  change_document: "Cambiar documento",
  pending_invites: "Tienes {{count}} invitaciones pendientes:",
  accept_this: "Aceptar esta invitación",
  triplet_legend: "País + tipo + documento",
  continue: "Continuar",
};

const LOCALES = {
  es: LOCALE_ES,
  en: {
    invalid_data: "Invalid data",
    invalid_code: "Invalid code",
    send_failed: "We couldn't send the code. Try again.",
    otp_sent_to: "We sent a code to",
    code_label: "6-digit code",
    verifying: "Verifying…",
    enter: "Sign in",
    change_document: "Change document",
    pending_invites: "You have {{count}} pending invitations:",
    accept_this: "Accept this invitation",
    triplet_legend: "Country + type + document",
    continue: "Continue",
  } satisfies typeof LOCALE_ES,
  pt: {
    invalid_data: "Dados inválidos",
    invalid_code: "Código inválido",
    send_failed: "Não conseguimos enviar o código. Tente novamente.",
    otp_sent_to: "Enviamos um código para",
    code_label: "Código de 6 dígitos",
    verifying: "Verificando…",
    enter: "Entrar",
    change_document: "Trocar documento",
    pending_invites: "Você tem {{count}} convites pendentes:",
    accept_this: "Aceitar este convite",
    triplet_legend: "País + tipo + documento",
    continue: "Continuar",
  } satisfies typeof LOCALE_ES,
};

type Invite = {
  membership_id: number;
  invitation_token: string;
  organization_name: string;
  tenant_slug: string;
  tenant_name: string;
  invitation_expires_at: string | null;
};

type Step =
  | { name: "triplet" }
  | { name: "otp"; channel: "sms" | "email"; contact: string; masked: string; values: CheckDocumentValues }
  | { name: "pick"; invites: Invite[]; values: CheckDocumentValues };

export function DocumentFlow({
  countries,
  locale,
  initialError,
}: {
  countries: DocumentTripletCountry[];
  locale: string;
  initialError?: string;
}) {
  const { t } = useRosetta(LOCALES);
  const router = useRouter();
  const [step, setStep] = useState<Step>({ name: "triplet" });
  const [serverError, setServerError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // legacy ?error=no_invite redirect support — should not happen with current dispatcher.
  void initialError;

  const tripletForm = useForm<CheckDocumentValues>({
    resolver: zodResolver(checkDocumentSchema),
    defaultValues: {
      address_level0_id: "CL",
      profile_identity_document_kind: "nin",
      profile_identity_document_value: "",
    },
  });

  const otpForm = useForm<VerifyLoginOtpValues>({
    resolver: zodResolver(verifyLoginOtpSchema),
    defaultValues: {
      address_level0_id: "CL",
      profile_identity_document_kind: "nin",
      profile_identity_document_value: "",
      channel: "sms",
      contact: "",
      token: "",
    },
  });

  const onSubmitTriplet = tripletForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      const [data, error] = await ErrorSafeAction.unwrap(actionCheckDocument(values));
      if (error instanceof ErrorSafeActionServer) {
        setServerError(error.serverError);
        return;
      }
      if (error instanceof ErrorSafeActionValidation) {
        setServerError(t("invalid_data"));
        return;
      }
      if (error) return;
      if (data.kind === "error") {
        setServerError(data.message ?? t("send_failed"));
        return;
      }
      if (data.kind === "redirect_signup") {
        // No profile resolved + no pending invites → ask the user to continue with email.
        // The document gets linked later during /auth/onboarding (profile identity step).
        router.push(`/${locale}/auth/email`);
        return;
      }
      if (data.kind === "redirect_accept") {
        router.push(`/${locale}/auth/document/accept?token=${encodeURIComponent(data.invitation_token)}`);
        return;
      }
      if (data.kind === "pick_invite") {
        setStep({ name: "pick", invites: data.invites, values });
        return;
      }
      // login
      otpForm.reset({
        address_level0_id: values.address_level0_id,
        profile_identity_document_kind: values.profile_identity_document_kind,
        profile_identity_document_value: values.profile_identity_document_value,
        channel: data.channel,
        contact: data.contact,
        token: "",
      });
      setStep({ name: "otp", channel: data.channel, contact: data.contact, masked: data.masked, values });
    });
  });

  const onSubmitOtp = otpForm.handleSubmit((values) => {
    setServerError(null);
    startTransition(async () => {
      // success path redirects server-side; only failures return here.
      const [, error] = await ErrorSafeAction.unwrap(actionVerifyDocumentLoginOtp(values));
      if (error instanceof ErrorSafeActionServer) setServerError(error.serverError);
      else if (error instanceof ErrorSafeActionValidation) setServerError(t("invalid_code"));
    });
  });

  if (step.name === "otp") {
    return (
      <form onSubmit={onSubmitOtp} className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          {t("otp_sent_to")} <span className="font-medium">{step.masked}</span>.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="token">{t("code_label")}</Label>
          <Input
            id="token"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            aria-invalid={!!otpForm.formState.errors.token}
            {...otpForm.register("token")}
          />
          {otpForm.formState.errors.token && (
            <p className="text-destructive text-xs">{otpForm.formState.errors.token.message}</p>
          )}
        </div>
        {serverError && (
          <Alert variant="destructive">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("verifying") : t("enter")}
        </Button>
        <button
          type="button"
          className="text-muted-foreground text-center text-xs underline"
          onClick={() => {
            setStep({ name: "triplet" });
            otpForm.reset();
          }}
        >
          {t("change_document")}
        </button>
      </form>
    );
  }

  if (step.name === "pick") {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-muted-foreground text-sm">{t("pending_invites", { count: step.invites.length })}</p>
        {step.invites.map((invite) => (
          <Card key={invite.membership_id}>
            <CardHeader>
              <CardTitle className="text-base">{invite.organization_name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <p className="text-muted-foreground text-xs">{invite.tenant_name}</p>
              <Button
                onClick={() =>
                  router.push(`/${locale}/auth/document/accept?token=${encodeURIComponent(invite.invitation_token)}`)
                }
                disabled={pending}
                className="w-full"
              >
                {t("accept_this")}
              </Button>
            </CardContent>
          </Card>
        ))}
        <button
          type="button"
          className="text-muted-foreground text-center text-xs underline"
          onClick={() => setStep({ name: "triplet" })}
        >
          {t("change_document")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitTriplet} className="flex flex-col gap-4">
      <DocumentTripletFields form={tripletForm} countries={countries} required legend={t("triplet_legend")} />
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? t("verifying") : t("continue")}
      </Button>
    </form>
  );
}
