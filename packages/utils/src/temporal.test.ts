import { describe, expect, it } from "vitest";
import {
  FIBONACCI_BACKOFF,
  TEMPORAL,
  TEMPORAL_DISPLAY_MONTH,
  TEMPORAL_PARTS,
  TEMPORAL_PARTS_PADDED,
  TEMPORAL_PLAINDATE,
  TEMPORAL_PLAINDATE_REPRESENTATIVE,
  TEMPORAL_TRUNCATE,
  Temporal,
} from "./temporal";

describe("TEMPORAL", () => {
  describe("Temporal.ZonedDateTime input", () => {
    it("returns as-is when timezone matches", () => {
      const zdt = Temporal.ZonedDateTime.from("2025-01-15T10:30:00-03:00[America/Santiago]");
      const result = TEMPORAL(zdt, "America/Santiago");
      expect(result).toBe(zdt);
      expect(result.timeZoneId).toBe("America/Santiago");
    });

    it("converts to requested timezone when timezone differs", () => {
      const zdt = Temporal.ZonedDateTime.from("2025-01-15T10:30:00-03:00[America/Santiago]");
      const result = TEMPORAL(zdt, "UTC");
      expect(result.timeZoneId).toBe("UTC");
      // The instant should be the same, but the wall clock time may differ
      expect(result.toInstant().epochMilliseconds).toBe(zdt.toInstant().epochMilliseconds);
    });

    it("converts from UTC to America/Santiago", () => {
      const zdt = Temporal.ZonedDateTime.from("2025-01-15T13:30:00Z[UTC]");
      const result = TEMPORAL(zdt, "America/Santiago");
      expect(result.timeZoneId).toBe("America/Santiago");
      // UTC 13:30 should be around 10:30 in Santiago (UTC-3)
      expect(result.hour).toBe(10);
    });

    it("converts from America/Santiago to UTC", () => {
      const zdt = Temporal.ZonedDateTime.from("2025-01-15T10:30:00-03:00[America/Santiago]");
      const result = TEMPORAL(zdt, "UTC");
      expect(result.timeZoneId).toBe("UTC");
      // Santiago 10:30 (UTC-3) should be around 13:30 UTC
      expect(result.hour).toBe(13);
    });
  });

  describe("Temporal.PlainDateTime input", () => {
    it("converts PlainDateTime to ZonedDateTime with default timezone", () => {
      const pdt = Temporal.PlainDateTime.from("2025-01-15T10:30:00");
      const result = TEMPORAL(pdt);
      expect(result).toBeInstanceOf(Temporal.ZonedDateTime);
      expect(result.timeZoneId).toBe("America/Santiago");
      expect(result.year).toBe(2025);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      expect(result.hour).toBe(10);
      expect(result.minute).toBe(30);
    });

    it("converts PlainDateTime to ZonedDateTime with specified timezone", () => {
      const pdt = Temporal.PlainDateTime.from("2025-01-15T10:30:00");
      const result = TEMPORAL(pdt, "UTC");
      expect(result).toBeInstanceOf(Temporal.ZonedDateTime);
      expect(result.timeZoneId).toBe("UTC");
      expect(result.year).toBe(2025);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      expect(result.hour).toBe(10);
      expect(result.minute).toBe(30);
    });
  });

  describe("Temporal.PlainDate input", () => {
    it("converts PlainDate to ZonedDateTime with default timezone", () => {
      const pd = Temporal.PlainDate.from("2025-01-15");
      const result = TEMPORAL(pd);
      expect(result).toBeInstanceOf(Temporal.ZonedDateTime);
      expect(result.timeZoneId).toBe("America/Santiago");
      expect(result.year).toBe(2025);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      // Should default to midnight (00:00:00)
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
    });

    it("converts PlainDate to ZonedDateTime with specified timezone", () => {
      const pd = Temporal.PlainDate.from("2025-01-15");
      const result = TEMPORAL(pd, "UTC");
      expect(result).toBeInstanceOf(Temporal.ZonedDateTime);
      expect(result.timeZoneId).toBe("UTC");
      expect(result.year).toBe(2025);
      expect(result.month).toBe(1);
      expect(result.day).toBe(15);
      // Should default to midnight (00:00:00)
      expect(result.hour).toBe(0);
      expect(result.minute).toBe(0);
      expect(result.second).toBe(0);
    });
  });
});

