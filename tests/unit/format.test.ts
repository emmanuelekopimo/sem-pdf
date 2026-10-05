import { describe, expect, it } from "vitest";
import { formatBytes, formatCount, formatDuration, groupByHistory, historyGroup, initials, timeAgo } from "@/lib/format";
import { daysBefore } from "@/lib/today";

const today = new Date("2026-10-05T00:00:00Z");

describe("formatBytes", () => {
  it("formats bytes, kilobytes and megabytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(4200)).toBe("4.1 KB");
    expect(formatBytes(52_000)).toBe("51 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("timeAgo", () => {
  it.each([
    [0, "Today"],
    [1, "Yesterday"],
    [3, "3 days ago"],
    [7, "1 week ago"],
    [20, "2 weeks ago"],
    [45, "1 month ago"],
    [400, "1 year ago"],
  ])("%i days ago reads %s", (days, label) => {
    expect(timeAgo(daysBefore(today, days, 15), today)).toBe(label);
  });

  it("treats future dates as today", () => {
    expect(timeAgo(new Date("2026-10-07T10:00:00Z"), today)).toBe("Today");
  });
});

describe("historyGroup", () => {
  it.each([
    [0, "Today"],
    [1, "Yesterday"],
    [6, "This week"],
    [7, "This month"],
    [29, "This month"],
    [30, "Older"],
  ])("%i days ago is %s", (days, group) => {
    expect(historyGroup(daysBefore(today, days), today)).toBe(group);
  });
});

describe("groupByHistory", () => {
  it("groups in fixed order, keeps item order and skips empty groups", () => {
    const items = [
      { q: "a", at: daysBefore(today, 0, 18) },
      { q: "b", at: daysBefore(today, 0, 9) },
      { q: "c", at: daysBefore(today, 40) },
      { q: "d", at: daysBefore(today, 1) },
    ];
    const groups = groupByHistory(items, (i) => i.at, today);
    expect(groups.map((g) => g.group)).toEqual(["Today", "Yesterday", "Older"]);
    expect(groups[0]!.items.map((i) => i.q)).toEqual(["a", "b"]);
  });
});

describe("small formatters", () => {
  it("formats counts, durations and initials", () => {
    expect(formatCount(1, "page")).toBe("1 page");
    expect(formatCount(1250, "passage")).toBe("1,250 passages");
    expect(formatDuration(42.4)).toBe("42 ms");
    expect(formatDuration(1530)).toBe("1.5 s");
    expect(initials("Computer Science")).toBe("CS");
    expect(initials("ECO 305 Monetary Economics", 3)).toBe("E3M");
  });
});
