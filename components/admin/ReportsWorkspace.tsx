"use client";

import { useEffect, useMemo, useState } from "react";

type ReportStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled" | "No-show" | "Other";
type Dimension = "Treatment" | "Doctor" | "Source";
type DateRange = "30 days" | "90 days" | "All time";
type ExportFormat = "excel" | "pdf";
type Appointment = {
  id: string;
  date: string | null;
  dateAssumed: boolean;
  time: string;
  client: string;
  treatment: string;
  doctor: string;
  source: string;
  status: ReportStatus;
};
type Group = { label: string; count: number };

const STORAGE_KEY = "aesthera-admin-overview-appointments-v1";
const PAGE_SIZE = 8;
const dimensions: Dimension[] = ["Treatment", "Doctor", "Source"];
const statuses = ["All statuses", "Pending", "Confirmed", "Completed", "Cancelled", "No-show", "Other"] as const;
const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const inputClass = "min-h-11 w-full rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3.5 font-montserrat text-[10px] text-[#354239] outline-none transition-colors duration-200 focus:border-[#344b38]/35 focus:ring-3 focus:ring-[#344b38]/8";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizeStatus(value: unknown): ReportStatus {
  if (typeof value !== "string") return "Other";
  const status = value.trim().toLowerCase();
  if (status === "pending") return "Pending";
  if (status === "confirmed") return "Confirmed";
  if (status === "completed") return "Completed";
  if (status === "cancelled" || status === "canceled") return "Cancelled";
  if (status === "no-show" || status === "no show" || status === "noshow") return "No-show";
  return "Other";
}

function normalizeAppointment(value: unknown, index: number, today: string): Appointment | null {
  if (!isRecord(value)) return null;
  const date = typeof value.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.date)
    ? value.date
    : value.date == null ? today : null;
  const dateAssumed = value.date == null;
  const time = typeof value.time === "string" && /^\d{2}:\d{2}$/.test(value.time) ? value.time : "—";
  return {
    id: stringValue(value.id, `Booking ${index + 1}`),
    date,
    dateAssumed,
    time,
    client: stringValue(value.client, stringValue(value.patient, "Patient not recorded")),
    treatment: stringValue(value.treatment, "Treatment not recorded"),
    doctor: stringValue(value.doctor, "Doctor not recorded"),
    source: stringValue(value.source, "Not recorded"),
    status: normalizeStatus(value.status),
  };
}

function readAppointments(today: string) {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return { appointments: [] as Appointment[], skipped: 0 };
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("Saved booking data is not in the expected format.");
  const normalized = parsed.map((item, index) => normalizeAppointment(item, index, today));
  const appointments = normalized.filter((item): item is Appointment => item !== null);
  return { appointments, skipped: normalized.length - appointments.length };
}

function manilaToday() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
}

function dateDaysAgo(days: number, today: string) {
  const [year, month, day] = today.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day - days)).toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "Date not recorded";
  return new Intl.DateTimeFormat("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00+08:00`));
}

