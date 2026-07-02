import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layout/AppLayout";
import { CommandCenter } from "./pages/CommandCenter";
import { Cases } from "./pages/Cases";
import { Workspace } from "./pages/Workspace";
import { WorkspacePicker } from "./pages/WorkspacePicker";
import { Knowledge } from "./pages/Knowledge";
import { Documents } from "./pages/Documents";
import { Notifications } from "./pages/Notifications";
import { Settings } from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<CommandCenter />} />
        <Route path="cases" element={<Cases />} />
        <Route path="workspace" element={<WorkspacePicker />} />
        <Route path="workspace/:caseId" element={<Workspace />} />
        <Route path="workspace/:caseId/:tab" element={<Workspace />} />
        <Route path="knowledge" element={<Knowledge />} />
        <Route path="documents" element={<Documents />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
