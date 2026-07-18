// Asia/Taipei calendar-date helpers for the Team Calendar.
//
// Events store ISO datetimes with explicit offsets; every date bucket (month
// grid, week columns, "today") is computed in Asia/Taipei so a late-night
// event never drifts to the wrong day through UTC conversion. Pure calendar
// dates (YYYY-MM-DD) are manipulated with UTC-anchored arithmetic, which is
// timezone-free by construction.

export const TAIPEI_TZ = "Asia/Taipei";

const taipeiDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: TAIPEI_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const taipeiTimeFmt = new Intl.DateTimeFormat("zh-TW", {
  timeZone: TAIPEI_TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

/** Today's calendar date in Asia/Taipei (YYYY-MM-DD). */
export function todayTaipei(now: Date = new Date()): string {
  return taipeiDateFmt.format(now);
}

/** The Asia/Taipei calendar date (YYYY-MM-DD) of an ISO datetime. */
export function taipeiDateOf(iso: string): string {
  return taipeiDateFmt.format(new Date(iso));
}

/** The Asia/Taipei wall-clock time (HH:mm) of an ISO datetime. */
export function taipeiTimeOf(iso: string): string {
  return taipeiTimeFmt.format(new Date(iso));
}

/** Current instant as an ISO datetime string (UTC form; comparisons are epoch-based). */
export function nowISO(now: Date = new Date()): string {
  return now.toISOString();
}

// --- pure calendar-date arithmetic (no timezone involved) -------------------

function parts(dateISO: string): [number, number, number] {
  const [y, m, d] = dateISO.split("-").map(Number);
  return [y, m, d];
}

function fromUTC(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(dateISO: string, days: number): string {
  const [y, m, d] = parts(dateISO);
  return fromUTC(Date.UTC(y, m - 1, d + days));
}

export function addMonths(dateISO: string, months: number): string {
  const [y, m, d] = parts(dateISO);
  // Clamp to the last day of the target month (Jan 31 + 1mo → Feb 28/29).
  const lastDay = new Date(Date.UTC(y, m - 1 + months + 1, 0)).getUTCDate();
  return fromUTC(Date.UTC(y, m - 1 + months, Math.min(d, lastDay)));
}

/** 1 = Monday … 7 = Sunday. */
export function isoWeekday(dateISO: string): number {
  const [y, m, d] = parts(dateISO);
  const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0 = Sunday
  return wd === 0 ? 7 : wd;
}

/** Monday of the week containing `dateISO`. */
export function startOfWeek(dateISO: string): string {
  return addDays(dateISO, 1 - isoWeekday(dateISO));
}

export function startOfMonth(dateISO: string): string {
  const [y, m] = parts(dateISO);
  return `${y}-${String(m).padStart(2, "0")}-01`;
}

export function daysInMonth(dateISO: string): number {
  const [y, m] = parts(dateISO);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Inclusive date-string comparison helpers (ISO strings compare lexically). */
export function isWithin(dateISO: string, from: string, to: string): boolean {
  return dateISO >= from && dateISO <= to;
}

export const weekdayLabels = ["一", "二", "三", "四", "五", "六", "日"];

/** "2026-07-18" → "2026年7月18日（六）" — Taiwan-style display. */
export function formatDateTW(dateISO: string): string {
  const [y, m, d] = parts(dateISO);
  return `${y}年${m}月${d}日（${weekdayLabels[isoWeekday(dateISO) - 1]}）`;
}

/** "2026-07" style month label → "2026年7月". */
export function formatMonthTW(dateISO: string): string {
  const [y, m] = parts(dateISO);
  return `${y}年${m}月`;
}

/**
 * Compose an Asia/Taipei ISO datetime from a calendar date and wall time.
 * All Team Calendar events are authored in Taipei local time.
 */
export function taipeiISO(dateISO: string, time: string): string {
  return `${dateISO}T${time}:00+08:00`;
}
