import { describe, it, expect, beforeEach } from "vitest";
import { useAppStore } from "./useAppStore";
import type { TaskItem } from "../adapters/types";

const sampleTasks: TaskItem[] = [
  {
    id: "T-1",
    caseId: null,
    title: "個管晨會",
    due: "2026-07-02",
    type: "meeting",
    done: false,
  },
  {
    id: "T-2",
    caseId: "C-1",
    title: "完成照顧計畫",
    due: "2026-07-02",
    type: "plan",
    done: false,
  },
];

describe("useAppStore — toggleTaskDone (daily progress)", () => {
  beforeEach(() => {
    useAppStore.setState({ tasks: structuredClone(sampleTasks) });
  });

  it("marks a task done and back", () => {
    useAppStore.getState().toggleTaskDone("T-1");
    expect(useAppStore.getState().tasks.find((t) => t.id === "T-1")?.done).toBe(
      true
    );
    useAppStore.getState().toggleTaskDone("T-1");
    expect(useAppStore.getState().tasks.find((t) => t.id === "T-1")?.done).toBe(
      false
    );
  });

  it("does not affect other tasks", () => {
    useAppStore.getState().toggleTaskDone("T-1");
    expect(useAppStore.getState().tasks.find((t) => t.id === "T-2")?.done).toBe(
      false
    );
  });

  it("ignores unknown ids", () => {
    useAppStore.getState().toggleTaskDone("T-nope");
    expect(useAppStore.getState().tasks.every((t) => !t.done)).toBe(true);
  });
});

describe("useAppStore — refreshData (defined dashboard refresh)", () => {
  it("re-derives data but preserves done-marks by task id", async () => {
    // Adapter-derived tasks include deterministic ids; mark one done first.
    useAppStore.setState({ loaded: false, loading: false });
    await useAppStore.getState().loadInitial();
    const first = useAppStore.getState().tasks[0];
    expect(first).toBeDefined();
    useAppStore.getState().toggleTaskDone(first.id);

    await useAppStore.getState().refreshData();

    const after = useAppStore.getState();
    expect(after.tasks.find((t) => t.id === first.id)?.done).toBe(true);
    // Other tasks remain un-done (refresh does not invent state).
    expect(after.tasks.filter((t) => t.done)).toHaveLength(1);
    expect(after.lastRefreshedAt).not.toBeNull();
  });
});
