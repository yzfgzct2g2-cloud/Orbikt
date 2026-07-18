import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { CalendarEvent, CalendarEventStatus, CalendarEventType } from "../adapters/types";
import { Card, PageHeader } from "../components/ui/primitives";
import { team } from "../config/appConfig";
import {
  calendarSourceLabel,
  calendarStatusClass,
  calendarStatusLabel,
  calendarTypeClass,
  calendarTypeLabel,
} from "../lib/labels";
import { useAppStore } from "../store/useAppStore";
import { useCalendarStore } from "../store/useCalendarStore";
import { applyFilters } from "../modules/calendar/calendarFilters";
import {
  deriveVisitEvents,
  effectiveStatus,
  occursOn,
} from "../modules/calendar/calendarDomain";
import {
  formatDateTW,
  formatMonthTW,
  nowISO,
  taipeiDateOf,
  taipeiTimeOf,
  todayTaipei,
  weekdayLabels,
} from "../modules/calendar/calendarDates";
import { monthGrid, weekDates } from "../modules/calendar/calendarGrid";
import { combineCalendarEvents, eventTarget } from "../modules/calendar/calendarPage";
import { emptyForm, toEventInput, validateForm, type EventFormValues } from "../modules/calendar/calendarForm";
import { canEditEvent, canLinkCase, managesTeam, type CalendarActor } from "../modules/calendar/calendarPermissions";
import { teamProgress } from "../modules/calendar/calendarStats";

const typeOptions = Object.keys(calendarTypeLabel) as CalendarEventType[];
const statusOptions: CalendarEventStatus[] = ["scheduled", "in-progress", "completed", "cancelled"];

function formFromEvent(event: CalendarEvent): EventFormValues {
  return {
    title: event.title,
    date: taipeiDateOf(event.startAt),
    startTime: taipeiTimeOf(event.startAt),
    endTime: taipeiTimeOf(event.endAt),
    allDay: event.allDay,
    type: event.type,
    status: event.status,
    ownerId: event.ownerId,
    participantIds: event.participantIds,
    caseId: event.caseId ?? "",
    location: event.location ?? "",
    description: event.description,
  };
}

function memberName(id: string) {
  return team.find((member) => member.id === id)?.name ?? "未指派";
}