describe("TEMPORAL_PLAINDATE", () => {
  it("parses plain date", () => {
    const pd = TEMPORAL_PLAINDATE("2023-10-05");
    expect(pd.toString()).toBe("2023-10-05");
  });

  it("parses ISO datetime without offset/zone", () => {
    const pd = TEMPORAL_PLAINDATE("2023-10-05T22:30:00");
    expect(pd.toString()).toBe("2023-10-05");
  });

  it("parses ISO datetime with offset", () => {
    const pd = TEMPORAL_PLAINDATE("2023-10-05T22:30:00-03:00");
    expect(pd.toString()).toBe("2023-10-05");
  });

  it("parses server timestamp with time zone", () => {
    const pd = TEMPORAL_PLAINDATE("2022-10-02T00:37:49.328171+00:00");
    expect(pd.toString()).toBe("2022-10-01");
  });

  it("parses server timestamp (Date) with time zone", () => {
    const pd = TEMPORAL_PLAINDATE(new Date("2022-10-02T00:37:49.328171+00:00"));
    expect(pd.toString()).toBe("2022-10-01");
  });

  it("compares years with decimal places", () => {
    const start = TEMPORAL_PLAINDATE("2000-01-01");
    const now = TEMPORAL_PLAINDATE("2023-10-05");
    const actual_years = start.until(now, { largestUnit: "years" }).total({ unit: "years", relativeTo: start });
    expect(actual_years).toBeCloseTo(23.76, 2);
    expect(actual_years % 1).not.toBe(0); // expect decimal places
  });
});

describe("TEMPORAL_DISPLAY_MONTH", () => {
  it("displays month in Spanish", () => {
    const pd = TEMPORAL_PLAINDATE_REPRESENTATIVE({ month: 10 });
    const month = TEMPORAL_DISPLAY_MONTH("es-CL", pd);
    expect(month).toBe("octubre");
  });

  it("displays month in English", () => {
    const pd = TEMPORAL_PLAINDATE_REPRESENTATIVE({ month: 2 });
    const month = TEMPORAL_DISPLAY_MONTH("en-US", pd);
    expect(month).toBe("February");
  });
});

describe("TEMPORAL_PARTS", () => {
  it("extracts parts from PlainDate", () => {
    const pd = TEMPORAL_PLAINDATE("2025-01-05");
    const [YYYY, MM, DD] = TEMPORAL_PARTS(pd);
    expect(YYYY).toBe(2025);
    expect(MM).toBe(1);
    expect(DD).toBe(5);
  });
});

describe("TEMPORAL_PARTS_PADDED", () => {
  it("extracts padded parts from PlainDate", () => {
    const pd = TEMPORAL_PLAINDATE("2025-01-05");
    const [YYYY, MM, DD] = TEMPORAL_PARTS_PADDED(pd);
    expect(YYYY).toBe("2025");
    expect(MM).toBe("01");
    expect(DD).toBe("05");
  });
});