function formatTime(value: string) {
  if (value === "—") return value;
  const [hours, minutes] = value.split(":").map(Number);
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function groupBy(values: Appointment[], select: (appointment: Appointment) => string): Group[] {
  const counts = new Map<string, number>();
  for (const appointment of values) {
    const label = select(appointment);
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }
  return [...counts].map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

function csvCell(value: string) {
  const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replace(/"/g, '""')}"`;
}

function pdfText(value: string) {
  return value.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/·/g, "-")
    .replace(/[^\x20-\x7E]/g, "?");
}

export default function ReportsWorkspace() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [today, setToday] = useState("");
  const [storageError, setStorageError] = useState("");
  const [skippedCount, setSkippedCount] = useState(0);
  const [range, setRange] = useState<DateRange>("30 days");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("excel");
  const [dimension, setDimension] = useState<Dimension>("Treatment");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All statuses");
  const [page, setPage] = useState(1);
  const [breakdownPage, setBreakdownPage] = useState(1);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    function refresh() {
      try {
        const reportToday = manilaToday();
        const result = readAppointments(reportToday);
        setAppointments(result.appointments);
        setToday(reportToday);
        setSkippedCount(result.skipped);
        setStorageError("");
      } catch (error) {
        setAppointments([]);
        setStorageError(error instanceof Error ? error.message : "Could not read saved booking data.");
      } finally {
        setHydrated(true);
      }
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const periodAppointments = useMemo(() => {
    if (range === "All time") return appointments;
    if (!today) return [];
    const cutoff = dateDaysAgo(range === "30 days" ? 29 : 89, today);
    return appointments.filter((appointment) => appointment.date !== null && appointment.date >= cutoff && appointment.date <= today);
  }, [appointments, range, today]);

  const filteredAppointments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return periodAppointments.filter((appointment) => {
      const matchesQuery = !normalizedQuery || [
        appointment.id,
        appointment.client,
        appointment.treatment,
        appointment.doctor,
        appointment.source,
      ].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesStatus = status === "All statuses" || appointment.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [periodAppointments, query, status]);

  const breakdown = useMemo(() => {
    const field = dimension.toLowerCase() as "treatment" | "doctor" | "source";
    return groupBy(periodAppointments, (appointment) => appointment[field]);
  }, [dimension, periodAppointments]);

  const weekdayBreakdown = useMemo(() => {
    const counts = new Map(weekdays.map((day) => [day, 0]));
    for (const appointment of periodAppointments) {
      if (!appointment.date) continue;
      const day = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Manila" })
        .format(new Date(`${appointment.date}T12:00:00+08:00`));
      counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    return weekdays.map((label) => ({ label, count: counts.get(label) ?? 0 }))
      .sort((a, b) => b.count - a.count || weekdays.indexOf(a.label) - weekdays.indexOf(b.label));
  }, [periodAppointments]);

  const timeBreakdown = useMemo(() => groupBy(
    periodAppointments.filter((appointment) => appointment.time !== "—"),
    (appointment) => formatTime(`${appointment.time.slice(0, 2)}:00`),
  ), [periodAppointments]);

  const cancelledCount = periodAppointments.filter((appointment) => appointment.status === "Cancelled").length;
  const noShowCount = periodAppointments.filter((appointment) => appointment.status === "No-show").length;
  const completedCount = periodAppointments.filter((appointment) => appointment.status === "Completed").length;
  const pageCount = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageAppointments = filteredAppointments.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const breakdownPageCount = Math.max(1, Math.ceil(breakdown.length / PAGE_SIZE));
  const currentBreakdownPage = Math.min(breakdownPage, breakdownPageCount);
  const breakdownPageItems = breakdown.slice((currentBreakdownPage - 1) * PAGE_SIZE, currentBreakdownPage * PAGE_SIZE);
  const maxBreakdownCount = Math.max(1, ...breakdown.map((item) => item.count));
  const maxWeekdayCount = Math.max(1, ...weekdayBreakdown.map((item) => item.count));
  const maxTimeCount = Math.max(1, ...timeBreakdown.map((item) => item.count));

  function exportReport() {
    if (exportFormat === "pdf") {
      void downloadPdfReport();
      return;
    }

    const columns = ["Booking ID", "Date", "Time", "Patient", "Treatment", "Doctor", "Source", "Status"];
    const rows = filteredAppointments.map((appointment) => [
      appointment.id,
      appointment.date ?? "Date not recorded",
      appointment.time,
      appointment.client,
      appointment.treatment,
      appointment.doctor,
      appointment.source,
      appointment.status,
    ]);
    const csv = [columns, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aesthera-booking-report-${manilaToday()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    setNotice(`Downloaded an Excel-compatible CSV with ${filteredAppointments.length} booking${filteredAppointments.length === 1 ? "" : "s"}.`);
  }

  async function downloadPdfReport() {
    try {
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 14;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      function ensureSpace(height: number) {
        if (y + height > pageHeight - margin) {
          pdf.addPage();
          y = margin;
        }
      }

      function addSection(title: string, lines: string[]) {
        ensureSpace(12);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(12);
        pdf.setTextColor(52, 76, 56);
        pdf.text(pdfText(title), margin, y);
        y += 7;
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(62, 72, 64);
        for (const line of lines) {
          const wrappedLines = pdf.splitTextToSize(pdfText(line), contentWidth);
          const lineHeight = wrappedLines.length * 4;
          ensureSpace(lineHeight + 2);
          pdf.text(wrappedLines, margin, y);
          y += lineHeight + 2;
        }
        y += 3;
      }

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(19);
      pdf.setTextColor(46, 68, 51);
      pdf.text("Aesthera Mere - Booking Report", margin, y);
      y += 7;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(105, 115, 106);
      pdf.text(`${range} | Generated ${formatDate(today)} | ${filteredAppointments.length} matching bookings`, margin, y);
      y += 9;

      const summary = [
        ["Bookings", String(periodAppointments.length)],
        ["Completed", String(completedCount)],
        ["Cancellations", String(cancelledCount)],
        ["No-shows", String(noShowCount)],
      ];
      const gap = 4;
      const cardWidth = (contentWidth - gap * (summary.length - 1)) / summary.length;
      for (const [index, [label, value]] of summary.entries()) {
        const x = margin + index * (cardWidth + gap);
        pdf.setFillColor(244, 246, 242);
        pdf.setDrawColor(224, 228, 220);
        pdf.roundedRect(x, y, cardWidth, 18, 2, 2, "FD");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(14);
        pdf.setTextColor(52, 76, 56);
        pdf.text(value, x + 4, y + 8);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(105, 115, 106);
        pdf.text(label, x + 4, y + 14);
      }
      y += 25;

      addSection(`Bookings by ${dimension}`, breakdown.map((item) => `${item.label}: ${item.count}`));
      addSection("Busiest days", weekdayBreakdown.map((item) => `${item.label}: ${item.count}`));
      addSection("Busiest times", timeBreakdown.length ? timeBreakdown.map((item) => `${item.label}: ${item.count}`) : ["No booking times available."]);
      addSection("Cancellations and no-shows", [`Cancelled: ${cancelledCount}`, `No-show: ${noShowCount}`]);
      addSection("Booking details", filteredAppointments.length
        ? filteredAppointments.map((appointment) => [
          `${appointment.id} | ${formatDate(appointment.date)}${appointment.dateAssumed ? " *" : ""} | ${formatTime(appointment.time)} | ${appointment.status}`,
          `Patient: ${appointment.client} | Treatment: ${appointment.treatment}`,
          `Doctor: ${appointment.doctor} | Source: ${appointment.source}`,
        ].join("\n"))
        : ["No bookings match these filters."]);
      if (filteredAppointments.some((appointment) => appointment.dateAssumed)) {
        addSection("Date note", ["* Missing dates follow the overview's current-day convention."]);
      }

      const totalPages = pdf.getNumberOfPages();
      for (let page = 1; page <= totalPages; page += 1) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(120, 128, 120);
        pdf.text(`Page ${page} of ${totalPages}`, pageWidth - margin, pageHeight - 7, { align: "right" });
      }

      pdf.save(`aesthera-booking-report-${today}.pdf`);
      setNotice(`Downloaded the PDF report with ${filteredAppointments.length} booking${filteredAppointments.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setNotice(error instanceof Error ? `Could not download PDF: ${error.message}` : "Could not download the PDF report.");
    }
  }

  return (
    <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1460px]">
        <header className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">Clinic operations</p>
              <span className="rounded-full bg-[#e8eee6] px-2.5 py-1 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#56715b]">Browser-saved data</span>
            </div>
            <h1 className="font-seasons mt-3 text-[clamp(2.4rem,4vw,3.7rem)] leading-none tracking-[-0.025em] text-[#2e4433]">Reports</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="min-w-[155px] font-montserrat text-[9px] font-semibold text-[#667168]">
              Reporting period
              <select value={range} onChange={(event) => { setRange(event.target.value as DateRange); setPage(1); setBreakdownPage(1); }} className={`${inputClass} mt-1.5`}>
                <option>30 days</option>
                <option>90 days</option>
                <option>All time</option>
              </select>
            </label>
            <label className="min-w-[175px] font-montserrat text-[9px] font-semibold text-[#667168]">
              Export format
              <select value={exportFormat} onChange={(event) => setExportFormat(event.target.value as ExportFormat)} className={`${inputClass} mt-1.5`}>
                <option value="excel">Excel-compatible CSV</option>
                <option value="pdf">PDF download</option>
              </select>
            </label>
            <button type="button" onClick={exportReport} disabled={!hydrated || filteredAppointments.length === 0} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#344c38] px-5 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_10px_30px_-14px_rgba(42,66,47,0.65)] transition-[transform,background-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#263a2b] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#344c38] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 17v3h14v-3" /></svg>
              Export {exportFormat === "pdf" ? "PDF" : "Excel"}
            </button>
          </div>
        </header>

        {storageError && <p role="alert" className="mt-5 rounded-2xl border border-[#a76858]/20 bg-[#f4e8e3] px-4 py-3 font-montserrat text-[10px] leading-5 text-[#805247]">Reports could not read this browser’s saved appointments: {storageError}</p>}
        {!storageError && skippedCount > 0 && <p role="status" className="mt-5 rounded-2xl border border-[#b89a6d]/20 bg-[#f3eadb] px-4 py-3 font-montserrat text-[10px] leading-5 text-[#796341]">{skippedCount} malformed booking record{skippedCount === 1 ? " was" : "s were"} skipped.</p>}

        <section aria-label="Booking summary" className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <SummaryCard value={periodAppointments.length} label="Bookings" />
          <SummaryCard value={completedCount} label="Completed" />
          <SummaryCard value={cancelledCount} label="Cancellations" accent />
          <SummaryCard value={noShowCount} label="No-shows" accent />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
          <article className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 shadow-[0_14px_38px_-30px_rgba(35,54,40,0.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_-28px_rgba(35,54,40,0.42)] sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-[#92978f]">Bookings by</p><h2 className="font-seasons mt-2 text-[25px] leading-none text-[#2e4433]">{dimension}</h2></div>
              <div role="group" aria-label="Choose booking breakdown" className="inline-flex w-fit rounded-full bg-[#eef0ea] p-1">
                {dimensions.map((item) => <button key={item} type="button" onClick={() => { setDimension(item); setBreakdownPage(1); }} aria-pressed={dimension === item} className={`min-h-8 rounded-full px-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] transition-[background-color,color,box-shadow,transform] duration-200 ${dimension === item ? "bg-white text-[#3f5844] shadow-sm" : "text-[#7e857e] hover:text-[#405545]"}`}>{item}</button>)}
              </div>
            </div>
            <p className="mt-3 font-montserrat text-[9px] text-[#899089]">{periodAppointments.length} bookings in this period</p>
            {breakdown.length ? (
              <div className="mt-6 space-y-4">
                {breakdownPageItems.map((item) => <div key={item.label} className="transition-transform duration-200 hover:translate-x-0.5">
                  <div className="mb-1.5 flex items-center justify-between gap-3 font-montserrat text-[9px]"><span className="min-w-0 truncate font-medium text-[#526057]">{item.label}</span><span className="shrink-0 font-bold text-[#3d5141]">{item.count}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#e9ebe5]"><div className="h-full rounded-full bg-[#6b846e] transition-[width] duration-300" style={{ width: `${(item.count / maxBreakdownCount) * 100}%` }} /></div>
                </div>)}
                {breakdown.length > PAGE_SIZE && <div className="flex items-center justify-between border-t border-[#334b39]/8 pt-3">
                  <p className="font-montserrat text-[8px] text-[#899089]">Showing {(currentBreakdownPage - 1) * PAGE_SIZE + 1}–{Math.min(currentBreakdownPage * PAGE_SIZE, breakdown.length)} of {breakdown.length}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setBreakdownPage((current) => Math.max(1, current - 1))} disabled={currentBreakdownPage === 1} className="min-h-8 rounded-full border border-[#334b39]/12 px-3 font-montserrat text-[8px] font-bold text-[#526557] transition-colors duration-200 hover:bg-[#eef1ea] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                    <button type="button" onClick={() => setBreakdownPage((current) => Math.min(breakdownPageCount, current + 1))} disabled={currentBreakdownPage >= breakdownPageCount} className="min-h-8 rounded-full border border-[#334b39]/12 px-3 font-montserrat text-[8px] font-bold text-[#526557] transition-colors duration-200 hover:bg-[#eef1ea] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                  </div>
                </div>}
              </div>
            ) : <EmptyReport message="No bookings in this period yet." />}
          </article>

          <article className="rounded-[24px] border border-[#334b39]/10 bg-[#344b38] p-5 text-white shadow-[0_18px_45px_-28px_rgba(30,55,35,0.65)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_48px_-27px_rgba(30,55,35,0.7)] sm:p-6">
            <p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-white/45">Attendance</p>
            <h2 className="font-seasons mt-2 text-[25px] leading-none">Cancellations &amp; no-shows</h2>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/[0.07] p-4 transition-colors duration-200 hover:bg-white/[0.11]"><p className="font-seasons text-3xl text-[#e2cfad]">{cancelledCount}</p><p className="mt-2 font-montserrat text-[8px] font-semibold uppercase tracking-[0.1em] text-white/60">Cancelled</p></div>
              <div className="rounded-2xl bg-white/[0.07] p-4 transition-colors duration-200 hover:bg-white/[0.11]"><p className="font-seasons text-3xl text-[#e2cfad]">{noShowCount}</p><p className="mt-2 font-montserrat text-[8px] font-semibold uppercase tracking-[0.1em] text-white/60">No-show</p></div>
            </div>
          </article>
        </section>

        <section aria-label="Busiest booking times" className="mt-5 grid gap-5 xl:grid-cols-2">
          <article className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 shadow-[0_14px_38px_-30px_rgba(35,54,40,0.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_-28px_rgba(35,54,40,0.42)] sm:p-6">
            <p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-[#92978f]">Weekly pattern</p><h2 className="font-seasons mt-2 text-[25px] leading-none text-[#2e4433]">Busiest days</h2>
            <div className="mt-5 space-y-3">{weekdayBreakdown.map((item) => <div key={item.label} className="grid grid-cols-[82px_minmax(0,1fr)_24px] items-center gap-3 font-montserrat text-[8px]">
              <span className="text-[#707a71]">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-[#e9ebe5]"><div className="h-full rounded-full bg-[#6b846e] transition-[width] duration-300" style={{ width: `${(item.count / maxWeekdayCount) * 100}%` }} /></div><span className="text-right font-bold text-[#405545]">{item.count}</span>
            </div>)}</div>
            {!periodAppointments.some((appointment) => appointment.date) && <p className="mt-4 font-montserrat text-[8px] text-[#92978f]">Dates are not recorded for these bookings.</p>}
          </article>

          <article className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 shadow-[0_14px_38px_-30px_rgba(35,54,40,0.45)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_42px_-28px_rgba(35,54,40,0.42)] sm:p-6">
            <p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-[#92978f]">Hourly pattern</p><h2 className="font-seasons mt-2 text-[25px] leading-none text-[#2e4433]">Busiest times</h2>
            {timeBreakdown.length ? <div className="mt-5 space-y-3">{timeBreakdown.slice(0, 6).map((item) => <div key={item.label} className="grid grid-cols-[65px_minmax(0,1fr)_24px] items-center gap-3 font-montserrat text-[8px]">
              <span className="text-[#707a71]">{item.label}</span><div className="h-2 overflow-hidden rounded-full bg-[#e9ebe5]"><div className="h-full rounded-full bg-[#b39a70] transition-[width] duration-300" style={{ width: `${(item.count / maxTimeCount) * 100}%` }} /></div><span className="text-right font-bold text-[#405545]">{item.count}</span>
            </div>)}</div> : <EmptyReport message="No booking times available for this period." />}
          </article>
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#334b39]/10 bg-white/80 shadow-[0_14px_38px_-30px_rgba(35,54,40,0.45)]">
          <div className="flex flex-col justify-between gap-4 border-b border-[#334b39]/8 p-5 sm:flex-row sm:items-end sm:px-6">
            <div><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-[#92978f]">Booking records</p><h2 className="font-seasons mt-2 text-[25px] leading-none text-[#2e4433]">Report details</h2><p className="mt-2 font-montserrat text-[8px] text-[#899089]">{filteredAppointments.length} matching booking{filteredAppointments.length === 1 ? "" : "s"}</p></div>
            <div className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_160px]">
              <label className="sr-only" htmlFor="report-search">Search booking reports</label>
              <input id="report-search" type="search" value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search patient, treatment, source…" className={inputClass} />
              <label className="sr-only" htmlFor="report-status">Filter booking reports by status</label>
              <select id="report-status" value={status} onChange={(event) => { setStatus(event.target.value as (typeof statuses)[number]); setPage(1); }} className={inputClass}>{statuses.map((item) => <option key={item}>{item}</option>)}</select>
            </div>
          </div>
          {pageAppointments.length ? <div className="overflow-x-auto">
            <table className="w-full min-w-[790px] border-collapse text-left">
              <thead><tr className="font-montserrat text-[8px] font-semibold uppercase tracking-[0.1em] text-[#92978f]">
                {["Date & time", "Patient", "Treatment", "Doctor", "Source", "Status"].map((item) => <th key={item} scope="col" className="px-5 py-3 font-semibold first:pl-6">{item}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-[#334b39]/7">{pageAppointments.map((appointment, index) => <tr key={`${appointment.id}-${index}`} className="transition-colors duration-150 hover:bg-[#f8f7f2]">
                <td className="px-5 py-4 pl-6 font-montserrat text-[9px] text-[#606c62]"><span className="block font-semibold text-[#46564a]">{formatDate(appointment.date)}{appointment.dateAssumed ? " *" : ""}</span><span className="mt-1 block text-[8px] text-[#92978f]">{formatTime(appointment.time)}</span></td>
                <td className="px-5 py-4 font-montserrat text-[9px] font-semibold text-[#435046]">{appointment.client}<span className="mt-1 block font-normal text-[8px] text-[#92978f]">{appointment.id}</span></td>
                <td className="px-5 py-4 font-montserrat text-[9px] text-[#606c62]">{appointment.treatment}</td>
                <td className="px-5 py-4 font-montserrat text-[9px] text-[#606c62]">{appointment.doctor}</td>
                <td className="px-5 py-4 font-montserrat text-[9px] text-[#606c62]">{appointment.source}</td>
                <td className="px-5 py-4"><StatusBadge status={appointment.status} /></td>
              </tr>)}</tbody>
            </table>
          </div> : <EmptyReport message={hydrated ? "No bookings match these filters." : "Loading saved bookings…"} />}
          <div className="flex flex-col gap-3 border-t border-[#334b39]/8 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="font-montserrat text-[8px] text-[#899089]">
              <p>{filteredAppointments.length ? `Showing ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filteredAppointments.length)} of ${filteredAppointments.length}` : "No results to display"}</p>
              {filteredAppointments.some((appointment) => appointment.dateAssumed) && <p className="mt-1">* Missing dates follow the overview’s current-day convention.</p>}
            </div>
            <div className="flex items-center gap-2" aria-label="Report pagination">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={currentPage === 1} className="min-h-9 rounded-full border border-[#334b39]/12 px-4 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-[#526557] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#eef1ea] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">Previous</button>
              <span aria-live="polite" className="min-w-14 text-center font-montserrat text-[8px] font-semibold text-[#667168]">Page {currentPage} / {pageCount}</span>
              <button type="button" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={currentPage >= pageCount} className="min-h-9 rounded-full border border-[#334b39]/12 px-4 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-[#526557] transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#eef1ea] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0">Next</button>
            </div>
          </div>
        </section>
      </div>
      {notice && <div role="status" className="fixed bottom-5 right-5 z-[80] max-w-sm rounded-2xl bg-[#29382b] px-5 py-4 font-montserrat text-[10px] text-white shadow-2xl">{notice}</div>}
    </main>
  );
}

function SummaryCard({ value, label, accent = false }: { value: number; label: string; accent?: boolean }) {
  return <article className={`rounded-2xl border p-4 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${accent ? "border-[#b89a6d]/20 bg-[#eee4d3]" : "border-[#334b39]/10 bg-white/75"}`}>
    <p className="font-seasons text-2xl leading-none text-[#334b38] sm:text-3xl">{value}</p>
    <p className="mt-2 font-montserrat text-[9px] font-semibold text-[#465349] sm:text-[10px]">{label}</p>
  </article>;
}

function EmptyReport({ message }: { message: string }) {
  return <p className="py-8 text-center font-montserrat text-[9px] text-[#92978f]">{message}</p>;
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    Pending: "bg-[#f3eadb] text-[#85683d]",
    Confirmed: "bg-[#e7efe5] text-[#4d6e54]",
    Completed: "bg-[#e3e9ed] text-[#4d6471]",
    Cancelled: "bg-[#eee9e6] text-[#776b65]",
    "No-show": "bg-[#f4e1df] text-[#8b4e49]",
    Other: "bg-[#ecece8] text-[#646b64]",
  };
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1.5 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] ${styles[status]}`}>{status}</span>;
}
