// Top-level navigation. These are Orbikt's global destinations. Case-scoped
// work happens inside the Workspace, which is entered per-case — Orbikt is a
// workspace, not a directory of functions.

export interface NavItem {
  to: string;
  label: string;
  icon: string; // inline SVG path data (24x24)
  end?: boolean;
}

export const navItems: NavItem[] = [
  {
    to: "/",
    label: "Command Center",
    end: true,
    icon: "M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10",
  },
  {
    to: "/cases",
    label: "Cases 個案",
    icon: "M4 5h16v4H4zM4 11h16v8H4zM8 15h8",
  },
  {
    to: "/workspace",
    label: "Workspace 工作區",
    icon: "M3 7h18v12H3zM3 7l2-3h14l2 3M9 12h6",
  },
  {
    to: "/knowledge",
    label: "Knowledge 知識庫",
    icon: "M4 5a2 2 0 012-2h12v18H6a2 2 0 01-2-2zM8 3v18",
  },
  {
    to: "/documents",
    label: "Documents 文件",
    icon: "M6 2h8l4 4v16H6zM14 2v4h4",
  },
  {
    to: "/notifications",
    label: "Notifications 通知",
    icon: "M12 3a6 6 0 016 6v4l2 3H4l2-3V9a6 6 0 016-6zM10 20a2 2 0 004 0",
  },
  {
    to: "/settings",
    label: "Settings 設定",
    icon: "M12 8a4 4 0 100 8 4 4 0 000-8zM3 12h2m14 0h2M12 3v2m0 14v2",
  },
];
