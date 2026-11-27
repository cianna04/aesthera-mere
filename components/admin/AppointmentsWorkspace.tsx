"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type SVGProps } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";

type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
type Appointment = {
  id: string; date: string; time: string; endTime: string; client: string;
  treatment: string; type: "Consultation" | "Treatment"; doctor: string;
  status: AppointmentStatus; source: string; phone: string; email: string; note: string;
};
type IconProps = SVGProps<SVGSVGElement>;

const STORAGE_KEY = "aesthera-admin-overview-appointments-v1";
const inputClass = "min-h-11 w-full rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3.5 font-montserrat text-[10px] text-[#354239] outline-none focus:border-[#344b38]/35 focus:ring-3 focus:ring-[#344b38]/8";
const statusStyles: Record<AppointmentStatus, string> = {
  Pending: "bg-[#f3eadb] text-[#85683d]", Confirmed: "bg-[#e7efe5] text-[#4d6e54]",
  Completed: "bg-[#e3e9ed] text-[#4d6471]", Cancelled: "bg-[#eee9e6] text-[#776b65]",
};
const avatarStyles = ["bg-[#dde8dc] text-[#426047]", "bg-[#e8ded1] text-[#755c47]", "bg-[#e7e1ef] text-[#66527a]", "bg-[#dce6e7] text-[#49666a]", "bg-[#f0dfdc] text-[#85564f]"];

function manilaDateKey(date = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(date); }
const todayKey = manilaDateKey();
const seedAppointments: Appointment[] = [
  { id: "APT-1024", date: todayKey, time: "09:00", endTime: "10:00", client: "Sofia Reyes", treatment: "Oxy Radiance Facial", type: "Treatment", doctor: "Dr. Raine", status: "Confirmed", source: "Website", phone: "+63 917 000 1024", email: "sofia@example.com", note: "Returning patient. Prefers a gentle extraction step." },
  { id: "APT-1025", date: todayKey, time: "10:30", endTime: "11:00", client: "Bianca Lim", treatment: "Skin consultation", type: "Consultation", doctor: "Dr. Dan", status: "Confirmed", source: "Instagram", phone: "+63 917 000 1025", email: "bianca@example.com", note: "First visit. Interested in options for uneven skin tone." },
  { id: "APT-1026", date: todayKey, time: "13:00", endTime: "14:00", client: "Mika Santos", treatment: "Thera JuveLook", type: "Treatment", doctor: "Dr. Raine", status: "Pending", source: "Website", phone: "+63 917 000 1026", email: "mika@example.com", note: "Awaiting confirmation of preferred treatment time." },
  { id: "APT-1027", date: todayKey, time: "14:30", endTime: "15:30", client: "Claire Yu", treatment: "Ultraformer MPT", type: "Treatment", doctor: "Dr. Dan", status: "Confirmed", source: "Phone", phone: "+63 917 000 1027", email: "claire@example.com", note: "Consultation completed previously. Treatment plan on file." },
  { id: "APT-1028", date: todayKey, time: "16:00", endTime: "17:00", client: "Andrea Cruz", treatment: "Aqua Reset Facial", type: "Treatment", doctor: "Dr. Raine", status: "Pending", source: "Walk-in", phone: "+63 917 000 1028", email: "andrea@example.com", note: "Requested a late-afternoon slot." },
];

