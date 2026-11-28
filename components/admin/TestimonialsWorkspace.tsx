"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { TestimonialRecord, TestimonialSource, TestimonialStatus } from "@/types/testimonial";

type Props = { initialTestimonials: TestimonialRecord[] };
type FormState = Omit<TestimonialRecord, "id">;

const emptyForm: FormState = {
  quote: "",
  name: "",
  detail: "Client Review",
  treatment: "",
  source: "Not recorded",
  permissionDate: "",
  permissionReference: "",
  status: "pending",
  isFeatured: false,
  isLegacy: false,
};

const sources: TestimonialSource[] = [
  "Google",
  "Facebook",
  "Instagram",
  "Direct feedback",
  "Other",
  "Not recorded",
];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {children}
    </svg>
  );
}

function statusLabel(item: TestimonialRecord) {
  if (item.status === "approved") return "Approved";
  if (item.status === "hidden") return "Hidden";
  return item.isLegacy ? "Existing · verify permission" : "Pending review";
}

function statusClass(status: TestimonialStatus) {
  if (status === "approved") return "border-[#4C5534]/20 bg-[#E8EEE3] text-[#40543A]";
  if (status === "hidden") return "border-[#80755F]/20 bg-[#F1EBDD] text-[#80755F]";
  return "border-[#B68D54]/25 bg-[#F8F0DF] text-[#8A6940]";
}

function hasPermissionRecord(item: Pick<TestimonialRecord, "permissionDate" | "permissionReference">) {
  return Boolean(item.permissionDate && item.permissionReference.trim());
}

