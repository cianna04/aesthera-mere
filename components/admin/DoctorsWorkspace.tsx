"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { DoctorProfile, DoctorProfileInput } from "@/types/doctor";

type Props = { initialDoctors: DoctorProfile[] };

const emptyForm: DoctorProfileInput = {
  slug: "",
  name: "",
  shortName: "",
  title: "Aesthetic Physician",
  tagline: "",
  image: "",
  biography: [],
  expertise: [],
  credentials: [],
  affiliations: [],
  leaveStartDate: null,
  leaveEndDate: null,
  weeklySchedule: [],
  sortOrder: 99,
};

function Icon({ children }: { children: React.ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">{children}</svg>;
}

function lines(values: string[]) {
  return values.join("\n");
}

function parseLines(value: string) {
  return value.split("\n").map((item) => item.trim()).filter(Boolean);
}

export default function DoctorsWorkspace({ initialDoctors }: Props) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "available" | "on-leave">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<DoctorProfileInput>(emptyForm);
  const [imagePreview, setImagePreview] = useState("");
  const [notice, setNotice] = useState("");
  const [doctorPendingDelete, setDoctorPendingDelete] = useState<DoctorProfile | null>(null);
  const [availabilityDoctor, setAvailabilityDoctor] = useState<DoctorProfile | null>(null);
  const [workingSchedule, setWorkingSchedule] = useState<DoctorProfile["weeklySchedule"]>([]);
  const [calendarMonth, setCalendarMonth] = useState(new Date(2026, 10, 1));
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const formSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isFormOpen) {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isFormOpen, editingId]);

  function isDoctorOnLeave(doctor: DoctorProfile) {
    if (!doctor.leaveStartDate || !doctor.leaveEndDate) return false;
    const today = new Date().toISOString().slice(0, 10);
    return today >= doctor.leaveStartDate && today <= doctor.leaveEndDate;
  }

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return doctors.filter((doctor) => {
      const matchesText = !term || [doctor.name, doctor.title, doctor.tagline].some((value) => value.toLowerCase().includes(term));
      const onLeave = isDoctorOnLeave(doctor);
      const matchesFilter = filter === "all" || (filter === "available" ? !onLeave : onLeave);
      return matchesText && matchesFilter;
    });
  }, [doctors, filter, query]);

  function startNew() {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setNotice("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setNotice("");
  }

  function editDoctor(doctor: DoctorProfile) {
    setEditingId(doctor.id);
    setForm({
      slug: doctor.slug,
      name: doctor.name,
      shortName: doctor.shortName,
      title: doctor.title,
      tagline: doctor.tagline,
      image: doctor.image,
      biography: doctor.biography,
      expertise: doctor.expertise,
      credentials: doctor.credentials,
      affiliations: doctor.affiliations,
      leaveStartDate: doctor.leaveStartDate,
      leaveEndDate: doctor.leaveEndDate,
      weeklySchedule: doctor.weeklySchedule,
      sortOrder: doctor.sortOrder,
    });
    setImagePreview(doctor.image);
    setNotice("");
    setIsFormOpen(true);
  }

  function update<K extends keyof DoctorProfileInput>(key: K, value: DoctorProfileInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImagePreview(result);
      update("image", result);
      setNotice("Portrait selected.");
    };
    reader.readAsDataURL(file);
  }

  function saveDoctor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setNotice("Doctor name is required.");
      return;
    }
    const now = new Date().toISOString();
    if (editingId) {
      setDoctors((current) => current.map((doctor) => doctor.id === editingId ? { ...doctor, ...form, updatedAt: now } : doctor));
      setNotice("Doctor profile updated.");
    } else {
      const newDoctor: DoctorProfile = {
        ...form,
        id: `doctor-${Date.now()}`,
        slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        createdAt: now,
        updatedAt: now,
      };
      setDoctors((current) => [...current, newDoctor]);
      setNotice("Doctor profile added.");
    }
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setIsFormOpen(false);
  }

  function openAvailability(doctor: DoctorProfile) {
    setAvailabilityDoctor(doctor);
    setWorkingSchedule(doctor.weeklySchedule);
    setLeaveStartDate(doctor.leaveStartDate ?? "");
    setLeaveEndDate(doctor.leaveEndDate ?? "");
    setCalendarMonth(new Date());
  }

  function updateWorkingDay(day: string, changes: Partial<DoctorProfile["weeklySchedule"][number]>) {
    setWorkingSchedule((current) => current.map((item) => item.day === day ? { ...item, ...changes } : item));
  }

  function saveAvailability() {
    if (!availabilityDoctor) return;
    if ((leaveStartDate && !leaveEndDate) || (!leaveStartDate && leaveEndDate) || (leaveStartDate && leaveEndDate && leaveEndDate < leaveStartDate)) {
      setNotice("Please select a valid leave date range, or clear both dates.");
      return;
    }
    setDoctors((current) => current.map((item) => item.id === availabilityDoctor.id
      ? { ...item, weeklySchedule: workingSchedule, leaveStartDate: leaveStartDate || null, leaveEndDate: leaveEndDate || null, updatedAt: new Date().toISOString() }
      : item));
    setAvailabilityDoctor(null);
    setNotice("Availability updated.");
  }

  function removeDoctor(doctor: DoctorProfile) {
    setDoctorPendingDelete(doctor);
  }

  function confirmRemoveDoctor() {
    if (!doctorPendingDelete) return;
    setDoctors((current) => current.filter((item) => item.id !== doctorPendingDelete.id));
    if (editingId === doctorPendingDelete.id) closeForm();
    setDoctorPendingDelete(null);
    setNotice("Profile removed.");
  }

  return (
    <main className="min-h-screen bg-[#FFFCF3] pb-16 text-[#4C5534]">
      <header className="border-b border-[#80755F]/15 bg-[#F1EBDD] px-6 py-7 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">Website management</p>
            <h1 className="mt-2 font-seasons text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-[#4C5534]">Doctors</h1>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1280px] px-6 pt-7 md:px-10">

        <section className="mt-6 grid grid-cols-4 gap-3" aria-label="Doctor profile summary">
          {[["Total profiles", doctors.length], ["Available", doctors.filter((doctor) => !isDoctorOnLeave(doctor)).length], ["On leave", doctors.filter((doctor) => isDoctorOnLeave(doctor)).length]].map(([label, value]) => (
            <article key={String(label)} className="rounded-[20px] border border-[#334b39]/10 bg-white/75 p-5">
              <p className="font-seasons text-3xl text-[#4c5534]">{value}</p>
              <p className="mt-2 font-montserrat text-[10px] font-semibold text-[#80755f]">{label}</p>
            </article>
          ))}
          <div className="flex items-center">
            <button type="button" onClick={startNew} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[18px] bg-[#4C5534] px-5 font-montserrat text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#35452F]">
              <Icon><path d="M12 5v14M5 12h14" /></Icon> Add doctor
            </button>
          </div>
        </section>

        <div className="mt-5 grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
          <section className="overflow-hidden rounded-[24px] border border-[#334b39]/10 bg-white/80">
            <div className="grid gap-3 border-b border-[#334b39]/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#334b39]/10 bg-[#f5f1e7] px-3">
                <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon>
                <span className="sr-only">Search doctor profiles</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search doctor profiles..." className="min-w-0 flex-1 bg-transparent font-montserrat text-[10px] outline-none" />
              </label>
              <div className="flex rounded-full bg-[#edf0e8] p-1">
                {(["all", "available", "on-leave"] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`min-h-9 rounded-full px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] ${filter === item ? "bg-white text-[#36513c] shadow-sm" : "text-[#858c85]"}`}>{item}</button>)}
              </div>
            </div>
            <div className="divide-y divide-[#334b39]/8">
              {visible.map((doctor) => (
                <article key={doctor.id} className="flex items-center gap-3 p-4 sm:p-5">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#e9e4d8]">
                    {doctor.image ? <Image src={doctor.image} alt={doctor.name} fill sizes="56px" className="object-cover" unoptimized={doctor.image.startsWith("data:")} /> : <span className="grid h-full w-full place-items-center font-seasons text-xl text-[#4f6442]">{doctor.name.split(" ").slice(-1)[0]?.slice(0, 1)}</span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-montserrat text-[11px] font-semibold text-[#39473d]">{doctor.name}</h2>
                    <p className="mt-1 truncate font-montserrat text-[9px] text-[#80755f]">{doctor.title}</p>
                    <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 font-montserrat text-[8px] font-bold uppercase ${isDoctorOnLeave(doctor) ? "bg-[#f1eee6] text-[#80755f]" : "bg-[#e8eee3] text-[#4f6442]"}`}>{isDoctorOnLeave(doctor) ? "On leave" : doctor.leaveStartDate && doctor.leaveStartDate > new Date().toISOString().slice(0, 10) ? "Leave scheduled" : "Available"}</span>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                    <button type="button" onClick={() => editDoctor(doctor)} className="min-h-8 rounded-full border border-[#334b39]/15 px-3 font-montserrat text-[8px] font-bold uppercase text-[#4c5534]">Edit</button>
                    <button type="button" onClick={() => openAvailability(doctor)} className="min-h-8 rounded-full border border-[#334b39]/15 px-3 font-montserrat text-[8px] font-bold uppercase text-[#4c5534]">Availability</button>
                    <button type="button" onClick={() => removeDoctor(doctor)} aria-label={`Remove ${doctor.name}`} className="min-h-8 rounded-full border border-[#8a5148]/25 px-3 font-montserrat text-[8px] font-bold uppercase text-[#8a5148]">Remove</button>
                  </div>
                </article>
              ))}
              {!visible.length && <p className="p-12 text-center font-montserrat text-xs text-[#80755f]">No doctor profiles match your search.</p>}
            </div>
          </section>

          {isFormOpen && (
            <section ref={formSectionRef} className="scroll-mt-8 rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#80755f]">{editingId ? "Edit profile" : "New profile"}</p>
                  <h2 className="font-seasons mt-2 text-2xl text-[#4c5534]">{editingId ? "Update doctor details" : "Add a doctor"}</h2>
                </div>
                <button type="button" onClick={closeForm} className="font-montserrat text-[9px] font-bold uppercase text-[#4f6442]">Close</button>
              </div>
  
              <form onSubmit={saveDoctor} className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block sm:col-span-2"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Full name *</span><input required value={form.name} onChange={(event) => update("name", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 font-montserrat text-xs outline-none focus:border-[#4f6442]" placeholder="e.g. Dr. Jane Dela Cruz" /></label>
                  <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Display name</span><input value={form.shortName} onChange={(event) => update("shortName", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 font-montserrat text-xs outline-none focus:border-[#4f6442]" placeholder="Dr. Jane" /></label>
                  <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Professional title</span><input value={form.title} onChange={(event) => update("title", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 font-montserrat text-xs outline-none focus:border-[#4f6442]" placeholder="Aesthetic Physician" /></label>
                </div>
  
                <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Tagline</span><input value={form.tagline} onChange={(event) => update("tagline", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 font-montserrat text-xs outline-none focus:border-[#4f6442]" placeholder="Specialties or professional focus" /></label>
                <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Biography (one paragraph per line)</span><textarea rows={4} value={lines(form.biography)} onChange={(event) => update("biography", parseLines(event.target.value))} className="w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 py-3 font-montserrat text-xs leading-6 outline-none focus:border-[#4f6442]" placeholder="Doctor biography..." /></label>
  
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Areas of expertise (one per line)</span><textarea rows={5} value={lines(form.expertise)} onChange={(event) => update("expertise", parseLines(event.target.value))} className="w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 py-3 font-montserrat text-xs leading-5 outline-none focus:border-[#4f6442]" /></label>
                  <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Education & credentials (one per line)</span><textarea rows={5} value={lines(form.credentials)} onChange={(event) => update("credentials", parseLines(event.target.value))} className="w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 py-3 font-montserrat text-xs leading-5 outline-none focus:border-[#4f6442]" /></label>
                </div>
  
                <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Professional affiliations (one per line)</span><textarea rows={3} value={lines(form.affiliations)} onChange={(event) => update("affiliations", parseLines(event.target.value))} className="w-full rounded-xl border border-[#334b39]/15 bg-[#fffcf3] px-3 py-3 font-montserrat text-xs leading-5 outline-none focus:border-[#4f6442]" /></label>
  
                <div className="rounded-2xl border border-dashed border-[#334b39]/20 bg-[#f5f1e7] p-4">
                  <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#80755f]">Doctor portrait</p>
                  {imagePreview && <div className="relative mt-3 h-40 w-32 overflow-hidden rounded-xl bg-[#e9e4d8]"><Image src={imagePreview} alt="Doctor portrait preview" fill sizes="128px" className="object-cover" unoptimized={imagePreview.startsWith("data:")} /></div>}
                  <input type="file" accept="image/*" onChange={handleImage} className="mt-3 block w-full font-montserrat text-[10px] text-[#80755f] file:mr-3 file:rounded-full file:border-0 file:bg-[#4c5534] file:px-4 file:py-2 file:font-montserrat file:text-[9px] file:font-semibold file:text-white" />
                </div>
  
                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#334b39]/10 pt-4">
                  <button type="submit" className="min-h-11 rounded-full bg-[#4c5534] px-6 font-montserrat text-[10px] font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#3d472a]">{editingId ? "Save changes" : "Add profile"}</button>
                </div>
              </form>
              {notice && <p role="status" className="mt-4 rounded-xl bg-[#edf2ea] px-4 py-3 font-montserrat text-[9px] leading-5 text-[#4f6442]">{notice}</p>}
            </section>
          )}
        </div>
      {availabilityDoctor && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#172119]/55 px-4 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAvailabilityDoctor(null); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="doctor-availability-title" className="my-auto w-full max-w-[760px] rounded-[24px] border border-[#334b39]/10 bg-[#fffcf3] p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div><p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80755f]">Doctor schedule</p><h2 id="doctor-availability-title" className="font-seasons mt-2 text-2xl text-[#4c5534]">Availability</h2><p className="mt-2 font-montserrat text-xs text-[#80755f]">{availabilityDoctor.name}</p></div>
              <button type="button" onClick={() => setAvailabilityDoctor(null)} className="font-montserrat text-[9px] font-bold uppercase text-[#4f6442]">Close</button>
            </div>

            <div className="mt-7">
              <h3 className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4c5534]">Weekly working hours</h3>
              <div className="mt-3 divide-y divide-[#334b39]/10 border-y border-[#334b39]/10">
                {workingSchedule.map((day) => (
                  <div key={day.day} className="grid items-center gap-3 py-3 sm:grid-cols-[110px_80px_1fr_1fr]">
                    <span className="font-montserrat text-[11px] text-[#4c5534]">{day.day}</span>
                    <label className="flex items-center gap-2 font-montserrat text-[9px] text-[#80755f]"><input type="checkbox" checked={day.enabled} onChange={(event) => updateWorkingDay(day.day, { enabled: event.target.checked })} className="h-4 w-4 accent-[#4c5534]" /> Working</label>
                    <label className="flex items-center gap-2 font-montserrat text-[9px] text-[#80755f]">From <input aria-label={day.day + " start time"} type="time" disabled={!day.enabled} value={day.startTime} onChange={(event) => updateWorkingDay(day.day, { startTime: event.target.value })} className="min-h-9 min-w-0 rounded-lg border border-[#334b39]/15 bg-white px-2 text-[11px] text-[#4c5534] disabled:opacity-40" /></label>
                    <label className="flex items-center gap-2 font-montserrat text-[9px] text-[#80755f]">To <input aria-label={day.day + " end time"} type="time" disabled={!day.enabled} value={day.endTime} onChange={(event) => updateWorkingDay(day.day, { endTime: event.target.value })} className="min-h-9 min-w-0 rounded-lg border border-[#334b39]/15 bg-white px-2 text-[11px] text-[#4c5534] disabled:opacity-40" /></label>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between"><h3 className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-[#4c5534]">Leave dates</h3><span className="font-montserrat text-[9px] text-[#80755f]">Select start, then end</span></div>
              <div className="mt-3 rounded-2xl border border-[#334b39]/10 bg-white p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-9 w-9 place-items-center rounded-full text-[#4c5534] hover:bg-[#f5f1e7]"><ChevronLeftIcon className="h-4 w-4" /></button>
                  <h4 className="font-montserrat text-xs font-semibold text-[#4c5534]">{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h4>
                  <button type="button" aria-label="Next month" onClick={() => setCalendarMonth((month) => new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-9 w-9 place-items-center rounded-full text-[#4c5534] hover:bg-[#f5f1e7]"><ChevronRightIcon className="h-4 w-4" /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => <span key={day} className="py-2 font-montserrat text-[9px] font-semibold text-[#80755f]">{day}</span>)}
                  {Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() }, (_, index) => <span key={"blank-" + index} />)}
                  {Array.from({ length: new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate() }, (_, index) => {
                    const value = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
                    const selected = value === leaveStartDate || value === leaveEndDate;
                    const inRange = Boolean(leaveStartDate && leaveEndDate && value > leaveStartDate && value < leaveEndDate);
                    return <button key={value} type="button" onClick={() => {
                      if (!leaveStartDate || leaveEndDate || value < leaveStartDate) { setLeaveStartDate(value); setLeaveEndDate(""); }
                      else setLeaveEndDate(value);
                    }} className={`mx-auto grid h-9 w-9 place-items-center rounded-full font-montserrat text-[10px] ${selected ? "bg-[#4c5534] text-white" : inRange ? "bg-[#e8eee3] text-[#4c5534]" : "text-[#4c5534] hover:bg-[#f5f1e7]"}`}>{index + 1}</button>;
                  })}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-[#334b39]/10 pt-4">
                  <div><p className="font-montserrat text-[8px] font-semibold uppercase text-[#80755f]">Start date</p><p className="mt-1 font-montserrat text-[11px] text-[#4c5534]">{leaveStartDate || "Not selected"}</p></div>
                  <div><p className="font-montserrat text-[8px] font-semibold uppercase text-[#80755f]">End date</p><p className="mt-1 font-montserrat text-[11px] text-[#4c5534]">{leaveEndDate || "Not selected"}</p></div>
                </div>
              </div>
            </div>
            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => { setLeaveStartDate(""); setLeaveEndDate(""); }} className="min-h-11 rounded-full border border-[#334b39]/20 px-5 font-montserrat text-[9px] font-semibold uppercase text-[#526557]">Clear leave</button>
              <button type="button" onClick={saveAvailability} className="min-h-11 rounded-full bg-[#4c5534] px-6 font-montserrat text-[9px] font-semibold uppercase text-white">Save availability</button>
            </div>
          </section>
        </div>
      )}
      {doctorPendingDelete && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#172119]/55 px-5 py-8 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setDoctorPendingDelete(null);
          }}
        >
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-doctor-title"
            aria-describedby="delete-doctor-description"
            className="w-full max-w-[440px] rounded-[24px] border border-[#334b39]/10 bg-[#fffcf3] p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e8e2] text-[#8a5148]">
              <Icon><path d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6" /></Icon>
            </div>
            <p className="mt-5 font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#8a5148]">
              Remove doctor profile
            </p>
            <h2 id="delete-doctor-title" className="font-seasons mt-2 text-2xl text-[#4c5534]">
              Are you sure?
            </h2>
            <p id="delete-doctor-description" className="mt-3 font-montserrat text-xs leading-6 text-[#80755f]">
              You are about to remove <strong className="font-semibold text-[#4c5534]">{doctorPendingDelete.name}</strong> from the doctor directory.
            </p>
            <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDoctorPendingDelete(null)}
                className="min-h-11 rounded-full border border-[#334b39]/20 px-5 font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-[#526557] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4f6442]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoveDoctor}
                className="min-h-11 rounded-full bg-[#8d5148] px-5 font-montserrat text-[9px] font-semibold uppercase tracking-[0.1em] text-white hover:bg-[#754139] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8d5148]"
              >
                Yes, remove profile
              </button>
            </div>
          </section>
        </div>
      )}
      </div>
    </main>
  );
}
