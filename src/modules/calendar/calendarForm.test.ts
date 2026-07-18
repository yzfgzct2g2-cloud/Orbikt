import { describe, expect, it } from "vitest";
import { emptyForm, toEventInput, validateForm } from "./calendarForm";
import type { CaseRecord } from "../../adapters/types";

const TODAY = "2026-07-18";

describe("validateForm", () => {
  it("valid defaults (with a title) pass", () => {
    const values = { ...emptyForm(TODAY, "cm-001"), title: "會議" };
    expect(validateForm(values)).toEqual({});
  });

  it("requires title, date and owner", () => {
    const values = { ...emptyForm(TODAY, "cm-001"), title: "  ", date: "", ownerId: "" };
    const errors = validateForm(values);
    expect(errors.title).toBe("請輸入標題");
    expect(errors.date).toBe("請選擇日期");
    expect(errors.ownerId).toBe("請選擇負責人");
  });

  it("rejects end before start", () => {
    const values = {
      ...emptyForm(TODAY, "cm-001"),
      title: "會議",
      startTime: "15:00",
      endTime: "14:00",
    };
    expect(validateForm(values).endTime).toBe("結束時間不得早於開始時間");
  });

  it("all-day skips time validation entirely", () => {
    const values = {
      ...emptyForm(TODAY, "cm-001"),
      title: "請假",
      allDay: true,
      startTime: "",
      endTime: "",
    };
    expect(validateForm(values)).toEqual({});
  });
});

describe("toEventInput case linking", () => {
  const cases = new Map<string, CaseRecord>([
    ["C-0001", { id: "C-0001", name: "王小明" } as CaseRecord],
  ]);
  const find = (id: string) => cases.get(id);

  it("verified case link carries id + display name only", () => {
    const values = { ...emptyForm(TODAY, "cm-001"), title: "家訪", caseId: "C-0001" };
    const input = toEventInput(values, find);
    expect(input.caseId).toBe("C-0001");
    expect(input.caseDisplayName).toBe("王小明");
  });

  it("unknown case ids are dropped — no orphan references", () => {
    const values = { ...emptyForm(TODAY, "cm-001"), title: "家訪", caseId: "C-9999" };
    const input = toEventInput(values, find);
    expect(input.caseId).toBeNull();
    expect(input.caseDisplayName).toBeUndefined();
  });

  it("empty caseId means a non-case event", () => {
    const values = { ...emptyForm(TODAY, "cm-001"), title: "教育訓練" };
    expect(toEventInput(values, find).caseId).toBeNull();
  });
});