export function Calendar() {
  const currentUser = useAppStore((state) => state.currentUser);
  const cases = useAppStore((state) => state.cases);
  const actor: CalendarActor = { id: currentUser.id, role: currentUser.role };
  const store = useCalendarStore();
  const calendarLoaded = store.loaded;
  const loadCalendar = store.load;
  const [editing, setEditing] = useState<CalendarEvent | "new" | null>(null);
  const [form, setForm] = useState(() => emptyForm(store.anchorDate, actor.id));
  const [errors, setErrors] = useState<ReturnType<typeof validateForm>>({});

  useEffect(() => {
    if (!calendarLoaded) void loadCalendar();
  }, [calendarLoaded, loadCalendar]);

  const allEvents = useMemo(
    () => combineCalendarEvents(store.events, deriveVisitEvents(cases)),
    [store.events, cases]
  );
  const visible = useMemo(
    () => applyFilters(allEvents, store.filters, actor.id, nowISO()),
    [allEvents, store.filters, actor.id]
  );
  const progress = useMemo(
    () => teamProgress(allEvents, team, todayTaipei(), nowISO()),
    [allEvents]
  );
  const deleted = store.events.filter((event) => event.deletedAt);
  const allowedCases = cases.filter((item) => canLinkCase(actor, item));

  const openNew = (date = store.anchorDate) => {
    setForm(emptyForm(date, actor.id));
    setErrors({});
    setEditing("new");
  };
  const openEvent = (event: CalendarEvent) => {
    setForm(formFromEvent(event));
    setErrors({});
    setEditing(event);
  };
  const save = async () => {
    const nextErrors = validateForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const input = toEventInput(form, (id) => allowedCases.find((item) => item.id === id));
    const result = editing === "new"
      ? await store.createEvent(input, actor)
      : editing
        ? await store.updateEvent(editing, input, actor)
        : null;
    if (result) setEditing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="團隊行事曆"
        description="團隊工作協調層 · V1 儲存在目前瀏覽器，不是正式多人共用後端"
        action={<button onClick={() => openNew()} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">＋ 新增工作</button>}
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={store.goPrev} className="rounded-md border px-3 py-1.5" aria-label="上一區間">‹</button>
            <button onClick={store.goToday} className="rounded-md border px-3 py-1.5 text-sm font-semibold">今天</button>
            <button onClick={store.goNext} className="rounded-md border px-3 py-1.5" aria-label="下一區間">›</button>
            <strong className="ml-1 text-sm text-slate-800">
              {store.view === "month" ? formatMonthTW(store.anchorDate) : formatDateTW(store.anchorDate)}
            </strong>
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1" aria-label="行事曆檢視">
            {(["month", "week", "day"] as const).map((view) => (
              <button key={view} onClick={() => store.setView(view)} className={`rounded-md px-3 py-1 text-sm ${store.view === view ? "bg-white font-bold text-blue-700 shadow-sm" : "text-slate-500"}`}>
                {{ month: "月", week: "週", day: "日" }[view]}
              </button>
            ))}
          </div>
        </div>
        <Filters />
      </Card>

      <TeamSummary progress={progress} />
      <CalendarSurface view={store.view} anchor={store.anchorDate} events={visible} onOpen={openEvent} onDay={store.setAnchorDate} onNew={openNew} />

      {managesTeam(actor) && deleted.length > 0 && (
        <Card className="p-4">
          <h2 className="text-sm font-bold text-slate-900">已刪除事件復原</h2>
          <div className="mt-2 space-y-2">
            {deleted.map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-2 text-sm">
                <span>{event.title} · {formatDateTW(taipeiDateOf(event.startAt))}</span>
                <button onClick={() => void store.restoreEvent(event.id, actor)} className="text-blue-700 hover:underline">復原</button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {editing && (
        <EventDialog
          event={editing === "new" ? null : editing}
          form={form}
          setForm={setForm}
          errors={errors}
          actor={actor}
          allowedCases={allowedCases}
          saveState={store.saveState}
          storeError={store.error}
          onClose={() => setEditing(null)}
          onSave={() => void save()}
          onComplete={(event) => void store.completeEvent(event.id, actor).then(() => setEditing(null))}
          onReopen={(event) => void store.reopenEvent(event.id, actor).then(() => setEditing(null))}
          onCancel={(event) => void store.cancelEvent(event.id, actor).then(() => setEditing(null))}
          onDelete={(event) => void store.softDeleteEvent(event.id, actor).then(() => setEditing(null))}
        />
      )}
    </div>
  );
}

function Filters() {
  const filters = useCalendarStore((state) => state.filters);
  const setFilters = useCalendarStore((state) => state.setFilters);
  return (
    <div className="mt-3 grid gap-2 border-t pt-3 sm:grid-cols-2 lg:grid-cols-4">
      <select value={filters.owner} onChange={(e) => setFilters({ owner: e.target.value })} className="rounded-lg border px-3 py-2 text-sm" aria-label="篩選人員">
        <option value="all">全部個管</option><option value="me">我的工作</option>
        {team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
      </select>
      <select value={filters.caseRelation} onChange={(e) => setFilters({ caseRelation: e.target.value as typeof filters.caseRelation })} className="rounded-lg border px-3 py-2 text-sm" aria-label="篩選個案關聯">
        <option value="all">全部事件</option><option value="case">個案相關</option><option value="non-case">非個案</option>
      </select>
      <select value={filters.types[0] ?? ""} onChange={(e) => setFilters({ types: e.target.value ? [e.target.value as CalendarEventType] : [] })} className="rounded-lg border px-3 py-2 text-sm" aria-label="篩選事件類型">
        <option value="">全部類型</option>{typeOptions.map((type) => <option key={type} value={type}>{calendarTypeLabel[type]}</option>)}
      </select>
      <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"><input type="checkbox" checked={filters.showCompleted} onChange={(e) => setFilters({ showCompleted: e.target.checked })} />顯示已完成</label>
    </div>
  );
}

function TeamSummary({ progress }: { progress: ReturnType<typeof teamProgress> }) {
  return <div className="grid grid-cols-2 gap-2 md:grid-cols-5">{progress.map((item) => (
    <Card key={item.memberId} className="p-3"><div className="text-sm font-bold">{item.name}</div><div className="mt-1 text-xs text-slate-500">今日 {item.todayCount} · 未完成 {item.openCount}</div><div className={`text-xs ${item.overdueCount ? "font-bold text-red-600" : "text-slate-500"}`}>逾期 {item.overdueCount} · 本週 {item.weekCount}</div></Card>
  ))}</div>;
}

function CalendarSurface({ view, anchor, events, onOpen, onDay, onNew }: { view: "month" | "week" | "day"; anchor: string; events: CalendarEvent[]; onOpen: (e: CalendarEvent) => void; onDay: (d: string) => void; onNew: (d: string) => void }) {
  const today = todayTaipei();
  const days = view === "month" ? monthGrid(anchor, today).flat().map((cell) => cell.date) : view === "week" ? weekDates(anchor) : [anchor];
  return <Card className="overflow-hidden">
    {view !== "day" && <div className="hidden grid-cols-7 border-b bg-slate-50 md:grid">{weekdayLabels.map((label) => <div key={label} className="px-2 py-2 text-center text-xs font-bold text-slate-500">週{label}</div>)}</div>}
    <div className="hidden md:grid" style={{ gridTemplateColumns: `repeat(${view === "day" ? 1 : 7}, minmax(0, 1fr))` }}>
      {days.map((date) => <DayCell key={date} date={date} events={events.filter((e) => occursOn(e, date))} today={today} faded={view === "month" && date.slice(0, 7) !== anchor.slice(0, 7)} onOpen={onOpen} onDay={onDay} onNew={onNew} />)}
    </div>
    <div className="divide-y md:hidden">{days.filter((date) => events.some((e) => occursOn(e, date)) || date === anchor).map((date) => <DayList key={date} date={date} events={events.filter((e) => occursOn(e, date))} onOpen={onOpen} onNew={onNew} />)}</div>
  </Card>;
}

function DayCell({ date, events, today, faded, onOpen, onDay, onNew }: { date: string; events: CalendarEvent[]; today: string; faded: boolean; onOpen: (e: CalendarEvent) => void; onDay: (d: string) => void; onNew: (d: string) => void }) {
  return <div className={`min-h-28 border-b border-r p-1.5 ${faded ? "bg-slate-50 text-slate-400" : "bg-white"}`}>
    <div className="flex justify-between"><button onClick={() => onDay(date)} className={`h-7 w-7 rounded-full text-xs font-bold ${date === today ? "bg-blue-600 text-white" : "hover:bg-slate-100"}`}>{Number(date.slice(-2))}</button><button onClick={() => onNew(date)} className="text-slate-300 hover:text-blue-600" aria-label={`${date} 新增工作`}>＋</button></div>
    <div className="mt-1 space-y-1">{events.slice(0, 4).map((event) => <EventPill key={event.id} event={event} onOpen={onOpen} />)}{events.length > 4 && <div className="text-[10px] text-slate-500">另 {events.length - 4} 項</div>}</div>
  </div>;
}

function DayList({ date, events, onOpen, onNew }: { date: string; events: CalendarEvent[]; onOpen: (e: CalendarEvent) => void; onNew: (d: string) => void }) {
  return <section className="p-3"><div className="mb-2 flex justify-between"><strong className="text-sm">{formatDateTW(date)}</strong><button onClick={() => onNew(date)} className="text-sm text-blue-700">＋ 新增</button></div>{events.length ? <div className="space-y-2">{events.map((event) => <EventPill key={event.id} event={event} onOpen={onOpen} />)}</div> : <p className="text-xs text-slate-400">沒有工作</p>}</section>;
}

function EventPill({ event, onOpen }: { event: CalendarEvent; onOpen: (e: CalendarEvent) => void }) {
  const status = effectiveStatus(event, nowISO());
  return <button onClick={() => onOpen(event)} className={`block w-full truncate rounded px-2 py-1 text-left text-[11px] font-semibold ${status === "overdue" ? "bg-red-100 text-red-700" : calendarTypeClass[event.type]}`} title={event.title}>{event.allDay ? "全天" : taipeiTimeOf(event.startAt)} · {event.title}</button>;
}

function EventDialog({ event, form, setForm, errors, actor, allowedCases, saveState, storeError, onClose, onSave, onComplete, onReopen, onCancel, onDelete }: { event: CalendarEvent | null; form: EventFormValues; setForm: React.Dispatch<React.SetStateAction<EventFormValues>>; errors: ReturnType<typeof validateForm>; actor: CalendarActor; allowedCases: ReturnType<typeof useAppStore.getState>["cases"]; saveState: string; storeError: string | null; onClose: () => void; onSave: () => void; onComplete: (e: CalendarEvent) => void; onReopen: (e: CalendarEvent) => void; onCancel: (e: CalendarEvent) => void; onDelete: (e: CalendarEvent) => void }) {
  const editable = !event || canEditEvent(actor, event);
  const systemTarget = event ? eventTarget(event) : null;
  const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => setForm((prev) => ({ ...prev, [key]: value }));
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={event ? "工作詳細資料" : "新增工作"}>
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl">
      <div className="flex justify-between"><div><h2 className="text-lg font-bold">{event ? (editable ? "編輯工作" : "工作詳細資料") : "新增工作"}</h2>{event && <p className="text-xs text-slate-500">{calendarSourceLabel[event.source]} · {editable ? "可編輯" : "唯讀"}</p>}</div><button onClick={onClose} className="text-2xl text-slate-400" aria-label="關閉">×</button></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="標題" error={errors.title} wide><input value={form.title} disabled={!editable} onChange={(e) => set("title", e.target.value)} className="input" /></Field>
        <Field label="日期" error={errors.date}><input type="date" value={form.date} disabled={!editable} onChange={(e) => set("date", e.target.value)} className="input" /></Field>
        <Field label="全天事件"><label className="flex h-10 items-center gap-2"><input type="checkbox" checked={form.allDay} disabled={!editable} onChange={(e) => set("allDay", e.target.checked)} />全天</label></Field>
        {!form.allDay && <><Field label="開始時間" error={errors.startTime}><input type="time" value={form.startTime} disabled={!editable} onChange={(e) => set("startTime", e.target.value)} className="input" /></Field><Field label="結束時間" error={errors.endTime}><input type="time" value={form.endTime} disabled={!editable} onChange={(e) => set("endTime", e.target.value)} className="input" /></Field></>}
        <Field label="事件類型"><select value={form.type} disabled={!editable} onChange={(e) => set("type", e.target.value as CalendarEventType)} className="input">{typeOptions.map((type) => <option key={type} value={type}>{calendarTypeLabel[type]}</option>)}</select></Field>
        <Field label="工作狀態"><select value={form.status} disabled={!editable} onChange={(e) => set("status", e.target.value as CalendarEventStatus)} className="input">{statusOptions.map((status) => <option key={status} value={status}>{calendarStatusLabel[status]}</option>)}</select></Field>
        <Field label="負責人" error={errors.ownerId}><select value={form.ownerId} disabled={!editable || !managesTeam(actor)} onChange={(e) => set("ownerId", e.target.value)} className="input">{team.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field>
        <Field label="共同參與人"><select multiple value={form.participantIds} disabled={!editable} onChange={(e) => set("participantIds", Array.from(e.target.selectedOptions, (option) => option.value))} className="input h-24">{team.filter((member) => member.id !== form.ownerId).map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></Field>
        <Field label="個案連結"><select value={form.caseId} disabled={!editable} onChange={(e) => set("caseId", e.target.value)} className="input"><option value="">不連結個案</option>{allowedCases.map((item) => <option key={item.id} value={item.id}>{item.name}（{item.id}）</option>)}</select></Field>
        <Field label="地點"><input value={form.location} disabled={!editable} onChange={(e) => set("location", e.target.value)} className="input" /></Field>
        <Field label="說明" wide><textarea value={form.description} disabled={!editable} onChange={(e) => set("description", e.target.value)} className="input min-h-20" /></Field>
      </div>
      {event && <div className="mt-3 flex flex-wrap gap-2 text-xs"><span className={`rounded-full px-2 py-1 ${calendarStatusClass[effectiveStatus(event, nowISO())]}`}>{calendarStatusLabel[effectiveStatus(event, nowISO())]}</span><span className="rounded-full bg-slate-100 px-2 py-1">負責人：{memberName(event.ownerId)}</span>{systemTarget && <Link to={systemTarget} className="rounded-full bg-blue-50 px-2 py-1 text-blue-700">前往個案／來源模組 →</Link>}</div>}
      {(storeError || saveState === "saved") && <p className={`mt-3 text-sm ${storeError ? "text-red-600" : "text-emerald-600"}`}>{storeError ?? "已儲存"}</p>}
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        {event && editable && event.status !== "completed" && <button onClick={() => onComplete(event)} className="rounded-lg border px-3 py-2 text-sm">標記完成</button>}
        {event && editable && event.status === "completed" && <button onClick={() => onReopen(event)} className="rounded-lg border px-3 py-2 text-sm">重新開啟</button>}
        {event && editable && <button onClick={() => onCancel(event)} className="rounded-lg border px-3 py-2 text-sm">取消事件</button>}
        {event && editable && <button onClick={() => onDelete(event)} className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-700">軟刪除</button>}
        <button onClick={onClose} className="rounded-lg border px-3 py-2 text-sm">關閉</button>
        {editable && <button onClick={onSave} disabled={saveState === "saving"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saveState === "saving" ? "儲存中…" : "儲存"}</button>}
      </div>
    </div>
  </div>;
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={wide ? "sm:col-span-2" : ""}><span className="mb-1 block text-xs font-bold text-slate-600">{label}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}
