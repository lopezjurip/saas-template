import { type RosettaDict, RosettaImpl, type RosettaOptions } from "@packages/rosetta/rosetta";
import React, { useContext, useMemo } from "react";

// Locale context — workaround for non-Next.js environments (react-email, react-pdf).
// In Next.js apps, wrap with LocaleProvider fed by useNextJSLocale().
const LocaleContext = React.createContext<string>("es-CL");

export function LocaleProvider({ locale, children }: { locale: string; children: React.ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): string {
  return useContext(LocaleContext);
}

// Do not export.
const RosettaContext = React.createContext<RosettaImpl<any> | null>(null);

/**
 * Optional provider to use Rosetta with a dictionary of translations, ideal when using with .map() to localize multiple child items.
 */
export function RosettaProvider<T>({
  dict,
  options,
  locale,
  ...props
}: {
  children: React.ReactNode;
  dict: RosettaDict<T>;
  options?: RosettaOptions;
  locale?: string;
}) {
  const contextLocale = useLocale();
  const effectiveLocale = locale ?? contextLocale;
  const instance = useMemo(
    () => RosettaImpl.fromDictionary(dict, effectiveLocale, options),
    [dict, effectiveLocale, options],
  );
  return <RosettaContext.Provider value={instance as RosettaImpl<any>} {...props} />;
}

/**
 * Use Rosetta to localize your components by providing a dictionary of translations.
 * Reads locale from LocaleContext — set it with LocaleProvider or RosettaProvider.
 *
 * @example // simple usage (no provider required)
 * const r = useRosetta(LOCALES);
 * <h1>{r.t("hello", { name: "Juan" })}</h1>
 *
 * @example // usage with provider (preferred when using with .map())
 * function LocalizedRow(item) {
 *   const r = useRosetta<ValueOf<typeof LOCALES>>();
 *   return <h1>{r.t("hello", { name: item.name })}</h1>;
 * }
 * <RosettaProvider dict={LOCALES}>
 *   {items.map((item) => <LocalizedRow key={item.id} item={item} />)}
 * </RosettaProvider>
 */
export function useRosetta<T>(dict?: RosettaDict<T>, options?: RosettaOptions): RosettaImpl<T> {
  const locale = useLocale();
  const contextualInstance = useContext(RosettaContext);

  const instance = useMemo(() => {
    if (dict) return RosettaImpl.fromDictionary(dict, locale, options);
    return null;
  }, [dict, locale, options]);

  const final = instance ?? contextualInstance;
  if (!final) {
    throw new Error("[useRosetta] No Rosetta instance found. Provide a dictionary or wrap with RosettaProvider.");
  }
  return final as RosettaImpl<T>;
}

/**
 * Wrap a component with a RosettaProvider using a dictionary of translations.
 * Note: wraps in a <div> — do NOT use inside react-pdf templates.
 */
export function withRosettaLocales<T>(dict: RosettaDict<T>, options?: RosettaOptions) {
  return function WithRosetta(props: React.ComponentProps<"div">) {
    return (
      <RosettaProvider dict={dict} options={options}>
        <div {...props} />
      </RosettaProvider>
    );
  };
}