describe("TEMPORAL_TRUNCATE", () => {
  describe("PlainDate", () => {
    it("truncates to year", () => {
      const date = Temporal.PlainDate.from("2025-03-15");
      const result = TEMPORAL_TRUNCATE(date, "year");
      expect(result.toString()).toBe("2025-01-01");
    });

    it("truncates to month", () => {
      const date = Temporal.PlainDate.from("2025-03-15");
      const result = TEMPORAL_TRUNCATE(date, "month");
      expect(result.toString()).toBe("2025-03-01");
    });

    it("truncates to day", () => {
      const date = Temporal.PlainDate.from("2025-03-15");
      const result = TEMPORAL_TRUNCATE(date, "day");
      expect(result.toString()).toBe("2025-03-15");
    });

    it("truncates to year for edge case (December 31)", () => {
      const date = Temporal.PlainDate.from("2024-12-31");
      const result = TEMPORAL_TRUNCATE(date, "year");
      expect(result.toString()).toBe("2024-01-01");
    });

    it("truncates to month for edge case (last day of month)", () => {
      const date = Temporal.PlainDate.from("2024-02-29");
      const result = TEMPORAL_TRUNCATE(date, "month");
      expect(result.toString()).toBe("2024-02-01");
    });
  });

  describe("PlainDateTime", () => {
    it("truncates to year", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "year");
      expect(result.toString()).toBe("2025-01-01T00:00:00");
    });

    it("truncates to month", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "month");
      expect(result.toString()).toBe("2025-03-01T00:00:00");
    });

    it("truncates to day", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "day");
      expect(result.toString()).toBe("2025-03-15T00:00:00");
    });

    it("truncates to hour", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "hour");
      expect(result.toString()).toBe("2025-03-15T21:00:00");
    });

    it("truncates to minute", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "minute");
      expect(result.toString()).toBe("2025-03-15T21:30:00");
    });

    it("truncates to second", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "second");
      expect(result.toString()).toBe("2025-03-15T21:30:45");
    });

    it("truncates to millisecond", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "millisecond");
      expect(result.toString()).toBe("2025-03-15T21:30:45.123");
    });

    it("truncates to microsecond", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "microsecond");
      expect(result.toString()).toBe("2025-03-15T21:30:45.123456");
    });

    it("truncates to nanosecond", () => {
      const date = Temporal.PlainDateTime.from("2025-03-15T21:30:45.123456789");
      const result = TEMPORAL_TRUNCATE(date, "nanosecond");
      expect(result.toString()).toBe("2025-03-15T21:30:45.123456789");
    });

    it("truncates to year for edge case (December 31, 23:59:59)", () => {
      const date = Temporal.PlainDateTime.from("2024-12-31T23:59:59.999999");
      const result = TEMPORAL_TRUNCATE(date, "year");
      expect(result.toString()).toBe("2024-01-01T00:00:00");
    });

    it("truncates to month for edge case (last day of month)", () => {
      const date = Temporal.PlainDateTime.from("2024-02-29T23:59:59");
      const result = TEMPORAL_TRUNCATE(date, "month");
      expect(result.toString()).toBe("2024-02-01T00:00:00");
    });
  });

  describe("ZonedDateTime", () => {
    it("truncates to year", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "year");
      expect(result.toPlainDateTime().toString()).toBe("2025-01-01T00:00:00");
    });

    it("truncates to month", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "month");
      expect(result.toPlainDateTime().toString()).toBe("2025-03-01T00:00:00");
    });

    it("truncates to day", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "day");
      expect(result.toPlainDateTime().toString()).toBe("2025-03-15T00:00:00");
    });

    it("truncates to hour", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "hour");
      expect(result.toPlainDateTime().toString()).toBe("2025-03-15T21:00:00");
    });

    it("truncates to minute", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "minute");
      expect(result.toPlainDateTime().toString()).toBe("2025-03-15T21:30:00");
    });

    it("truncates to second", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "second");
      expect(result.toPlainDateTime().toString()).toBe("2025-03-15T21:30:45");
    });

    it("preserves timezone after truncation", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456");
      const result = TEMPORAL_TRUNCATE(date, "day");
      expect(result.timeZoneId).toBe("America/Santiago");
    });

    it("truncates with different timezone", () => {
      const date = TEMPORAL("2025-03-15T21:30:45.123456", "UTC");
      const result = TEMPORAL_TRUNCATE(date, "hour");
      expect(result.timeZoneId).toBe("UTC");
      expect(result.toPlainDateTime().toString()).toBe("2025-03-15T21:00:00");
    });
  });
});

describe("FIBONACCI_BACKOFF", () => {
  const baseInstant = Temporal.Instant.from("2025-01-01T00:00:00Z");

  it("uses default base (1 minute) and scales by Fibonacci", () => {
    // attempt 1: fib=1, backoff=1 min
    const result1 = FIBONACCI_BACKOFF(1, baseInstant);
    expect(result1.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 60_000);

    // attempt 2: fib=1, backoff=1 min
    const result2 = FIBONACCI_BACKOFF(2, baseInstant);
    expect(result2.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 60_000);

    // attempt 3: fib=2, backoff=2 min
    const result3 = FIBONACCI_BACKOFF(3, baseInstant);
    expect(result3.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 120_000);

    // attempt 4: fib=3, backoff=3 min
    const result4 = FIBONACCI_BACKOFF(4, baseInstant);
    expect(result4.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 180_000);

    // attempt 5: fib=5, backoff=5 min
    const result5 = FIBONACCI_BACKOFF(5, baseInstant);
    expect(result5.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 300_000);
  });

  it("accepts Temporal.Duration as base", () => {
    const base = Temporal.Duration.from({ seconds: 10 });
    const result = FIBONACCI_BACKOFF(3, baseInstant, base);
    // fib(3)=2, 10s * 2 = 20s
    expect(result.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 20_000);
  });

  it("accepts DurationLike object as base", () => {
    const result = FIBONACCI_BACKOFF(4, baseInstant, { seconds: 5 });
    // fib(4)=3, 5s * 3 = 15s
    expect(result.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 15_000);
  });

  it("accepts ISO duration string as base", () => {
    const result = FIBONACCI_BACKOFF(5, baseInstant, "PT1S");
    // fib(5)=5, 1s * 5 = 5s
    expect(result.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 5_000);
  });

  it("returns same timestamp for attempt 0 (Fibonacci returns 0)", () => {
    const result = FIBONACCI_BACKOFF(0, baseInstant);
    expect(result.epochMilliseconds).toBe(baseInstant.epochMilliseconds);
  });

  it("scales backoff for higher attempts", () => {
    const base = Temporal.Duration.from({ seconds: 1 });
    const result8 = FIBONACCI_BACKOFF(8, baseInstant, base);
    // fib(8)=21, 1s * 21 = 21s
    expect(result8.epochMilliseconds).toBe(baseInstant.epochMilliseconds + 21_000);
  });
});
