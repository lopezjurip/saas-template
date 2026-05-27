"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { useTransition } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import { finishOnboarding } from "../actions";

export function FinishStep() {
  const { t } = useRosetta(LOCALES);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-sm font-medium">{t("heading")}</h2>
        <p className="text-muted-foreground mt-1 text-sm">{t("description")}</p>
      </div>
      <Button
        onClick={() => startTransition(() => finishOnboarding().then(() => undefined))}
        disabled={pending}
        className="w-full"
      >
        {pending ? t("entering") : t("enter")}
      </Button>
    </div>
  );
}

const LOCALE_ES = {
  heading: "Todo listo",
  description: "Ya puedes comenzar a usar Humane. Puedes completar los pasos opcionales más adelante desde tu perfil.",
  entering: "Entrando…",
  enter: "Entrar a Humane",
};

const LOCALE_EN: typeof LOCALE_ES = {
  heading: "All set",
  description: "You can start using Humane. You can complete the optional steps later from your profile.",
  entering: "Loading…",
  enter: "Enter Humane",
};

const LOCALE_PT: typeof LOCALE_ES = {
  heading: "Tudo pronto",
  description: "Você já pode começar a usar o Humane. Pode completar as etapas opcionais mais tarde pelo seu perfil.",
  entering: "Entrando…",
  enter: "Entrar no Humane",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
