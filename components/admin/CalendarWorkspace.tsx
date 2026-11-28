"use client";

import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type SVGProps } from "react";
import AppointmentEditor from "@/components/admin/AppointmentEditor";
import { APPOINTMENTS_STORAGE_KEY, linkPatientBookings } from "@/components/admin/patientLinks";

type IconProps = SVGProps<SVGSVGElement>;
type CalendarView = "day" | "week" | "month" | "year";
type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
type StoredAppointment = { id: string; patientId?: string; date?: string; time: string; endTime?: string; client: string; treatment: string; doctor: string; status: AppointmentStatus; [key: string]: unknown };
type CalendarItem = { id: string; date: string; start: number; duration: number; patient: string; treatment: string; doctor: string; status: AppointmentStatus };

const STORAGE_KEY = APPOINTMENTS_STORAGE_KEY;
const doctors = ["All doctors", "Dr. Raine", "Dr. Dan", "Dr. Ian", "Non-doctor"];
const hours = Array.from({ length: 10 }, (_, index) => index + 8);
const today = dateKey(new Date());
const seedAppointments: StoredAppointment[] = [
  { id: "APT-1024", date: today, time: "09:00", endTime: "10:00", client: "Sofia Reyes", treatment: "Oxy Radiance Facial", doctor: "Dr. Raine", status: "Confirmed" },
  { id: "APT-1025", date: today, time: "10:30", endTime: "11:00", client: "Bianca Lim", treatment: "Skin consultation", doctor: "Dr. Dan", status: "Confirmed" },
  { id: "APT-1026", date: today, time: "13:00", endTime: "14:00", client: "Mika Santos", treatment: "Thera JuveLook", doctor: "Dr. Raine", status: "Pending" },
  { id: "APT-1027", date: today, time: "14:30", endTime: "15:30", client: "Claire Yu", treatment: "Ultraformer MPT", doctor: "Dr. Dan", status: "Confirmed" },
  { id: "APT-1030", date: addDateKey(today, 1), time: "11:00", endTime: "12:00", client: "Nina Go", treatment: "Aqua Reset Facial", doctor: "Dr. Raine", status: "Pending" },
  { id: "APT-1031", date: addDateKey(today, 2), time: "15:00", endTime: "16:00", client: "Lara Tan", treatment: "Treatment consultation", doctor: "Dr. Dan", status: "Confirmed" },
];

