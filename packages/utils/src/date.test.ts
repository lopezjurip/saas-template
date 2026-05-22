import { describe, expect, it } from "vitest";
import { DATE_DIFF_DAYS, DATE_IS_EQUAL, DATE_PARTS_PADDED, DATETIME, DATETIME_TRUNCATE } from "./date";

describe("DATETIME_TRUNCATE", () => {
  it("should truncate to year", () => {
    const date = new Date("2024-12-31T23:59:59.999Z");
    expect(DATETIME_TRUNCATE(date, "year")).toEqual(new Date("2024-01-01T00:00:00.000Z"));
  });
  it("should truncate to month", () => {
    const date = new Date("2024-12-31T23:59:59.999Z");
    expect(DATETIME_TRUNCATE(date, "month")).toEqual(new Date("2024-12-01T00:00:00.000Z"));
  });
  it("should truncate to day", () => {
    const date = new Date("2024-12-31T23:59:59.999Z");
    expect(DATETIME_TRUNCATE(date, "day")).toEqual(new Date("2024-12-31T00:00:00.000Z"));
  });
  it("should truncate to hour", () => {
    const date = new Date("2024-12-31T23:59:59.999Z");
    expect(DATETIME_TRUNCATE(date, "hour")).toEqual(new Date("2024-12-31T23:00:00.000Z"));
  });
  it("should truncate to minute", () => {
    const date = new Date("2024-12-31T23:59:59.999Z");
    expect(DATETIME_TRUNCATE(date, "minute")).toEqual(new Date("2024-12-31T23:59:00.000Z"));
  });
  it("should truncate to second", () => {
    const date = new Date("2024-12-31T23:59:59.999Z");
    expect(DATETIME_TRUNCATE(date, "second")).toEqual(new Date("2024-12-31T23:59:59.000Z"));
  });
});

describe("DATETIME", () => {
  it("should return the current date and time", () => {
    expect(DATETIME()).toBeInstanceOf(Date);
  });
  it("should return a date object", () => {
    expect(DATETIME("2025-01-01")).toBeInstanceOf(Date);
    expect(DATETIME("2025-01-01")).toEqual(new Date("2025-01-01T00:00:00.000Z"));
  });
  it("should return an invalid date for invalid input", () => {
    expect(DATETIME("invalid-date")).toBeNull();
    expect(DATETIME(new Date("invalid-date"))).toBeNull();
  });
});

describe("DATE_DIFF_DAYS", () => {
  it("should calculate the difference in days", () => {
    const date = new Date(2021, 0, 1);
    const point = new Date(2021, 0, 2);
    expect(DATE_DIFF_DAYS(date, point)).toBe(-1);
  });
  it("should calculate the difference in days", () => {
    const date = new Date(2021, 0, 1);
    const point = new Date(2021, 0, 1);
    expect(DATE_DIFF_DAYS(date, point)).toBe(0);
  });
  it("should calculate the difference in days", () => {
    const date = new Date(2021, 0, 2);
    const point = new Date(2021, 0, 1);
    expect(DATE_DIFF_DAYS(date, point)).toBe(1);
  });
});

describe("DATE_IS_EQUAL", () => {
  it("should compare dates", () => {
    const date = new Date(2021, 0, 1);
    const point = new Date(2021, 0, 1);
    expect(DATE_IS_EQUAL(date, point)).toBe(true);
  });
  it("should compare dates", () => {
    const date = new Date(2021, 0, 1);
    const point = new Date(2021, 0, 2);
    expect(DATE_IS_EQUAL(date, point)).toBe(false);
  });
});

describe("DATE_PARTS_PADDED", () => {
  it("should return the date parts padded with zeros", () => {
    const date = new Date(2024, 0, 28);
    expect(DATE_PARTS_PADDED(date)).toEqual(["2024", "01", "28"]);
  });
});
