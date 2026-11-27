"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

type Role = "Owner or admin" | "Front desk" | "Marketing";
type Staff = { id: string; name: string; email: string; role: Role; active: boolean };
const key = "aesthera-admin-staff-v1";
const roles: { name: Role; detail: string }[] = [
  { name: "Owner or admin", detail: "Clinic operations, website content, reports, staff, and settings." },
  { name: "Front desk", detail: "Appointments, calendar, patients, and daily clinic coordination." },
  { name: "Marketing", detail: "Promotions, treatments, results, testimonials, and site content." },
];
const blank: Omit<Staff, "id" | "active"> = { name: "", email: "", role: "Front desk" };
const field = "min-h-11 w-full rounded-xl border border-[#334b39]/15 bg-[#faf9f5] px-3.5 font-montserrat text-xs text-[#354239] outline-none focus:border-[#344b38]/40 focus:ring-2 focus:ring-[#344b38]/10";

function validStaff(value: unknown): value is Staff {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.name === "string" && typeof item.email === "string" &&
    roles.some((role) => role.name === item.role) && typeof item.active === "boolean";
}

export default function UsersWorkspace() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All staff");
  const [editing, setEditing] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(blank);
  const [pending, setPending] = useState<Staff | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (Array.isArray(parsed)) setStaff(parsed.filter(validStaff));
        }
      } catch { setNotice("Staff records could not be loaded."); }
      setLoaded(true);
    });
  }, []);

  const visible = useMemo(() => staff.filter((person) =>
    (filter === "All staff" || (filter === "Active" ? person.active : !person.active)) &&
    (!query.trim() || `${person.name} ${person.email} ${person.role}`.toLowerCase().includes(query.trim().toLowerCase()))
  ), [staff, filter, query]);

  function persist(next: Staff[], message: string) {
    try { localStorage.setItem(key, JSON.stringify(next)); }
    catch { setNotice("Changes could not be saved in this browser."); return; }
    setStaff(next);
    setNotice(message);
  }

  function beginAdd() { setEditing(null); setForm(blank); setNotice(""); setOpen(true); }
  function beginEdit(person: Staff) { setEditing(person.id); setForm({ name: person.name, email: person.email, role: person.role }); setNotice(""); setOpen(true); }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    if (staff.some((person) => person.email.toLowerCase() === email && person.id !== editing)) { setNotice("That email already belongs to a staff member."); return; }
    const current = staff.find((person) => person.id === editing);
    if (current?.active && current.role === "Owner or admin" && form.role !== "Owner or admin" && staff.filter((person) => person.active && person.role === "Owner or admin").length === 1) { setNotice("Keep at least one active owner or admin."); return; }
    const next = editing
      ? staff.map((person) => person.id === editing ? { ...person, name, email, role: form.role } : person)
      : [...staff, { id: crypto.randomUUID(), name, email, role: form.role, active: true }];
    persist(next, editing ? "Staff details updated." : "Staff member added.");
    setOpen(false);
  }

  function changeStatus() {
    if (!pending) return;
    if (pending.active && pending.role === "Owner or admin" && staff.filter((person) => person.active && person.role === "Owner or admin").length === 1) { setNotice("Keep at least one active owner or admin."); setPending(null); return; }
    persist(staff.map((person) => person.id === pending.id ? { ...person, active: !person.active } : person), pending.active ? "Staff account deactivated." : "Staff account reactivated.");
    setPending(null);
  }

  return <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10"><div className="mx-auto max-w-[1460px]">
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">Administration</p><h1 className="font-seasons mt-3 text-[clamp(2.4rem,4vw,3.7rem)] leading-none text-[#2e4433]">Users &amp; roles</h1><p className="mt-3 max-w-xl font-montserrat text-[11px] leading-6 text-[#778078]">Organize staff access across clinic operations and website content.</p></div><button type="button" onClick={beginAdd} className="min-h-11 rounded-full bg-[#344c38] px-6 font-montserrat text-[10px] font-bold uppercase tracking-[0.1em] text-white">Add staff</button></header>
    <section aria-label="Staff summary" className="mt-8 grid gap-3 sm:grid-cols-3">{[["Staff members", staff.length], ["Active accounts", staff.filter((person) => person.active).length], ["Inactive accounts", staff.filter((person) => !person.active).length]].map(([label, value]) => <div key={label} className="rounded-[22px] border border-[#334b39]/10 bg-white/75 p-5"><p className="font-seasons text-3xl text-[#2e4433]">{value}</p><p className="mt-2 font-montserrat text-[10px] font-semibold text-[#667068]">{label}</p></div>)}</section>
    <section className="mt-5 rounded-[24px] border border-[#334b39]/10 bg-white/80 shadow-[0_14px_38px_-30px_rgba(35,54,40,0.45)]"><div className="flex flex-col gap-4 border-b border-[#334b39]/10 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-seasons text-2xl text-[#2e4433]">Staff directory</h2><p className="mt-1 font-montserrat text-[10px] text-[#858d85]">Manage each person’s role and account status.</p></div><div className="flex gap-2"><input aria-label="Search staff" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff" className={field} /><select aria-label="Filter staff" value={filter} onChange={(event) => setFilter(event.target.value)} className={`${field} max-w-32`}><option>All staff</option><option>Active</option><option>Inactive</option></select></div></div>
      <div className="divide-y divide-[#334b39]/8">{loaded && visible.map((person) => <div key={person.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#e4ebe1] font-seasons text-lg text-[#405b45]">{person.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div className="min-w-0"><p className="truncate font-montserrat text-xs font-semibold text-[#354239]">{person.name}</p><p className="mt-1 truncate font-montserrat text-[10px] text-[#8b918b]">{person.email}</p></div></div><div className="flex flex-wrap items-center gap-2 sm:justify-end"><span className="rounded-full bg-[#e9eee7] px-3 py-1.5 font-montserrat text-[9px] font-semibold text-[#45614a]">{person.role}</span><span className={`rounded-full px-3 py-1.5 font-montserrat text-[9px] font-semibold ${person.active ? "bg-[#e3efe2] text-[#4d7453]" : "bg-[#eee9e4] text-[#7d7167]"}`}>{person.active ? "Active" : "Inactive"}</span><button type="button" onClick={() => beginEdit(person)} className="min-h-9 rounded-full border border-[#334b39]/15 px-3 font-montserrat text-[9px] font-bold text-[#405745]">Edit</button><button type="button" onClick={() => setPending(person)} className="min-h-9 rounded-full border border-[#334b39]/15 px-3 font-montserrat text-[9px] font-bold text-[#667068]">{person.active ? "Deactivate" : "Reactivate"}</button></div></div>)}{loaded && !visible.length && <div className="p-12 text-center"><p className="font-seasons text-2xl text-[#405745]">{staff.length ? "No matching staff" : "No staff added yet"}</p><p className="mt-2 font-montserrat text-[10px] text-[#899089]">{staff.length ? "Try a different search or filter." : "Add a staff member to build your team directory."}</p></div>}</div>
    </section>
    <section className="mt-5"><h2 className="font-seasons text-2xl text-[#2e4433]">Role access</h2><div className="mt-3 grid gap-3 lg:grid-cols-3">{roles.map((role) => <article key={role.name} className="rounded-[22px] border border-[#334b39]/10 bg-[#f8f7f2] p-5"><h3 className="font-montserrat text-[11px] font-bold text-[#405745]">{role.name}</h3><p className="mt-2 font-montserrat text-[10px] leading-5 text-[#7a837a]">{role.detail}</p></article>)}</div></section>
    {notice && <p role="status" className="mt-4 rounded-xl bg-[#e8eee6] px-4 py-3 font-montserrat text-[10px] text-[#405745]">{notice}</p>}
  </div>
  {open && <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit staff" : "Add staff"}><button type="button" aria-label="Close staff form" onClick={() => setOpen(false)} className="fixed inset-0 bg-[#172119]/55 backdrop-blur-sm" /><section className="relative w-full max-w-lg rounded-[28px] bg-[#fbfaf6] p-6 shadow-2xl sm:p-7"><div className="flex items-center justify-between"><h2 className="font-seasons text-3xl text-[#334b38]">{editing ? "Edit staff" : "Add staff"}</h2><button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full bg-[#edf0e9]">×</button></div><form onSubmit={save} className="mt-6 space-y-4"><label className="block font-montserrat text-[10px] font-semibold text-[#536057]">Full name<input required autoFocus value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className={`${field} mt-2`} /></label><label className="block font-montserrat text-[10px] font-semibold text-[#536057]">Email address<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={`${field} mt-2`} /></label><label className="block font-montserrat text-[10px] font-semibold text-[#536057]">Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as Role })} className={`${field} mt-2`}>{roles.map((role) => <option key={role.name}>{role.name}</option>)}</select></label><div className="flex justify-end gap-2 border-t border-[#334b39]/10 pt-4"><button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full border border-[#334b39]/15 px-5 font-montserrat text-[9px] font-bold uppercase text-[#536057]">Discard</button><button type="submit" className="min-h-11 rounded-full bg-[#344c38] px-6 font-montserrat text-[9px] font-bold uppercase text-white">{editing ? "Save changes" : "Add staff"}</button></div></form></section></div>}
  {pending && <div className="fixed inset-0 z-[70] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label="Change staff status"><div className="absolute inset-0 bg-[#172119]/55 backdrop-blur-sm" /><section className="relative w-full max-w-md rounded-[26px] bg-[#fbfaf6] p-6 shadow-2xl"><h2 className="font-seasons text-2xl text-[#334b38]">{pending.active ? "Deactivate" : "Reactivate"} {pending.name}?</h2><p className="mt-3 font-montserrat text-[11px] leading-6 text-[#667068]">{pending.active ? "This person will be marked inactive in the staff directory." : "This person will be marked active again."}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setPending(null)} className="min-h-10 rounded-full border border-[#334b39]/15 px-5 font-montserrat text-[9px] font-bold uppercase">Keep as is</button><button type="button" onClick={changeStatus} className="min-h-10 rounded-full bg-[#344c38] px-5 font-montserrat text-[9px] font-bold uppercase text-white">Confirm</button></div></section></div>}
  </main>;
}
