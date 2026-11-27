"use client";

import Link from "next/link";
import { ChevronRightIcon } from "@/components/Icons";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode, type SVGProps } from "react";

type Status = "Pending" | "Confirmed" | "Completed";
type Appointment = { id: string; date?: string; time: string; client: string; treatment: string; doctor: string; status: Status; [key: string]: unknown };
type PromoSummary = { id: string; title: string; badge: string };
type Props = { treatmentCount: number; categoryCount: number; resultCount: number; promos: PromoSummary[]; promoCount: number };
type IconProps = SVGProps<SVGSVGElement>;

const STORAGE_KEY = "aesthera-admin-overview-appointments-v1";
const inputClass = "min-h-11 w-full rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3.5 font-montserrat text-[10px] text-[#354239] outline-none focus:border-[#344b38]/35 focus:ring-3 focus:ring-[#344b38]/8";
const seedAppointments: Appointment[] = [
  { id: "APT-1024", time: "09:00", client: "Sofia Reyes", treatment: "Oxy Radiance Facial", doctor: "Dr. Raine", status: "Confirmed" },
  { id: "APT-1025", time: "10:30", client: "Bianca Lim", treatment: "Skin consultation", doctor: "Dr. Dan", status: "Confirmed" },
  { id: "APT-1026", time: "13:00", client: "Mika Santos", treatment: "Thera JuveLook", doctor: "Dr. Raine", status: "Pending" },
  { id: "APT-1027", time: "14:30", client: "Claire Yu", treatment: "Ultraformer MPT", doctor: "Dr. Dan", status: "Confirmed" },
  { id: "APT-1028", time: "16:00", client: "Andrea Cruz", treatment: "Aqua Reset Facial", doctor: "Dr. Raine", status: "Pending" },
];
const chartValues = [42, 58, 48, 72, 64, 86, 76];
const chartDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Icon({ children, ...props }: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "AP";
}

function displayTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return { time: `${hours % 12 || 12}:${String(minutes).padStart(2, "0")}`, period: hours >= 12 ? "PM" : "AM" };
}

function manilaDateKey() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