function Icon({ children, ...props }: IconProps) { return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>; }
function dateKey(date: Date) { return date.toLocaleDateString("en-CA", { timeZone: "Asia/Manila" }); }
function dateFromKey(value: string) { return new Date(`${value}T00:00:00+08:00`); }
function addDays(value: Date, amount: number) { const date = new Date(value); date.setDate(date.getDate() + amount); return date; }
function addDateKey(value: string, amount: number) { return dateKey(addDays(dateFromKey(value), amount)); }
function startOfWeek(value: Date) { const date = new Date(value); const day = date.getDay(); date.setDate(date.getDate() - (day === 0 ? 6 : day - 1)); date.setHours(0, 0, 0, 0); return date; }
function timeNumber(value: string) { const [hour, minute] = value.split(":").map(Number); return hour + minute / 60; }
function timeLabel(value: number) { const hour = Math.floor(value); const minute = String(Math.round((value % 1) * 60)).padStart(2, "0"); return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`; }
function sameMonth(a: Date, b: Date) { return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear(); }
function toCalendarItem(item: StoredAppointment): CalendarItem { const start = timeNumber(item.time); const end = item.endTime ? timeNumber(item.endTime) : start + 1; return { id: item.id, date: item.date ?? today, start, duration: Math.max(0.5, end - start), patient: item.client, treatment: item.treatment, doctor: item.doctor, status: item.status }; }

export default function CalendarWorkspace() {
  const [appointments, setAppointments] = useState(() => linkPatientBookings(seedAppointments));
  const [hydrated, setHydrated] = useState(false);
  const [cursor, setCursor] = useState(() => dateFromKey(today));
  const [view, setView] = useState<CalendarView>("week");
  const [doctor, setDoctor] = useState("All doctors");
  const [doctorOpen, setDoctorOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(seedAppointments[0].id);
  const [formOpen, setFormOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => { queueMicrotask(() => { try { const raw = window.localStorage.getItem(STORAGE_KEY); if (raw) setAppointments(linkPatientBookings(JSON.parse(raw) as StoredAppointment[])); } catch { /* Use samples. */ } setHydrated(true); }); }, []);
  useEffect(() => { if (!hydrated) return; try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments)); } catch { /* Current session remains usable. */ } }, [appointments, hydrated]);
  useEffect(() => { if (!notice) return; const timer = window.setTimeout(() => setNotice(""), 2500); return () => window.clearTimeout(timer); }, [notice]);

  const items = useMemo(() => appointments.map(toCalendarItem), [appointments]);
  const visible = useMemo(() => items.filter((item) => doctor === "All doctors" || item.doctor === doctor), [items, doctor]);
  const selected = visible.find((item) => item.id === selectedId) ?? null;
  const weekStart = startOfWeek(cursor);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));

  function move(direction: number) { setCursor((current) => { const next = new Date(current); if (view === "day") next.setDate(next.getDate() + direction); if (view === "week") next.setDate(next.getDate() + direction * 7); if (view === "month") next.setMonth(next.getMonth() + direction); if (view === "year") next.setFullYear(next.getFullYear() + direction); return next; }); }
  function updateStatus(status: AppointmentStatus) { if (!selected) return; setAppointments((current) => current.map((item) => item.id === selected.id ? { ...item, status } : item)); setNotice(`${selected.patient} is now ${status.toLowerCase()}.`); }
  function openDay(date: Date) { setCursor(date); setView("day"); }

  function saveAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: StoredAppointment = {
      id: `APT-${Date.now().toString().slice(-6)}`,
      date: String(data.get("date")), time: String(data.get("time")),
      client: String(data.get("client") ?? "").trim(), treatment: String(data.get("treatment") ?? "").trim(),
      doctor: String(data.get("doctor")), type: String(data.get("type")), source: String(data.get("source")),
      phone: String(data.get("phone") ?? "").trim(), email: String(data.get("email") ?? "").trim(),
      note: String(data.get("note") ?? "").trim(), status: "Pending",
    };
    setAppointments((current) => linkPatientBookings([...current, next]));
    setCursor(dateFromKey(next.date ?? today));
    setDoctor("All doctors");
    setSelectedId(next.id);
    setFormOpen(false);
    setNotice(`${next.client} was added to the schedule.`);
  }

  const heading = view === "day" ? cursor.toLocaleDateString("en-PH", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) : view === "week" ? `${weekStart.toLocaleDateString("en-PH", { month: "long", day: "numeric" })}–${weekDays[6].toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}` : view === "month" ? cursor.toLocaleDateString("en-PH", { month: "long", year: "numeric" }) : String(cursor.getFullYear());

  return <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10"><div className="mx-auto max-w-[1460px]">
    <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="flex items-center gap-2"><p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">Clinic operations</p></div><h1 className="font-seasons mt-3 text-[clamp(2.4rem,4vw,3.7rem)] leading-none text-[#2e4433]">Calendar</h1></div><button type="button" onClick={() => setFormOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#344c38] px-5 py-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-white"><Icon className="h-4 w-4"><path d="M12 5v14M5 12h14" /></Icon>New appointment</button></header>
    <section className="mt-8 overflow-visible rounded-[28px] border border-[#334b39]/8 bg-white/80 shadow-[0_18px_50px_-40px_rgba(35,54,40,0.5)]"><div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap items-center gap-2"><CircleButton label="Previous" onClick={() => move(-1)} left /><button type="button" onClick={() => setCursor(dateFromKey(today))} className="min-h-10 rounded-full bg-[#f0f2ec] px-4 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-[#405745]">Today</button><CircleButton label="Next" onClick={() => move(1)} /><p className="ml-1 font-seasons text-xl text-[#334b38] sm:ml-3 sm:text-2xl">{heading}</p></div><div className="flex flex-col gap-3 sm:flex-row sm:items-center"><ViewSwitcher view={view} onChange={setView} /><div className="relative"><button type="button" onClick={() => setDoctorOpen((open) => !open)} aria-expanded={doctorOpen} className={`flex min-h-11 w-full items-center justify-between gap-5 rounded-full px-4 font-montserrat text-[9px] font-semibold sm:w-44 ${doctorOpen ? "bg-[#344b38] text-white" : "bg-[#f0f2ec] text-[#405745]"}`}><span>{doctor}</span><Icon className="h-3.5 w-3.5"><path d="m6 9 6 6 6-6" /></Icon></button>{doctorOpen && <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-full min-w-48 rounded-2xl border border-[#344b38]/10 bg-[#fbfaf6] p-1.5 shadow-xl">{doctors.map((name) => <button key={name} type="button" onClick={() => { setDoctor(name); setDoctorOpen(false); }} className={`min-h-10 w-full rounded-xl px-3 text-left font-montserrat text-[9px] ${doctor === name ? "bg-[#e5ece2] font-bold" : "hover:bg-[#f0f1eb]"}`}>{name}</button>)}</div>}</div></div></div>
      <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]"><div className="min-w-0 overflow-x-auto bg-[#fbfaf7] xl:rounded-bl-[28px]">{view === "day" && <ScheduleGrid days={[cursor]} items={visible} selectedId={selectedId} onSelect={setSelectedId} />}{view === "week" && <ScheduleGrid days={weekDays} items={visible} selectedId={selectedId} onSelect={setSelectedId} />}{view === "month" && <MonthGrid cursor={cursor} items={visible} selectedId={selectedId} onSelect={setSelectedId} onOpenDay={openDay} />}{view === "year" && <YearGrid year={cursor.getFullYear()} items={visible} onOpenMonth={(month) => { const next = new Date(cursor); next.setMonth(month, 1); setCursor(next); setView("month"); }} />}</div><aside className="bg-[#f4f1e9] p-5 sm:p-6 xl:rounded-br-[28px]"><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.14em] text-[#8b918b]">Selected schedule</p>{selected ? <div className="mt-5"><div className="rounded-[22px] bg-[#344b38] p-5 text-white"><div className="flex justify-between gap-3"><p className="font-seasons text-2xl">{selected.patient}</p><span className="rounded-full bg-white/10 px-2 py-1 font-montserrat text-[7px] uppercase">{selected.status}</span></div><p className="mt-2 font-montserrat text-[9px] text-white/60">{selected.treatment}</p><p className="mt-5 font-seasons text-xl">{timeLabel(selected.start)}</p><p className="mt-1 font-montserrat text-[8px] uppercase tracking-[0.1em] text-[#d8c7a7]">{selected.doctor}</p></div><div className="mt-3 grid grid-cols-2 gap-2"><button type="button" onClick={() => updateStatus("Confirmed")} className="min-h-10 rounded-full bg-[#344b38] font-montserrat text-[8px] font-bold uppercase text-white">Confirm</button><button type="button" onClick={() => updateStatus("Completed")} className="min-h-10 rounded-full border border-[#344b38]/15 font-montserrat text-[8px] font-bold uppercase text-[#405047]">Complete</button><button type="button" onClick={() => updateStatus("Cancelled")} className="col-span-2 min-h-10 rounded-full border border-[#8b665d]/20 font-montserrat text-[8px] font-bold uppercase text-[#86645c]">Cancel appointment</button></div><Link href="/admin/appointments" className="mt-3 flex min-h-11 items-center justify-center rounded-full bg-white/70 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#3f5844]">Open full appointment manager</Link></div> : <p className="mt-5 font-montserrat text-[10px] text-[#8a9089]">Select a booking from the calendar.</p>}</aside></div>
    </section>
  </div>{formOpen && <AppointmentEditor defaultDate={dateKey(cursor)} onClose={() => setFormOpen(false)} onSubmit={saveAppointment} />}{notice && <div role="status" className="fixed bottom-5 right-5 z-50 rounded-2xl bg-[#29382b] px-5 py-4 font-montserrat text-[10px] text-white shadow-2xl">{notice}</div>}</main>;
}

function ViewSwitcher({ view, onChange }: { view: CalendarView; onChange: (view: CalendarView) => void }) { return <div className="flex rounded-full bg-[#f0f2ec] p-1">{(["day", "week", "month", "year"] as const).map((item) => <button key={item} type="button" onClick={() => onChange(item)} className={`min-h-9 rounded-full px-3 font-montserrat text-[8px] font-bold uppercase ${view === item ? "bg-white text-[#36513c] shadow-sm" : "text-[#858c85]"}`}>{item}</button>)}</div>; }
function CircleButton({ label, onClick, left }: { label: string; onClick: () => void; left?: boolean }) { return <button type="button" aria-label={label} onClick={onClick} className="grid h-10 w-10 place-items-center rounded-full bg-[#f0f2ec] text-[#405745]">{left ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />}</button>; }
function BookingCard({ item, active, onClick }: { item: CalendarItem; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`h-full w-full rounded-xl p-2 text-left ${active ? "bg-[#344b38] text-white" : item.status === "Pending" ? "bg-[#efe4d2] text-[#624f36]" : item.status === "Cancelled" ? "bg-[#eceae6] text-[#77766f]" : "bg-[#e3ebe0] text-[#39533f]"}`}><b className="block truncate font-montserrat text-[9px]">{item.patient}</b><span className="mt-1 block truncate font-montserrat text-[7px] opacity-70">{timeLabel(item.start)} · {item.doctor}</span><span className="mt-1 block truncate font-montserrat text-[7px] opacity-70">{item.treatment}</span></button>; }
function ScheduleGrid({ days, items, selectedId, onSelect }: { days: Date[]; items: CalendarItem[]; selectedId: string; onSelect: (id: string) => void }) { const columns = `72px repeat(${days.length}, minmax(${days.length === 1 ? "360px" : "112px"}, 1fr))`; return <div className={days.length === 1 ? "min-w-[500px]" : "min-w-[920px]"}><div className="grid bg-[#f2f2ec]" style={{ gridTemplateColumns: columns }}><div />{days.map((day) => <div key={dateKey(day)} className={`p-3 text-center ${dateKey(day) === today ? "bg-[#e5ece2]" : ""}`}><p className="font-montserrat text-[8px] font-bold uppercase text-[#8a9089]">{day.toLocaleDateString("en-PH", { weekday: "short" })}</p><p className="font-seasons mt-1 text-xl">{day.getDate()}</p></div>)}</div>{hours.map((hour) => <div key={hour} className="grid min-h-[82px]" style={{ gridTemplateColumns: columns }}><div className="p-3 text-right font-montserrat text-[8px] text-[#8d938d]">{timeLabel(hour)}</div>{days.map((day) => { const entries = items.filter((item) => item.date === dateKey(day) && Math.floor(item.start) === hour); return <div key={dateKey(day)} className="m-1 space-y-1 rounded-xl bg-white/55 p-1">{entries.map((item) => <BookingCard key={item.id} item={item} active={selectedId === item.id} onClick={() => onSelect(item.id)} />)}</div>; })}</div>)}</div>; }
function MonthGrid({ cursor, items, selectedId, onSelect, onOpenDay }: { cursor: Date; items: CalendarItem[]; selectedId: string; onSelect: (id: string) => void; onOpenDay: (date: Date) => void }) { const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1); const gridStart = addDays(first, -((first.getDay() + 6) % 7)); const days = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index)); return <div className="min-w-[760px] p-3 sm:p-5"><div className="grid grid-cols-7 gap-1.5">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <p key={day} className="py-2 text-center font-montserrat text-[8px] font-bold uppercase text-[#8b918b]">{day}</p>)}{days.map((day) => { const dayItems = items.filter((item) => item.date === dateKey(day)); return <div key={dateKey(day)} className={`min-h-24 rounded-2xl p-2 ${sameMonth(day, cursor) ? "bg-white/75" : "bg-[#f0efe9]/50"}`}><button type="button" onClick={() => onOpenDay(day)} className={`font-seasons text-base ${dateKey(day) === today ? "grid h-7 w-7 place-items-center rounded-full bg-[#344b38] text-white" : "px-1"}`}>{day.getDate()}</button><div className="mt-1 space-y-1">{dayItems.slice(0, 2).map((item) => <button key={item.id} type="button" onClick={() => onSelect(item.id)} className={`w-full truncate rounded-lg px-2 py-1.5 text-left font-montserrat text-[7px] ${selectedId === item.id ? "bg-[#344b38] text-white" : "bg-[#e4ebe1] text-[#3f5a45]"}`}>{timeLabel(item.start)} · {item.patient}</button>)}</div></div>; })}</div></div>; }
function YearGrid({ year, items, onOpenMonth }: { year: number; items: CalendarItem[]; onOpenMonth: (month: number) => void }) { return <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 lg:p-5">{Array.from({ length: 12 }, (_, month) => { const date = new Date(year, month, 1); const count = items.filter((item) => { const itemDate = dateFromKey(item.date); return itemDate.getFullYear() === year && itemDate.getMonth() === month; }).length; return <button key={month} type="button" onClick={() => onOpenMonth(month)} className="rounded-[20px] bg-white/75 p-4 text-left hover:bg-white"><b className="font-seasons text-xl font-normal text-[#334b38]">{date.toLocaleDateString("en-PH", { month: "long" })}</b><small className="mt-1 block font-montserrat text-[8px] text-[#8b918b]">{count} booking{count === 1 ? "" : "s"}</small><MiniMonth year={year} month={month} /></button>; })}</div>; }
function MiniMonth({ year, month }: { year: number; month: number }) { const first = new Date(year, month, 1); const offset = (first.getDay() + 6) % 7; const count = new Date(year, month + 1, 0).getDate(); const cells: ReactNode[] = Array.from({ length: offset }, (_, index) => <span key={`empty-${index}`} />); for (let day = 1; day <= count; day++) cells.push(<span key={day}>{day}</span>); return <div className="mt-4 grid grid-cols-7 text-center font-montserrat text-[7px] leading-4 text-[#7e867f]">{cells}</div>; }
