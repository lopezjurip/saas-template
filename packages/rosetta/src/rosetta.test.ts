import { describe, expect, it } from "vitest";
import { RosettaImpl } from "./rosetta";

type LocaleShape = {
  farewell?: string;
  greeting?: string;
  nested?: {
    accent?: string;
    region?: string;
  };
};

describe("RosettaImpl locale resolution", () => {
  it("uses the regional override when it exists", () => {
    const rosetta = RosettaImpl.fromDictionary<LocaleShape>(
      {
        es: { greeting: "Hola" },
        "es-CL": { greeting: "Wena" },
      },
      "es-CL",
    );

    expect(rosetta.locale).toBe("es-CL");
    expect(rosetta.t("greeting")).toBe("Wena");
  });

  it("falls back from regional locale to base language when the override is missing", () => {
    const rosetta = RosettaImpl.fromDictionary<LocaleShape>(
      {
        es: { greeting: "Hola" },
      },
      "es-CL",
    );

    expect(rosetta.locale).toBe("es");
    expect(rosetta.t("greeting")).toBe("Hola");
  });

  it("throws a descriptive error for unsupported locales", () => {
    expect(() =>
      RosettaImpl.fromDictionary<LocaleShape>(
        {
          es: { greeting: "Hola" },
        },
        "fr-FR",
      ),
    ).toThrow(/unsupported locale "fr-FR"/i);
  });

  it("keeps inheriting base keys into regional dictionaries", () => {
    const rosetta = RosettaImpl.fromDictionary<LocaleShape>(
      {
        es: {
          farewell: "Chao",
          nested: {
            accent: "Base",
            region: "Base",
          },
        },
        "es-CL": {
          greeting: "Wena",
          nested: {
            accent: "Modismo",
          },
        },
      },
      "es-CL",
    );

    expect(rosetta.t("greeting")).toBe("Wena");
    expect(rosetta.t("farewell")).toBe("Chao");
    expect(rosetta.t("nested.region")).toBe("Base");
    expect(rosetta.t("nested.accent")).toBe("Modismo");
  });
});
