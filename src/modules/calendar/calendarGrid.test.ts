import { describe, expect, it } from "vitest";
import { monthGrid, navigate, visibleRange, weekDates } from "./calendarGrid";
import {
  addDays,
  addMonths,
  formatDateTW,
  formatMonthTW,
  isoWeekday,
  startOfWeek,
  taipeiDateOf,
  taipeiISO,
  todayTaipei,
} from "./calendarDates";

const TODAY = "2026-07-18"; // Saturday

describe("calendarDates (Asia/Taipei)", () => {
  it("taipeiDateOf keeps late-night events on the Taipei day", () => {
    // 23:30 Taipei = 15:30 UTC same day — naive UTC bucketing is fine here…
    expect(taipeiDateOf("2026-07-18T23:30:00+08:00")).toBe("2026-07-18");
    // …but 00:30 Taipei = 16:30 UTC the PREVIOUS day — this is the drift case.
    expect(taipeiDateOf("2026-07-18T16:30:00Z")).toBe("2026-07-19");
  });

  it("taipeiISO composes explicit +08:00 datetimes", () => {
    expect(taipeiISO("2026-07-18", "09:30")).toBe("2026-07-18T09:30:00+08:00");
  });

  it("date arithmetic crosses month and year boundaries", () => {
    expect(addDays("2026-07-31", 1)).toBe("2026-08-01");
    expect(addDays("2026-01-01", -1)).toBe("2025-12-31");
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28"); // clamped
    expect(addMonths("2026-12-15", 1)).toBe("2027-01-15");
  });

  it("weeks start on Monday", () => {
    expect(isoWeekday("2026-07-18")).toBe(6); // Saturday
    expect(startOfWeek("2026-07-18")).toBe("2026-07-13"); // Monday
    expect(startOfWeek("2026-07-13")).toBe("2026-07-13");
  });

  it("Taiwan-style labels", () => {
    expect(formatDateTW("2026-07-18")).toBe("2026年7月18日（六）");
    expect(formatMonthTW("2026-07-18")).toBe("2026年7月");
  });

  it("todayTaipei returns the Taipei calendar date for a UTC instant", () => {
    // 2026-07-17 20:00 UTC = 2026-07-18 04:00 Taipei
    expect(todayTaipei(new Date("2026-07-17T20:00:00Z"))).toBe("2026-07-18");
  });
});

describe("monthGrid", () => {
  it("covers July 2026 in whole Monday-first weeks", () => {
    const weeks = monthGrid(TODAY, TODAY);
    expect(weeks).toHaveLength(5);
    expect(weeks[0][0].date).toBe("2026-06-29"); // Monday before July 1
    expect(weeks[4][6].date).toBe("2026-08-02");
    const inMonth = weeks.flat().filter((c) => c.inMonth);
    expect(inMonth).toHaveLength(31);
    expect(weeks.flat().find((c) => c.isToday)?.date).toBe(TODAY);
  });

  it("marks out-of-month leading/trailing days", () => {
    const weeks = monthGrid(TODAY, TODAY);
    expect(weeks[0][0].inMonth).toBe(false);
    expect(weeks[0][2].date).toBe("2026-07-01");
    expect(weeks[0][2].inMonth).toBe(true);
  });
});

describe("weekDates / visibleRange / navigate", () => {
  it("weekDates returns Mon–Sun of the anchor week", () => {
    const days = weekDates(TODAY);
    expect(days[0]).toBe("2026-07-13");
    expect(days[6]).toBe("2026-07-19");
  });

  it("visibleRange matches each view", () => {
    expect(visibleRange("day", TODAY, TODAY)).toEqual({ from: TODAY, to: TODAY });
    expect(visibleRange("week", TODAY, TODAY)).toEqual({
      from: "2026-07-13",
      to: "2026-07-19",
    });
    expect(visibleRange("month", TODAY, TODAY)).toEqual({
      from: "2026-06-29",
      to: "2026-08-02",
    });
  });

  it("navigate moves by the view's interval in both directions", () => {
    expect(navigate("day", TODAY, 1)).toBe("2026-07-19");
    expect(navigate("day", TODAY, -1)).toBe("2026-07-17");
    expect(navigate("week", TODAY, 1)).toBe("2026-07-25");
    expect(navigate("month", TODAY, 1)).toBe("2026-08-18");
    expect(navigate("month", TODAY, -1)).toBe("2026-06-18");
  });
});
