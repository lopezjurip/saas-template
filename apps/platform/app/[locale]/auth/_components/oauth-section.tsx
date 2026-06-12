"use client";

import { Button } from "@packages/ui-common/shadcn/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRosetta } from "~/hooks/use-rosetta";
import { signInWithOAuth } from "../actions";
import { MAIN_OAUTH, MORE_OAUTH } from "../providers";

/**
 * OAuth providers: three "main" big buttons + a collapsible 4-up icon grid for the rest.
 * Each button posts to the `signInWithOAuth` server action with its provider id + next.
 */
export function OAuthSection({ next }: { next: string }) {
  const { t } = useRosetta(LOCALES);
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-2">
        {MAIN_OAUTH.map((p) => (
          <form key={p.id} action={signInWithOAuth}>
            <input type="hidden" name="provider" value={p.id} />
            <input type="hidden" name="next" value={next} />
            <Button type="submit" variant="outline" className="h-10 w-full justify-center gap-2.5">
              <p.Mark size={18} />
              <span>{t("continue_with", { provider: p.label })}</span>
            </Button>
          </form>
        ))}
      </div>

      {showMore ? (
        <div className="grid grid-cols-4 gap-2">
          {MORE_OAUTH.map((p) => (
            <form key={p.id} action={signInWithOAuth}>
              <input type="hidden" name="provider" value={p.id} />
              <input type="hidden" name="next" value={next} />
              <Button
                type="submit"
                variant="outline"
                size="icon"
                className="h-10 w-full"
                aria-label={t("continue_with", { provider: p.label })}
                title={p.label}
              >
                <p.Mark size={18} />
              </Button>
            </form>
          ))}
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          onClick={() => setShowMore(true)}
          className="h-8 w-full text-xs text-muted-foreground"
        >
          {t("more_options")}
          <ChevronDown size={12} />
        </Button>
      )}
    </div>
  );
}

const LOCALE_ES = {
  continue_with: "Continuar con {{provider}}",
  more_options: "Más opciones",
};

const LOCALE_EN: typeof LOCALE_ES = {
  continue_with: "Continue with {{provider}}",
  more_options: "More options",
};

const LOCALE_PT: typeof LOCALE_ES = {
  continue_with: "Continuar com {{provider}}",
  more_options: "Mais opções",
};

const LOCALES = { es: LOCALE_ES, en: LOCALE_EN, pt: LOCALE_PT };
