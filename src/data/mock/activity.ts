// Mock tasks, notifications, timeline events, and document links.
// Replaced by real adapters (Task/Calendar/Notification/Document) in later
// phases. Values reference the mock case ids in ./cases.ts.

import type {
  DocumentLink,
  NotificationItem,
  TaskItem,
  TimelineEvent,
} from "../../adapters/types";
import { externalLinks } from "../../config/externalLinks";

export const mockTasks: TaskItem[] = [
  {
    id: "T-01",
    caseId: "C-1005",
    title: "林淑芬 家訪（30 日內到期）",
    due: "2026-07-04",
    type: "visit",
    done: false,
  },
  {
    id: "T-02",
    caseId: "C-1003",
    title: "陳美玲 家訪逾期，需儘速安排",
    due: "2026-07-02",
    type: "visit",
    done: false,
  },
  {
    id: "T-03",
    caseId: "C-1003",
    title: "陳美玲 FA310 退件修正",
    due: "2026-07-03",
    type: "review",
    done: false,
  },
  {
    id: "T-04",
    caseId: "C-1005",
    title: "林淑芬 派案 Timeout，需人工確認",
    due: "2026-07-02",
    type: "dispatch",
    done: false,
  },
  {
    id: "T-05",
    caseId: "C-1002",
    title: "李國強 AA01 服務規劃待完成",
    due: "2026-07-05",
    type: "review",
    done: false,
  },
  {
    id: "T-06",
    caseId: "C-1007",
    title: "吳雅婷 新案首次家訪排程",
    due: "2026-07-10",
    type: "visit",
    done: false,
  },
  {
    id: "T-07",
    caseId: null,
    title: "上傳 6 月個管月報至 OneDrive",
    due: "2026-07-05",
    type: "document",
    done: false,
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: "N-01",
    kind: "visit",
    title: "家訪逾期警戒",
    body: "陳美玲（C-1003）家訪已逾期 23 天。",
    createdAt: "2026-07-02T08:05:00+08:00",
    read: false,
    caseId: "C-1003",
  },
  {
    id: "N-02",
    kind: "dispatch",
    title: "派案 Timeout",
    body: "林淑芬（C-1005）派案逾時未回覆，建議人工介入。",
    createdAt: "2026-07-01T19:46:00+08:00",
    read: false,
    caseId: "C-1005",
  },
  {
    id: "N-03",
    kind: "review",
    title: "FA310 退件",
    body: "蔡秀琴（C-1009）FA310 審查退件，欄位 L 有修正建議。",
    createdAt: "2026-05-30T09:02:00+08:00",
    read: true,
    caseId: "C-1009",
  },
  {
    id: "N-04",
    kind: "dispatch",
    title: "全數無人力",
    body: "黃志明（C-1006）派案目前無可用人力。",
    createdAt: "2026-06-29T16:22:00+08:00",
    read: true,
    caseId: "C-1006",
  },
  {
    id: "N-05",
    kind: "system",
    title: "歡迎使用 Orbikt",
    body: "Orbikt V1 工作平台已上線，所有個案作業請由 Workspace 進行。",
    createdAt: "2026-07-02T07:00:00+08:00",
    read: false,
    caseId: null,
  },
];

export const mockTimeline: TimelineEvent[] = [
  {
    id: "E-1001-1",
    caseId: "C-1001",
    at: "2026-06-28T09:12:00+08:00",
    type: "dispatch",
    summary: "派案已接受，服務單位確認。",
  },
  {
    id: "E-1001-2",
    caseId: "C-1001",
    at: "2026-06-20T10:00:00+08:00",
    type: "visit",
    summary: "完成家訪，下次到期 2026-07-19。",
  },
  {
    id: "E-1001-3",
    caseId: "C-1001",
    at: "2026-06-15T15:30:00+08:00",
    type: "aa01",
    summary: "AA01 照顧計畫審核通過。",
  },
  {
    id: "E-1003-1",
    caseId: "C-1003",
    at: "2026-06-30T11:05:00+08:00",
    type: "fa310",
    summary: "FA310 審查退件，需修正欄位 L。",
  },
  {
    id: "E-1003-2",
    caseId: "C-1003",
    at: "2026-04-10T09:30:00+08:00",
    type: "visit",
    summary: "完成家訪，下次到期 2026-06-09。",
  },
];

export const mockDocuments: DocumentLink[] = [
  {
    id: "D-01",
    label: "個管共用資料夾（A個管）",
    url: externalLinks.onedrive.sharedFolder,
    scope: "shared",
  },
];
