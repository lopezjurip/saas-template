/**
 * @example
 * LOCALE_TO_ISO("es-CL") => "es_CL"
 * LOCALE_TO_ISO("es_CL") => "es_CL"
 * LOCALE_TO_ISO("en") => "en_US"
 */
export function LOCALE_TO_ISO(locale: string): string {
  switch (locale.toLowerCase()) {
    case "es":
      return "es_CL";
    case "en":
      return "en_US";
    case "pt":
      return "pt_BR";
    default: {
      return locale.replace(/-/g, "_");
    }
  }
}