function Icon({ children, ...props }: IconProps) { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>; }
function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AP"; }
function timeLabel(value: string) { const [hour, minute] = value.split(":").map(Number); return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${hour >= 12 ? "PM" : "AM"}`; }
function displayDate(value: string) { return new Date(`${value}T00:00:00+08:00`).toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
function addDays(value: string, amount: number) { const date = new Date(`${value}T12:00:00+08:00`); date.setDate(date.getDate() + amount); return manilaDateKey(date); }
function normalizeAppointment(item: Partial<Appointment> & { patient?: string }): Appointment {
  const time = /^\d{2}:\d{2}$/.test(item.time ?? "") ? item.time! : "09:00";
  const [hour, minute] = time.split(":").map(Number);
  const end = new Date(2000, 0, 1, hour, minute + 60);
  return {
    id: item.id ?? `APT-${Date.now().toString().slice(-6)}`, date: item.date ?? todayKey, time,
    endTime: item.endTime && /^\d{2}:\d{2}$/.test(item.endTime) ? item.endTime : `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`,
    client: item.client ?? item.patient ?? "Walk-in patient", treatment: item.treatment ?? "Consultation",
    type: item.type ?? "Treatment", doctor: item.doctor ?? "Dr. Raine", status: item.status ?? "Pending",
    source: item.source ?? "Admin overview", phone: item.phone ?? "", email: item.email ?? "", note: item.note ?? "Created from the admin overview.",
  };
}

export default function AppointmentsWorkspace() {
  const [appointments, setAppointments] = useState(seedAppointments);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | AppointmentStatus>("All");
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedId, setSelectedId] = useState(seedAppointments[0].id);
  const [editor, setEditor] = useState<"new" | string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) setAppointments((JSON.parse(raw) as Array<Partial<Appointment> & { patient?: string }>).map(normalizeAppointment));
      } catch { /* Continue with sample data. */ }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments)); } catch { /* Current-session state still works. */ }
  }, [appointments, hydrated]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!editor) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setEditor(null); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [editor]);

  const dayAppointments = useMemo(() => appointments.filter((item) => item.date === selectedDate).sort((a, b) => a.time.localeCompare(b.time)), [appointments, selectedDate]);
  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return dayAppointments.filter((appointment) => {
      const matchesQuery = !normalizedQuery || [appointment.client, appointment.treatment, appointment.doctor, appointment.id, appointment.phone].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesQuery && (status === "All" || appointment.status === status);
    });
  }, [dayAppointments, query, status]);
  const selectedAppointment = filteredAppointments.find((item) => item.id === selectedId) ?? filteredAppointments[0] ?? null;
  const editingAppointment = editor && editor !== "new" ? appointments.find((item) => item.id === editor) ?? null : null;
  const pendingCount = dayAppointments.filter((item) => item.status === "Pending").length;
  const confirmedCount = dayAppointments.filter((item) => item.status === "Confirmed").length;
  const openSlots = Math.max(0, 14 - dayAppointments.filter((item) => item.status !== "Cancelled").length);

  function saveAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const id = editingAppointment?.id ?? `APT-${Date.now().toString().slice(-6)}`;
    const next: Appointment = {
      id, date: String(data.get("date")), time: String(data.get("time")), endTime: String(data.get("endTime")),
      client: String(data.get("client")).trim(), treatment: String(data.get("treatment")).trim(),
      type: String(data.get("type")) as Appointment["type"], doctor: String(data.get("doctor")), status: editingAppointment?.status ?? "Pending",
      source: String(data.get("source")), phone: String(data.get("phone")).trim(), email: String(data.get("email")).trim(), note: String(data.get("note")).trim(),
    };
    setAppointments((current) => editingAppointment ? current.map((item) => item.id === id ? next : item) : [...current, next]);
    setSelectedDate(next.date); setSelectedId(id); setEditor(null);
    setNotice(editingAppointment ? `${next.client}’s appointment was updated.` : `${next.client} was added to the schedule.`);
  }

  function updateStatus(nextStatus: AppointmentStatus) {
    if (!selectedAppointment) return;
    setAppointments((current) => current.map((item) => item.id === selectedAppointment.id ? { ...item, status: nextStatus } : item));
    setNotice(`${selectedAppointment.client} is now ${nextStatus.toLowerCase()}.`);
  }

  function deleteAppointment() {
    if (!selectedAppointment || !window.confirm(`Permanently remove ${selectedAppointment.client} from the schedule?`)) return;
    setAppointments((current) => current.filter((item) => item.id !== selectedAppointment.id));
    setSelectedId("");
    setNotice(`${selectedAppointment.client} was removed.`);
  }

  return (
    <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10"><div className="mx-auto max-w-[1460px]">
      <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="flex flex-wrap items-center gap-2"><p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">Clinic operations</p></div><h1 className="font-seasons mt-3 text-[clamp(2.4rem,4vw,3.7rem)] leading-none tracking-[-0.025em] text-[#2e4433]">Appointments</h1><p className="mt-3 max-w-xl font-montserrat text-[11px] leading-6 text-[#778078]">Create bookings, manage the daily schedule, and keep every appointment status current.</p></div><button type="button" onClick={() => setEditor("new")} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#344c38] px-5 py-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_-14px_rgba(42,66,47,0.75)]"><Icon className="h-4 w-4"><path d="M12 5v14M5 12h14" /></Icon>New appointment</button></header>

      <section aria-label="Appointment summary" className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">{[[String(dayAppointments.length).padStart(2, "0"), "Bookings", "All scheduled visits"], [String(pendingCount).padStart(2, "0"), "Awaiting confirmation", "Front-desk follow-up"], [String(confirmedCount).padStart(2, "0"), "Confirmed", "Ready for arrival"], [String(openSlots).padStart(2, "0"), "Open slots", "Estimated capacity"]].map(([value, label, detail], index) => <article key={label} className={`rounded-2xl border p-4 sm:p-5 ${index === 1 ? "border-[#b89a6d]/20 bg-[#eee4d3]" : "border-[#334b39]/10 bg-white/70"}`}><p className="font-seasons text-2xl leading-none text-[#334b38] sm:text-3xl">{value}</p><p className="mt-2 font-montserrat text-[9px] font-semibold text-[#465349] sm:text-[10px]">{label}</p><p className="mt-1 hidden font-montserrat text-[8px] text-[#8b918b] sm:block">{detail}</p></article>)}</section>

      <section className="mt-5 rounded-[24px] border border-[#334b39]/10 bg-white/75 shadow-[0_14px_38px_-30px_rgba(35,54,40,0.45)]">
        <div className="flex flex-col gap-4 border-b border-[#334b39]/8 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between"><div className="inline-flex w-fit rounded-full bg-[#eef0ea] p-1" role="group" aria-label="Appointment view">{(["list", "calendar"] as const).map((item) => <button key={item} type="button" onClick={() => setView(item)} aria-pressed={view === item} className={`inline-flex min-h-9 items-center gap-2 rounded-full px-4 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] ${view === item ? "bg-white text-[#3f5844] shadow-sm" : "text-[#7e857e]"}`}>{item}</button>)}</div><div className="flex items-center justify-between gap-2 sm:justify-start"><CircleButton label="Previous day" onClick={() => setSelectedDate((date) => addDays(date, -1))} left /><div className="min-w-[220px] text-center"><p className="font-montserrat text-[10px] font-semibold text-[#3e4c42]">{displayDate(selectedDate)}</p><button type="button" onClick={() => setSelectedDate(todayKey)} className="mt-0.5 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#708273]">{selectedDate === todayKey ? "Today" : "Return to today"} · {dayAppointments.length} bookings</button></div><CircleButton label="Next day" onClick={() => setSelectedDate((date) => addDays(date, 1))} /></div></div>
        <div className="grid min-h-[650px] xl:grid-cols-[minmax(0,1fr)_340px]"><div className="min-w-0 border-[#334b39]/8 xl:border-r"><div className="grid gap-3 border-b border-[#334b39]/8 p-4 sm:grid-cols-[minmax(0,1fr)_190px] sm:p-5"><label className="flex min-h-10 items-center gap-3 rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3 text-[#778078]"><Icon className="h-4 w-4 shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon><span className="sr-only">Search appointments</span><input value={query} onChange={(event) => setQuery(event.target.value)} type="search" placeholder="Search patient, treatment, doctor…" className="w-full bg-transparent font-montserrat text-[10px] text-[#354239] outline-none" /></label><label className="flex min-h-10 items-center gap-2 rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3"><span className="sr-only">Filter by status</span><select value={status} onChange={(event) => setStatus(event.target.value as "All" | AppointmentStatus)} className="w-full bg-transparent font-montserrat text-[10px] font-medium text-[#536057] outline-none">{["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((item) => <option key={item}>{item}</option>)}</select></label></div>{view === "list" ? <AppointmentList appointments={filteredAppointments} selectedId={selectedAppointment?.id ?? ""} onSelect={setSelectedId} /> : <CalendarPreview appointments={filteredAppointments} onSelect={setSelectedId} />}</div><AppointmentDetails appointment={selectedAppointment} onConfirm={() => updateStatus("Confirmed")} onComplete={() => updateStatus("Completed")} onReschedule={() => selectedAppointment && setEditor(selectedAppointment.id)} onCancel={() => updateStatus("Cancelled")} onDelete={deleteAppointment} /></div>
      </section>
    </div>

    {editor && <AppointmentEditor appointment={editingAppointment} defaultDate={selectedDate} onClose={() => setEditor(null)} onSubmit={saveAppointment} />}
    {notice && <div role="status" className="fixed bottom-5 right-5 z-[80] max-w-sm rounded-2xl bg-[#29382b] px-5 py-4 font-montserrat text-[10px] text-white shadow-2xl">{notice}</div>}
    </main>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) { return <span className={`inline-flex rounded-full px-2.5 py-1.5 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] ${statusStyles[status]}`}>{status}</span>; }
function CircleButton({ label, onClick, left }: { label: string; onClick: () => void; left?: boolean }) { return <button type="button" aria-label={label} onClick={onClick} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#334b39]/10 text-[#69736b] hover:bg-[#eef1ea]">{left ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}</button>; }

function AppointmentList({ appointments, selectedId, onSelect }: { appointments: Appointment[]; selectedId: string; onSelect: (id: string) => void }) {
  if (!appointments.length) return <EmptyState />;
  return <div className="divide-y divide-[#334b39]/7"><div className="hidden grid-cols-[90px_minmax(150px,1fr)_minmax(160px,1.2fr)_110px_90px] gap-4 px-5 py-3 font-montserrat text-[8px] font-semibold uppercase tracking-[0.12em] text-[#939890] lg:grid"><span>Time</span><span>Patient</span><span>Appointment</span><span>Doctor</span><span>Status</span></div>{appointments.map((appointment, index) => <button key={appointment.id} type="button" onClick={() => onSelect(appointment.id)} aria-pressed={selectedId === appointment.id} className={`grid w-full gap-3 px-4 py-4 text-left sm:px-5 lg:grid-cols-[90px_minmax(150px,1fr)_minmax(160px,1.2fr)_110px_90px] lg:items-center lg:gap-4 ${selectedId === appointment.id ? "bg-[#eef2eb]" : "hover:bg-[#faf9f5]"}`}><div className="flex items-center justify-between lg:block"><div><p className="font-montserrat text-[10px] font-bold text-[#35483a]">{timeLabel(appointment.time)}</p><p className="mt-1 font-montserrat text-[8px] text-[#92978f]">to {timeLabel(appointment.endTime)}</p></div><span className="lg:hidden"><StatusBadge status={appointment.status} /></span></div><div className="flex min-w-0 items-center gap-3"><span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-montserrat text-[9px] font-bold ${avatarStyles[index % avatarStyles.length]}`}>{initials(appointment.client)}</span><div className="min-w-0"><p className="truncate font-montserrat text-[10px] font-semibold text-[#3d4a40]">{appointment.client}</p><p className="mt-1 font-montserrat text-[8px] text-[#92978f]">{appointment.id}</p></div></div><div className="min-w-0 pl-12 lg:pl-0"><p className="truncate font-montserrat text-[10px] font-medium text-[#4d5850]">{appointment.treatment}</p><p className="mt-1 font-montserrat text-[8px] text-[#92978f]">{appointment.type}</p></div><p className="hidden font-montserrat text-[9px] text-[#737b74] lg:block">{appointment.doctor}</p><span className="hidden lg:block"><StatusBadge status={appointment.status} /></span></button>)}</div>;
}

