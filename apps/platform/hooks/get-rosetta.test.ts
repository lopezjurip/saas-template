import { describe, expect, it } from "vitest";
import { getRosetta } from "./get-rosetta";

describe("getRosetta", () => {
  it("keeps the requested public locale while resolving translations through the base dictionary", async () => {
    const rosetta = await getRosetta(
      {
        es: {
          greeting: "Hola",
        },
      },
      "es-CL",
    );

    expect(rosetta.locale).toBe("es-CL");
    expect(rosetta.t("greeting")).toBe("Hola");
  });
});