export default function TestimonialsWorkspace({ initialTestimonials }: Props) {
  const [items, setItems] = useState(initialTestimonials);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TestimonialStatus>("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<TestimonialRecord | null>(null);
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    hidden: items.filter((item) => item.status === "hidden").length,
  }), [items]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch = !term || [
        item.name,
        item.quote,
        item.treatment,
        item.source,
      ].some((value) => value.toLowerCase().includes(term));
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, query, statusFilter]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
    setNotice("");
  }

  function openEdit(item: TestimonialRecord) {
    setEditingId(item.id);
    setForm({
      quote: item.quote,
      name: item.name,
      detail: item.detail,
      rating: item.rating,
      treatment: item.treatment,
      source: item.source,
      permissionDate: item.permissionDate,
      permissionReference: item.permissionReference,
      status: item.status,
      isFeatured: item.isFeatured,
      isLegacy: item.isLegacy,
    });
    setFormOpen(true);
    setNotice("");
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim() || !form.quote.trim() || !form.treatment.trim()) {
      setNotice("Display name, review text and treatment are required.");
      return;
    }

    const nextForm: FormState = {
      ...form,
      name: form.name.trim(),
      quote: form.quote.trim(),
      treatment: form.treatment.trim(),
      permissionReference: form.permissionReference.trim(),
      status: hasPermissionRecord(form) ? form.status : "pending",
    };

    if (editingId) {
      setItems((current) => current.map((item) =>
        item.id === editingId ? { ...item, ...nextForm } : item
      ));
    } else {
      setItems((current) => [
        ...current,
        { ...nextForm, id: `testimonial-${Date.now()}` },
      ]);
    }

    closeForm();
    setNotice("Testimonial updated.");
  }

  function approve(item: TestimonialRecord) {
    if (!hasPermissionRecord(item)) {
      setNotice("Approval is blocked. Add the consent date and secure consent-record reference first.");
      return;
    }
    setItems((current) => current.map((entry) =>
      entry.id === item.id ? { ...entry, status: "approved" } : entry
    ));
    setNotice("Testimonial approved.");
  }

  function hide(item: TestimonialRecord) {
    setItems((current) => current.map((entry) =>
      entry.id === item.id ? { ...entry, status: "hidden" } : entry
    ));
    setNotice("Testimonial marked as hidden.");
  }

  function restore(item: TestimonialRecord) {
    setItems((current) => current.map((entry) =>
      entry.id === item.id ? { ...entry, status: "pending" } : entry
    ));
    setNotice("Testimonial moved back to pending review.");
  }

  function remove() {
    if (!pendingDelete) return;
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    setNotice("Testimonial removed.");
  }

  const formPanel = formOpen ? (
    <section className="rounded-[22px] border border-[#4C5534]/12 bg-[#FFFEFA] p-5 shadow-[0_10px_32px_rgba(51,75,57,0.055)] sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-[#4C5534]/12 pb-4">
        <div>
          <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#80755F]">{editingId ? "Edit testimonial" : "New testimonial"}</p>
          <h2 className="mt-2 font-seasons text-2xl text-[#4C5534]">{editingId ? "Update patient feedback" : "Add patient feedback"}</h2>
        </div>
        <button type="button" onClick={closeForm} className="min-h-9 rounded-full border border-[#4C5534]/20 px-4 font-montserrat text-[9px] font-bold uppercase text-[#718071] transition-colors hover:bg-[#F4F1E8]">Close</button>
      </div>

      <form onSubmit={save} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Patient display name *</span>
          <input required value={form.name} onChange={(event) => update("name", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]" placeholder="Name shown on the website" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Treatment *</span>
          <input required value={form.treatment} onChange={(event) => update("treatment", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]" placeholder="Treatment associated with this review" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Review source</span>
          <select value={form.source} onChange={(event) => update("source", event.target.value as TestimonialSource)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]">
            {sources.map((source) => <option key={source} value={source}>{source}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Rating (optional, 1–5)</span>
          <select value={form.rating ?? ""} onChange={(event) => update("rating", event.target.value ? Number(event.target.value) : undefined)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]">
            <option value="">Not provided</option>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
          </select>
        </label>
        <label className="block md:col-span-2">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Review text *</span>
          <textarea required rows={4} value={form.quote} onChange={(event) => update("quote", event.target.value)} className="w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 py-3 font-montserrat text-xs leading-6 outline-none focus:border-[#71835E]" placeholder="Enter the patient's feedback exactly as provided." />
        </label>

        <div className="rounded-2xl border border-[#B68D54]/25 bg-[#F8F3E8] p-4 md:col-span-2">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-[#8A6940]"><Icon><path d="M12 3 4 6v5c0 5 3.4 8.2 8 10 4.6-1.8 8-5 8-10V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></Icon></span>
            <div>
              <p className="font-montserrat text-[10px] font-bold uppercase tracking-[0.12em] text-[#765B37]">Patient permission record</p>
              <p className="mt-1 font-montserrat text-[10px] leading-5 text-[#806D52]">Record permission only when the clinic has verified it. Use a secure reference to the signed consent record; do not enter sensitive patient details here.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#765B37]">Permission date</span>
              <input type="date" value={form.permissionDate} onChange={(event) => update("permissionDate", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#B68D54]/25 bg-white px-3 font-montserrat text-xs outline-none focus:border-[#9B7A4D]" />
            </label>
            <label className="block">
              <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#765B37]">Secure consent record reference</span>
              <input value={form.permissionReference} onChange={(event) => update("permissionReference", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#B68D54]/25 bg-white px-3 font-montserrat text-xs outline-none focus:border-[#9B7A4D]" placeholder="e.g. consent record ID" />
            </label>
          </div>
          <p className="mt-2 font-montserrat text-[9px] text-[#806D52]">{hasPermissionRecord(form) ? "Permission details entered. Approval still requires a separate staff action." : "A date and record reference are both required before approval can be marked."}</p>
        </div>

        <label className="flex min-h-11 items-center gap-3 rounded-xl border border-[#4C5534]/15 bg-[#F8F4EB] px-4 md:col-span-2">
          <input type="checkbox" checked={form.isFeatured} onChange={(event) => update("isFeatured", event.target.checked)} className="h-4 w-4 accent-[#4C5534]" />
          <span className="font-montserrat text-[10px] font-semibold text-[#4C5534]">Feature this testimonial on the homepage (after approval)</span>
        </label>

        <div className="flex justify-end border-t border-[#4C5534]/12 pt-4 md:col-span-2">
          <button type="submit" className="min-h-11 rounded-full bg-[#4C5534] px-6 font-montserrat text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#35452F]">{editingId ? "Save changes" : "Add testimonial"}</button>
        </div>
      </form>
    </section>
  ) : null;

  return (
    <main className="min-h-screen bg-[#FFFCF3] pb-16 text-[#4C5534]">
      <header className="border-b border-[#80755F]/15 bg-[#F1EBDD] px-6 py-7 md:px-10">
        <div className="mx-auto flex max-w-[1280px] flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">Website management</p>
            <h1 className="mt-2 font-seasons text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-[#4C5534]">Testimonials</h1>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1280px] px-6 pt-7 md:px-10">
        <section className="mb-6 grid grid-cols-4 gap-3">
          {[
            { label: "Total entries", value: counts.total },
            { label: "Needs review", value: counts.pending },
            { label: "Approved", value: counts.approved },
            { label: "Hidden", value: counts.hidden },
          ].map((stat) => (
            <article key={stat.label} className="rounded-[20px] border border-[#334b39]/10 bg-white/75 p-5">
              <p className="font-seasons text-3xl text-[#4c5534]">{stat.value}</p>
              <p className="mt-2 font-montserrat text-[10px] font-semibold text-[#80755f]">{stat.label}</p>
            </article>
          ))}
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {([
                ["all", "All"],
                ["pending", "Needs review"],
                ["approved", "Approved"],
                ["hidden", "Hidden"],
              ] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setStatusFilter(value)} aria-pressed={statusFilter === value} className={`min-h-9 rounded-full border px-4 font-montserrat text-[9px] font-semibold uppercase tracking-[0.08em] transition-colors ${statusFilter === value ? "border-[#4C5534] bg-[#4C5534] text-white" : "border-[#80755F]/20 bg-white text-[#80755F] hover:bg-[#F1EBDD]"}`}>{label}</button>
              ))}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <label className="flex min-h-10 w-full items-center gap-2 rounded-full border border-[#80755F]/20 bg-[#F7F2E8] px-4 sm:w-[300px]">
                <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon>
                <span className="sr-only">Search testimonials</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, treatment or review..." className="min-w-0 flex-1 bg-transparent font-montserrat text-[10px] outline-none" />
              </label>
              <button type="button" onClick={openAdd} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#4C5534] px-5 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#35452F]">
                <Icon><path d="M12 5v14M5 12h14" /></Icon> Add testimonial
              </button>
            </div>
          </div>

          {visible.length ? (
            <div className="grid items-start gap-4 xl:grid-cols-2">
              {visible.map((item) => (
                <article key={item.id} className="rounded-[20px] border border-[#80755F]/15 bg-white p-5 shadow-[0_12px_32px_-28px_rgba(35,54,40,0.55)] sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-seasons text-xl text-[#4C5534]">{item.name}</h2>
                      <p className="mt-1 font-montserrat text-[9px] text-[#80755F]">{item.treatment} · {item.source}</p>
                    </div>
                    <span className={`rounded-full border px-3 py-1.5 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] ${statusClass(item.status)}`}>{statusLabel(item)}</span>
                  </div>
                  <blockquote className="mt-4 border-l-2 border-[#B59A67]/60 pl-4 font-montserrat text-[11px] leading-6 text-[#5F695A]">“{item.quote}”</blockquote>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#80755F]/12 pt-3">
                    <div>
                      <p className="font-montserrat text-[9px] font-semibold text-[#4C5534]">{hasPermissionRecord(item) ? "Permission record entered" : "Permission not recorded"}</p>
                      <p className="mt-1 font-montserrat text-[8px] text-[#80755F]">{item.permissionDate || "No date"}{item.permissionReference ? ` · Ref: ${item.permissionReference}` : ""}</p>
                    </div>
                    {item.isFeatured && <span className="rounded-full bg-[#F1EBDD] px-3 py-1.5 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] text-[#806D52]">Featured</span>}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
                    <button type="button" onClick={() => openEdit(item)} className="min-h-9 rounded-full border border-[#4C5534]/20 px-4 font-montserrat text-[8px] font-bold uppercase text-[#4C5534] transition-colors hover:bg-[#E8EEE3]">Edit</button>
                    {item.status === "approved" ? (
                      <button type="button" onClick={() => hide(item)} className="min-h-9 rounded-full border border-[#80755F]/20 px-4 font-montserrat text-[8px] font-bold uppercase text-[#80755F] transition-colors hover:bg-[#F1EBDD]">Hide</button>
                    ) : item.status === "hidden" ? (
                      <button type="button" onClick={() => restore(item)} className="min-h-9 rounded-full border border-[#80755F]/20 px-4 font-montserrat text-[8px] font-bold uppercase text-[#80755F] transition-colors hover:bg-[#F1EBDD]">Return to review</button>
                    ) : (
                      <button type="button" disabled={!hasPermissionRecord(item)} onClick={() => approve(item)} title={!hasPermissionRecord(item) ? "Cannot approve yet: add the verified permission date and secure consent record reference first." : "Approve testimonial"} aria-label={!hasPermissionRecord(item) ? "Approve unavailable: patient permission record is missing" : "Approve testimonial"} className="min-h-9 rounded-full bg-[#4C5534] px-4 font-montserrat text-[8px] font-bold uppercase text-white transition-colors hover:bg-[#35452F] disabled:cursor-not-allowed disabled:bg-[#A9AD9E] disabled:text-white/90 disabled:hover:bg-[#A9AD9E]">Approve</button>
                    )}
                    <button type="button" onClick={() => setPendingDelete(item)} aria-label={`Delete testimonial from ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-[#8A5148]/20 text-[#8A5148] transition-colors hover:bg-[#F5E9E4]">
                      <Icon><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></Icon>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-[#80755F]/25 bg-[#F8F4EB] px-6 py-16 text-center">
              <p className="font-seasons text-2xl text-[#4C5534]">No testimonials found</p>
              <p className="mt-2 font-montserrat text-[10px] text-[#80755F]">Try another search or add a testimonial.</p>
            </div>
          )}
        </section>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#25291f]/55 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] shadow-2xl">{formPanel}</div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172119]/55 px-5 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-testimonial-title" className="w-full max-w-[420px] rounded-[24px] border border-[#80755F]/20 bg-[#FFFCF3] p-6 shadow-2xl">
            <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A5148]">Confirm removal</p>
            <h2 id="delete-testimonial-title" className="mt-2 font-seasons text-2xl text-[#4C5534]">Delete this testimonial?</h2>
            <p className="mt-3 font-montserrat text-xs leading-6 text-[#80755F]">This removes {pendingDelete.name} from the testimonials list.</p>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setPendingDelete(null)} className="min-h-10 rounded-full border border-[#4C5534]/20 px-5 font-montserrat text-[9px] font-semibold uppercase text-[#4C5534]">Cancel</button>
              <button type="button" onClick={remove} className="min-h-10 rounded-full bg-[#8A5148] px-5 font-montserrat text-[9px] font-semibold uppercase text-white">Delete</button>
            </div>
          </section>
        </div>
      )}

      {notice && <div role="status" className="fixed bottom-5 right-5 z-[95] max-w-sm rounded-2xl border border-[#80755F]/15 bg-[#F7F2E8] px-5 py-4 font-montserrat text-[10px] leading-5 text-[#4F6442] shadow-xl">{notice}</div>}
    </main>
  );
}
