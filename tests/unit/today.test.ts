import { describe, expect, it } from "vitest";
import { daysBefore, daysBetween, getToday, parseIsoDate, toIsoDate } from "@/lib/today";

describe("getToday", () => {
  it("uses SEMPDF_TODAY when it is a valid date", () => {
    expect(toIsoDate(getToday({ SEMPDF_TODAY: "2026-03-14" }))).toBe("2026-03-14");
  });

  it("falls back to the clock for missing or invalid values", () => {
    const clock = new Date("2026-10-05T22:15:00Z");
    expect(toIsoDate(getToday({}, clock))).toBe("2026-10-05");
    expect(toIsoDate(getToday({ SEMPDF_TODAY: "next tuesday" }, clock))).toBe("2026-10-05");
    expect(toIsoDate(getToday({ SEMPDF_TODAY: "2026-02-31" }, clock))).toBe("2026-10-05");
  });
});

describe("parseIsoDate", () => {
  it("parses strict YYYY-MM-DD only", () => {
    expect(parseIsoDate("2026-10-05")?.toISOString()).toBe("2026-10-05T00:00:00.000Z");
    expect(parseIsoDate("5/10/2026")).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });
});

describe("daysBefore and daysBetween", () => {
  const today = new Date("2026-10-05T00:00:00Z");

  it("moves back whole days at a set time", () => {
    expect(daysBefore(today, 3, 9, 30).toISOString()).toBe("2026-10-02T09:30:00.000Z");
  });

  it("counts calendar days regardless of time of day", () => {
    expect(daysBetween(new Date("2026-10-04T23:59:00Z"), today)).toBe(1);
    expect(daysBetween(new Date("2026-10-05T23:00:00Z"), today)).toBe(0);
    expect(daysBetween(new Date("2026-09-01T08:00:00Z"), today)).toBe(34);
  });
});