function CalendarPreview({ appointments, onSelect }: { appointments: Appointment[]; onSelect: (id: string) => void }) {
  if (!appointments.length) return <EmptyState />;
  const slots = Array.from({ length: 10 }, (_, index) => index + 8);
  return <div className="p-4 sm:p-5"><div className="grid grid-cols-[76px_1fr] overflow-hidden rounded-2xl border border-[#334b39]/8 bg-[#faf9f5]">{slots.map((hour) => { const items = appointments.filter((item) => Number(item.time.slice(0, 2)) === hour); return <div key={hour} className="contents"><div className="border-b border-r border-[#334b39]/7 px-3 py-4 font-montserrat text-[8px] font-semibold text-[#8d938d]">{timeLabel(`${String(hour).padStart(2, "0")}:00`)}</div><div className="min-h-16 space-y-2 border-b border-[#334b39]/7 p-2">{items.map((appointment) => <button key={appointment.id} type="button" onClick={() => onSelect(appointment.id)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-[#68806a]/15 bg-[#e7eee4] px-3 py-2 text-left"><span className="min-w-0"><b className="block truncate font-montserrat text-[9px] text-[#3f5543]">{timeLabel(appointment.time)} · {appointment.client}</b><small className="mt-1 block truncate font-montserrat text-[8px] text-[#718074]">{appointment.treatment}</small></span><StatusBadge status={appointment.status} /></button>)}</div></div>; })}</div></div>;
}

function EmptyState() { return <div className="grid min-h-[380px] place-items-center p-8 text-center"><div><p className="font-seasons text-2xl text-[#3f5143]">No appointments found</p><p className="mt-2 font-montserrat text-[10px] text-[#8a9089]">Try another date, search, or status filter.</p></div></div>; }

function AppointmentDetails({ appointment, onConfirm, onComplete, onReschedule, onCancel, onDelete }: { appointment: Appointment | null; onConfirm: () => void; onComplete: () => void; onReschedule: () => void; onCancel: () => void; onDelete: () => void }) {
  if (!appointment) return <aside className="grid min-h-[360px] place-items-center bg-[#f8f6f0] p-6 text-center"><div><p className="font-seasons text-xl text-[#3f5143]">No appointment selected</p><p className="mt-2 font-montserrat text-[9px] text-[#8a9089]">Select a booking to manage it.</p></div></aside>;
  return <aside className="bg-[#f8f6f0] p-5 sm:p-6 xl:sticky xl:top-[86px] xl:h-[calc(100vh-86px)] xl:overflow-y-auto"><div className="flex items-start justify-between gap-4"><div><p className="font-montserrat text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8a918a]">Appointment details</p><p className="font-seasons mt-2 text-2xl text-[#304534]">{appointment.client}</p><p className="mt-1 font-montserrat text-[9px] text-[#90968f]">{appointment.id}</p></div><StatusBadge status={appointment.status} /></div><div className="mt-5 rounded-2xl bg-[#344b38] p-4 text-white"><p className="font-montserrat text-[8px] font-semibold uppercase tracking-[0.13em] text-white/45">{displayDate(appointment.date)}</p><p className="font-seasons mt-2 text-2xl">{timeLabel(appointment.time)}–{timeLabel(appointment.endTime)}</p><p className="mt-2 font-montserrat text-[9px] text-white/60">{appointment.treatment}</p></div><dl className="mt-5 divide-y divide-[#334b39]/8 rounded-2xl border border-[#334b39]/8 bg-white/70 px-4">{[["Doctor", appointment.doctor], ["Visit type", appointment.type], ["Booking source", appointment.source], ["Phone", appointment.phone || "Not provided"], ["Email", appointment.email || "Not provided"]].map(([label, value]) => <div key={label} className="flex items-start justify-between gap-4 py-3"><dt className="font-montserrat text-[8px] uppercase tracking-[0.1em] text-[#92978f]">{label}</dt><dd className="max-w-[190px] text-right font-montserrat text-[9px] font-medium text-[#4e5a51]">{value}</dd></div>)}</dl><div className="mt-5 rounded-2xl border border-[#334b39]/8 bg-white/70 p-4"><p className="font-montserrat text-[8px] font-semibold uppercase tracking-[0.12em] text-[#92978f]">Booking note</p><p className="mt-2 font-montserrat text-[9px] leading-5 text-[#667068]">{appointment.note || "No note added."}</p></div><div className="mt-5 grid grid-cols-2 gap-2"><button type="button" onClick={onConfirm} disabled={appointment.status === "Confirmed"} className="min-h-10 rounded-full bg-[#3c5841] px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-white disabled:opacity-40">Confirm</button><button type="button" onClick={onComplete} disabled={appointment.status === "Completed"} className="min-h-10 rounded-full border border-[#3c5841]/20 px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#3f5844] disabled:opacity-40">Complete</button><button type="button" onClick={onReschedule} className="min-h-10 rounded-full border border-[#3c5841]/20 px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#3f5844]">Edit / reschedule</button><button type="button" onClick={onCancel} disabled={appointment.status === "Cancelled"} className="min-h-10 rounded-full border border-[#8b665d]/20 px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#86645c] disabled:opacity-40">Cancel</button><button type="button" onClick={onDelete} className="col-span-2 min-h-9 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#9a7169]">Delete appointment</button></div></aside>;
}

function AppointmentEditor({ appointment, defaultDate, onClose, onSubmit }: { appointment: Appointment | null; defaultDate: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={appointment ? "Edit appointment" : "New appointment"}><button type="button" onClick={onClose} className="fixed inset-0 bg-[#172119]/55 backdrop-blur-sm" aria-label="Close appointment form" /><section className="relative my-5 w-full max-w-2xl rounded-[28px] bg-[#fbfaf6] p-6 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.14em] text-[#8a918a]">{appointment ? "Update booking" : "Create booking"}</p><h2 className="font-seasons mt-2 text-3xl text-[#334b38]">{appointment ? "Edit appointment" : "New appointment"}</h2></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#edf0e9] text-[#536057]" aria-label="Close"><Icon className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></Icon></button></div><form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Patient name"><input name="client" required autoFocus defaultValue={appointment?.client} className={inputClass} /></Field><Field label="Treatment"><input name="treatment" required defaultValue={appointment?.treatment} className={inputClass} /></Field><Field label="Date"><input name="date" required type="date" defaultValue={appointment?.date ?? defaultDate} className={inputClass} /></Field><div className="grid grid-cols-2 gap-2"><Field label="Start"><input name="time" required type="time" defaultValue={appointment?.time ?? "09:00"} className={inputClass} /></Field><Field label="End"><input name="endTime" required type="time" defaultValue={appointment?.endTime ?? "10:00"} className={inputClass} /></Field></div><Field label="Doctor"><select name="doctor" defaultValue={appointment?.doctor ?? "Dr. Raine"} className={inputClass}><option>Dr. Raine</option><option>Dr. Dan</option></select></Field><Field label="Visit type"><select name="type" defaultValue={appointment?.type ?? "Treatment"} className={inputClass}><option>Treatment</option><option>Consultation</option></select></Field><Field label="Booking source"><select name="source" defaultValue={appointment?.source ?? "Admin"} className={inputClass}><option>Admin</option><option>Website</option><option>Phone</option><option>Walk-in</option><option>Instagram</option><option>Facebook</option></select></Field><Field label="Phone"><input name="phone" type="tel" defaultValue={appointment?.phone} placeholder="+63 9…" className={inputClass} /></Field><Field label="Email"><input name="email" type="email" defaultValue={appointment?.email} placeholder="patient@example.com" className={inputClass} /></Field><div className="sm:col-span-2"><Field label="Booking note"><textarea name="note" rows={3} defaultValue={appointment?.note} className={`${inputClass} py-3`} /></Field></div><div className="sm:col-span-2 flex flex-col-reverse gap-2 border-t border-[#334b39]/8 pt-4 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-11 rounded-full border border-[#334b39]/15 px-5 font-montserrat text-[9px] font-bold uppercase text-[#536057]">Discard</button><button type="submit" className="min-h-11 rounded-full bg-[#344c38] px-6 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-white">{appointment ? "Save changes" : "Create appointment"}</button></div></form></section></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) { return <label className="grid gap-2"><span className="font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#667068]">{label}</span>{children}</label>; }
