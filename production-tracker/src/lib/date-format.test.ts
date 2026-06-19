import { describe, expect, it } from "vitest";

import { formatUtcDate, formatUtcDateTime, formatUtcMonthDayTime, formatUtcShortDate } from "@/lib/date-format";

describe("UTC date formatting", () => {
  it("formats dates without depending on runtime locale or timezone", () => {
    const value = "2026-06-09T23:15:04.000Z";

    expect(formatUtcDate(value)).toBe("2026/06/09");
    expect(formatUtcShortDate(value)).toBe("2026-06-09");
    expect(formatUtcDateTime(value)).toBe("2026/06/09 23:15");
    expect(formatUtcDateTime(value, { seconds: true })).toBe("2026/06/09 23:15:04");
    expect(formatUtcMonthDayTime(value)).toBe("06/09 23:15");
  });

  it("returns placeholders for invalid values", () => {
    expect(formatUtcDate(null)).toBe("--");
    expect(formatUtcDate("not-a-date")).toBe("--");
  });
});