export default function OverviewWorkspace({ treatmentCount, categoryCount, resultCount, promos, promoCount }: Props) {
  const [appointments, setAppointments] = useState(seedAppointments);
  const [hydrated, setHydrated] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) setAppointments(JSON.parse(saved) as Appointment[]);
      } catch { /* Keep the sample schedule when browser storage is unavailable. */ }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
    } catch { /* The overview still works for the current session without storage. */ }
  }, [appointments, hydrated]);

  useEffect(() => {
    if (!formOpen && !selectedId) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setFormOpen(false); setSelectedId(null); } };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [formOpen, selectedId]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const selected = appointments.find((item) => item.id === selectedId) ?? null;
  const currentAppointments = useMemo(() => appointments.filter((item) => !item.date || item.date === manilaDateKey()), [appointments]);
  const pendingCount = currentAppointments.filter((item) => item.status === "Pending").length;
  const confirmedCount = currentAppointments.filter((item) => item.status === "Confirmed").length;
  const sortedAppointments = useMemo(() => [...currentAppointments].sort((a, b) => a.time.localeCompare(b.time)), [currentAppointments]);
  const today = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", weekday: "long", month: "long", day: "numeric" }).format(new Date());

  function saveAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const client = String(data.get("client") ?? "").trim();
    const next: Appointment = {
      id: `APT-${Date.now().toString().slice(-6)}`,
      date: manilaDateKey(), time: String(data.get("time") ?? "09:00"), client,
      treatment: String(data.get("treatment") ?? "Consultation"),
      doctor: String(data.get("doctor") ?? "Dr. Raine"), status: "Pending",
    };
    setAppointments((current) => [...current, next]);
    setFormOpen(false);
    setSelectedId(next.id);
    setNotice(`${client} was added to today’s schedule.`);
  }

  function updateStatus(status: Status) {
    if (!selected) return;
    setAppointments((current) => current.map((item) => item.id === selected.id ? { ...item, status } : item));
    setNotice(`${selected.client} is now ${status.toLowerCase()}.`);
  }

  function removeSelected() {
    if (!selected) return;
    setAppointments((current) => current.filter((item) => item.id !== selected.id));
    setSelectedId(null);
    setNotice(`${selected.client} was removed from the schedule.`);
  }

  const metrics = [
    { label: "Today’s appointments", value: String(currentAppointments.length).padStart(2, "0"), detail: `${pendingCount} awaiting confirmation`, trend: "Today", href: "#appointments", icon: <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></Icon> },
    { label: "Patients this month", value: "128", detail: "Review today’s patient bookings", trend: "+12%", href: "/admin/appointments", icon: <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></Icon> },
    { label: "Treatment catalog", value: String(treatmentCount), detail: `Across ${categoryCount} categories`, trend: "View", href: "#catalog", icon: <Icon><path d="M12 3v18M3 12h18" /><circle cx="12" cy="12" r="9" /></Icon> },
    { label: "Active promotions", value: String(promoCount).padStart(2, "0"), detail: "View current website offers", trend: "Live", href: "/promos", icon: <Icon><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7M2 7h20v5H2zM12 7v14" /></Icon> },
  ];

  return (
    <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1460px]">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div><p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">{today}</p><h1 className="font-seasons mt-2 text-[clamp(2.25rem,4vw,3.5rem)] leading-none tracking-[-0.025em] text-[#2e4433]">Good morning, Aesthera.</h1></div>
          <button type="button" onClick={() => setFormOpen(true)} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#344c38] px-5 py-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_-14px_rgba(42,66,47,0.75)] transition-transform hover:-translate-y-0.5"><Icon className="h-4 w-4"><path d="M12 5v14M5 12h14" /></Icon>New appointment</button>
        </section>

        <section aria-label="Clinic overview" className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => <Link key={metric.label} href={metric.href} className="group rounded-[22px] border border-[#334b39]/10 bg-white/75 p-5 shadow-[0_12px_35px_-28px_rgba(35,54,40,0.45)] backdrop-blur transition-transform hover:-translate-y-1 sm:p-6"><div className="flex items-start justify-between gap-4"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e5ebe2] text-[#4c6751] [&>svg]:h-[18px] [&>svg]:w-[18px]">{metric.icon}</span><span className="rounded-full bg-[#edf2ea] px-2.5 py-1 font-montserrat text-[9px] font-bold uppercase tracking-[0.08em] text-[#56715b]">{metric.trend}</span></div><p className="font-seasons mt-5 text-[38px] leading-none text-[#2e4433]">{metric.value}</p><p className="mt-2 font-montserrat text-[11px] font-semibold text-[#3f4c42]">{metric.label}</p><p className="mt-1.5 font-montserrat text-[9px] text-[#899089]">{metric.detail}</p></Link>)}
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.85fr)]">
          <section id="appointments" className="overflow-hidden rounded-[24px] border border-[#334b39]/10 bg-white/80 shadow-[0_12px_35px_-28px_rgba(35,54,40,0.45)]">
            <div className="flex items-center justify-between border-b border-[#334b39]/8 px-5 py-5 sm:px-6"><div><h2 className="font-seasons text-[25px] leading-none text-[#2e4433]">Today’s appointments</h2><p className="mt-2 font-montserrat text-[9px] uppercase tracking-[0.13em] text-[#8a9089]">{currentAppointments.length} bookings · {pendingCount} need attention</p></div><Link href="/admin/appointments" className="hidden items-center gap-2 font-montserrat text-[9px] font-bold uppercase tracking-[0.12em] text-[#526b56] sm:inline-flex">Manage schedule <ChevronRightIcon className="h-3.5 w-3.5" /></Link></div>
            <div className="divide-y divide-[#334b39]/7">
              {sortedAppointments.map((appointment) => { const formatted = displayTime(appointment.time); return <button key={appointment.id} type="button" onClick={() => setSelectedId(appointment.id)} className="grid w-full grid-cols-[50px_1fr_auto] items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#f8f7f2] focus-visible:bg-[#eef2eb] sm:grid-cols-[62px_1.1fr_1.4fr_0.7fr_auto] sm:gap-4 sm:px-6"><div><p className="font-montserrat text-[11px] font-bold text-[#344b38]">{formatted.time}</p><p className="mt-0.5 font-montserrat text-[8px] font-semibold uppercase tracking-[0.12em] text-[#92978f]">{formatted.period}</p></div><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dde8dc] font-montserrat text-[9px] font-bold text-[#426047]">{initials(appointment.client)}</span><div className="min-w-0"><p className="truncate font-montserrat text-[11px] font-semibold text-[#39473d]">{appointment.client}</p><p className="mt-1 truncate font-montserrat text-[9px] text-[#92978f] sm:hidden">{appointment.treatment}</p></div></div><p className="hidden truncate font-montserrat text-[10px] font-medium text-[#59625b] sm:block">{appointment.treatment}</p><p className="hidden font-montserrat text-[9px] text-[#838982] sm:block">{appointment.doctor}</p><StatusBadge status={appointment.status} /></button>; })}
            </div>
            <Link href="/admin/appointments" className="flex min-h-12 items-center justify-center border-t border-[#334b39]/8 font-montserrat text-[9px] font-bold uppercase tracking-[0.12em] text-[#526b56] hover:bg-[#f7f6f1]">Manage all appointments</Link>
          </section>

          <section className="rounded-[24px] border border-[#334b39]/10 bg-[#344b38] p-6 text-white shadow-[0_18px_45px_-28px_rgba(30,55,35,0.75)]"><div className="flex items-start justify-between"><div><p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-white/45">Weekly activity</p><p className="font-seasons mt-3 text-[38px] leading-none">47</p><p className="mt-2 font-montserrat text-[10px] text-white/55">appointments this week</p></div><span className="rounded-full bg-white/10 px-2.5 py-1 font-montserrat text-[9px] font-semibold text-[#d8c7a7]">+8.4%</span></div><div className="mt-8 flex h-40 items-end justify-between gap-2 border-b border-white/10 pb-3">{chartValues.map((value, index) => <div key={chartDays[index]} className="flex h-full flex-1 flex-col justify-end gap-2"><div className="group relative flex h-full items-end justify-center"><span className="absolute hidden rounded bg-white px-1.5 py-1 font-montserrat text-[8px] font-bold text-[#344b38] group-hover:block" style={{ bottom: `calc(${value}% + 8px)` }}>{Math.round(value / 10)}</span><div className={`w-full max-w-7 rounded-t-md ${index === 5 ? "bg-[#d7c19c]" : "bg-white/20"}`} style={{ height: `${value}%` }} /></div><span className="text-center font-montserrat text-[8px] text-white/45">{chartDays[index]}</span></div>)}</div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[0.06] p-3"><p className="font-montserrat text-[8px] uppercase tracking-[0.12em] text-white/40">Confirmed</p><p className="font-seasons mt-1.5 text-xl">{String(confirmedCount).padStart(2, "0")}</p></div><div className="rounded-xl bg-white/[0.06] p-3"><p className="font-montserrat text-[8px] uppercase tracking-[0.12em] text-white/40">Pending</p><p className="font-seasons mt-1.5 text-xl">{String(pendingCount).padStart(2, "0")}</p></div></div></section>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <section id="catalog" className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-6"><div className="flex items-center justify-between"><h2 className="font-seasons text-[24px] text-[#2e4433]">Catalog health</h2><span className="h-2 w-2 rounded-full bg-[#6c8a70]" /></div><p className="mt-2 font-montserrat text-[10px] leading-5 text-[#858c85]">A quick snapshot of the treatment content currently available on the website.</p><div className="mt-6 space-y-4"><div className="flex items-center justify-between font-montserrat text-[10px]"><span className="text-[#6f786f]">Treatments</span><span className="font-bold text-[#3d5141]">{treatmentCount}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-[#e8e9e3]"><div className="h-full w-[92%] rounded-full bg-[#607963]" /></div><div className="flex items-center justify-between font-montserrat text-[10px]"><span className="text-[#6f786f]">Before & after sets</span><span className="font-bold text-[#3d5141]">{resultCount}</span></div></div></section>
          <section className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-6"><div className="flex items-center justify-between"><h2 className="font-seasons text-[24px] text-[#2e4433]">Promotions</h2><Link href="/promos" className="font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-[#58705b]">View live</Link></div><p className="mt-2 font-montserrat text-[10px] leading-5 text-[#858c85]">{promoCount} active offers are currently visible on the website.</p><div className="mt-5 space-y-3">{promos.map((promo) => <Link href={`/promos#${promo.id}`} key={promo.id} className="flex items-center gap-3 rounded-xl bg-[#f5f3ed] p-3 hover:bg-[#eeece5]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e5ebe2] text-[#58705b]"><Icon className="h-4 w-4"><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7M2 7h20v5H2zM12 7v14" /></Icon></span><div className="min-w-0"><p className="truncate font-montserrat text-[10px] font-semibold text-[#435046]">{promo.title}</p><p className="mt-1 font-montserrat text-[8px] uppercase tracking-[0.1em] text-[#92978f]">{promo.badge}</p></div></Link>)}</div></section>
          <section className="rounded-[24px] border border-[#334b39]/10 bg-[#e8e1d4] p-6"><p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#82735f]">Quick access</p><h2 className="font-seasons mt-3 text-[27px] leading-[1.08] text-[#3f4f42]">Continue clinic operations.</h2><div className="mt-5 grid grid-cols-2 gap-2">{[["Appointments", "/admin/appointments"], ["Promotions", "/promos"], ["Doctors", "/doctors"], ["Website", "/"]].map(([label, href]) => <Link key={label} href={href} className="rounded-xl bg-white/45 px-3 py-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-[#526557] hover:bg-white/70"><span className="flex items-center justify-between gap-1">{label}<ChevronRightIcon className="h-3 w-3 shrink-0" /></span></Link>)}</div></section>
        </div>
      </div>

      {formOpen && <Modal title="New appointment" onClose={() => setFormOpen(false)}><form onSubmit={saveAppointment} className="mt-5 grid gap-4"><Field label="Patient name"><input name="client" required autoFocus placeholder="e.g. Maria Santos" className={inputClass} /></Field><Field label="Treatment"><input name="treatment" required placeholder="e.g. Skin consultation" className={inputClass} /></Field><div className="grid grid-cols-2 gap-3"><Field label="Time"><input name="time" required type="time" defaultValue="09:00" className={inputClass} /></Field><Field label="Doctor"><select name="doctor" className={inputClass}><option>Dr. Raine</option><option>Dr. Dan</option></select></Field></div><p className="font-montserrat text-[8px] leading-4 text-[#8a9089]">New appointments start as pending.</p><button type="submit" className="min-h-11 rounded-full bg-[#344c38] px-5 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-white">Add to schedule</button></form></Modal>}
      {selected && <Modal title="Appointment details" onClose={() => setSelectedId(null)}><div className="mt-5 rounded-2xl bg-[#f5f3ed] p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-seasons text-2xl text-[#334b38]">{selected.client}</p><p className="mt-1 font-montserrat text-[9px] text-[#8a9089]">{selected.id}</p></div><StatusBadge status={selected.status} /></div><dl className="mt-5 grid gap-3">{[["Time", `${displayTime(selected.time).time} ${displayTime(selected.time).period}`], ["Treatment", selected.treatment], ["Doctor", selected.doctor]].map(([label, value]) => <div key={label} className="flex justify-between gap-4 border-t border-[#334b39]/8 pt-3"><dt className="font-montserrat text-[8px] uppercase tracking-[0.1em] text-[#92978f]">{label}</dt><dd className="text-right font-montserrat text-[9px] font-semibold text-[#4e5a51]">{value}</dd></div>)}</dl></div><div className="mt-4 grid grid-cols-2 gap-2"><button type="button" onClick={() => updateStatus("Confirmed")} className="min-h-10 rounded-full bg-[#3c5841] px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-white">Confirm</button><button type="button" onClick={() => updateStatus("Completed")} className="min-h-10 rounded-full border border-[#3c5841]/20 px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-[#3f5844]">Complete</button><button type="button" onClick={removeSelected} className="col-span-2 min-h-10 rounded-full border border-[#8b665d]/20 px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-[#86645c]">Remove appointment</button></div></Modal>}
      {notice && <div role="status" className="fixed bottom-5 right-5 z-[70] max-w-sm rounded-2xl bg-[#29382b] px-5 py-4 font-montserrat text-[10px] text-white shadow-2xl">{notice}</div>}
    </main>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const styles = status === "Confirmed" ? "bg-[#e8efe6] text-[#507057]" : status === "Completed" ? "bg-[#e3e9ed] text-[#4d6471]" : "bg-[#f2eadc] text-[#8a6c3f]";
  return <span className={`shrink-0 rounded-full px-2.5 py-1.5 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] ${styles}`}>{status}</span>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#667068]">{label}</span>{children}</label>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-[60] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}><button type="button" className="absolute inset-0 bg-[#172119]/55 backdrop-blur-sm" aria-label={`Close ${title}`} onClick={onClose} /><section className="relative w-full max-w-md rounded-[26px] bg-[#fbfaf6] p-6 shadow-2xl"><div className="flex items-center justify-between gap-4"><h2 className="font-seasons text-2xl text-[#334b38]">{title}</h2><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#edf0e9] text-[#536057]" aria-label={`Close ${title}`}><Icon className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></Icon></button></div>{children}</section></div>;
}
