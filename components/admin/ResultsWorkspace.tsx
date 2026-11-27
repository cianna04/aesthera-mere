"use client";

import Image from "next/image";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { treatmentResults } from "@/data/results";

type ResultEntry = { id: string; title: string; view: string; before: string; after: string };
type FormState = Omit<ResultEntry, "id">;
const emptyForm: FormState = { title: "", view: "Front view", before: "", after: "" };

const initialEntries: ResultEntry[] = treatmentResults.flatMap((result) =>
  result.photos.map((photo, index) => ({
    id: `${result.id}-${index}`,
    title: result.title,
    view: photo.view,
    before: photo.before.src,
    after: photo.after.src,
  })),
);

function Icon({ children }: { children: React.ReactNode }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">{children}</svg>;
}

export default function ResultsWorkspace() {
  const [items, setItems] = useState(initialEntries);
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [notice, setNotice] = useState("");
  const [pendingDelete, setPendingDelete] = useState<ResultEntry | null>(null);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => !term || [item.title, item.view].some((value) => value.toLowerCase().includes(term)));
  }, [items, query]);

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setNotice("");
    setFormOpen(true);
  }

  function openEdit(item: ResultEntry) {
    setEditingId(item.id);
    setForm({ title: item.title, view: item.view, before: item.before, after: item.after });
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    setEditingId(null);
    setFormOpen(false);
    setForm(emptyForm);
    setNotice("");
  }

  function handleImage(side: "before" | "after", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      setForm((current) => ({ ...current, [side]: src }));
    };
    reader.readAsDataURL(file);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.title.trim() || !form.view.trim() || !form.before || !form.after) {
      setNotice("Treatment name, view, before photo and after photo are required.");
      return;
    }
    const message = editingId
      ? "Result updated."
      : "Result added.";
    if (editingId) {
      setItems((current) => current.map((item) => item.id === editingId ? { ...item, ...form } : item));
    } else {
      setItems((current) => [...current, { ...form, id: `result-${Date.now()}` }]);
    }
    closeForm();
    setNotice(message);
  }

  function removeResult() {
    if (!pendingDelete) return;
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    if (editingId === pendingDelete.id) closeForm();
    setPendingDelete(null);
    setNotice("Result removed.");
  }

  const resultForm = formOpen ? (
    <section className="rounded-[22px] border border-[#4C5534]/12 bg-[#fffefa] p-5 shadow-[0_10px_32px_rgba(51,75,57,0.055)] sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-[#4C5534]/12 pb-4">
        <div><p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#80755f]">{editingId ? "Edit result" : "New result"}</p><h2 className="mt-2 font-seasons text-2xl text-[#4C5534]">{editingId ? "Update result" : "Add a result"}</h2></div>
        <button type="button" onClick={closeForm} className="rounded-full border border-[#4C5534]/18 px-4 py-2 font-montserrat text-[9px] font-bold uppercase text-[#718071] transition-colors hover:bg-[#f4f1e8]">Close</button>
      </div>
      <form onSubmit={save} className="mt-6 grid gap-5 md:grid-cols-2">
        <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755f]">Treatment *</span><input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835e] focus:ring-2 focus:ring-[#71835e]/10" placeholder="e.g. Ultraformer MPT" /></label>
        <label className="block"><span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755f]">View / area *</span><input required value={form.view} onChange={(event) => setForm((current) => ({ ...current, view: event.target.value }))} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835e] focus:ring-2 focus:ring-[#71835e]/10" placeholder="e.g. Front view" /></label>
        {(["before", "after"] as const).map((side) => <div key={side} className="rounded-2xl border border-[#4C5534]/12 bg-[#F5F1E7] p-4">
          <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.12em] text-[#80755f]">{side} photo *</p>
          {form[side] && <div className="relative mt-3 aspect-[4/3] overflow-hidden rounded-xl bg-white"><Image src={form[side]} alt={`${side} result preview`} fill sizes="(max-width: 768px) 90vw, 40vw" className="object-contain" unoptimized /></div>}
          <input type="file" accept="image/*" onChange={(event) => handleImage(side, event)} className="mt-3 block w-full font-montserrat text-[10px] text-[#80755f] file:mr-3 file:rounded-full file:border-0 file:bg-[#4c5534] file:px-4 file:py-2 file:font-montserrat file:text-[9px] file:font-semibold file:text-white" />
        </div>)}
        <div className="md:col-span-2 flex justify-end border-t border-[#4C5534]/12 pt-4"><button type="submit" className="min-h-11 rounded-full bg-[#4c5534] px-6 font-montserrat text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#3d472a]">{editingId ? "Save changes" : "Add result"}</button></div>
      </form>
    </section>
  ) : null;

  return (
    <main className="min-h-screen bg-[#FFFCF3] px-5 pb-16 pt-7 text-[#4C5534] sm:px-8 lg:px-10 lg:pt-8">
      <div className="mx-auto max-w-[1460px]">
        <header className="mb-7 rounded-[22px] border border-[#80755F]/15 bg-[#F1EBDD] px-6 py-6 sm:px-8">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">Website management</p>
              <h1 className="mt-2 font-seasons text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-[#4C5534]">Results</h1>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <div><p className="font-seasons text-3xl leading-none text-[#4C5534]">{items.length.toString().padStart(2, "0")}</p><p className="mt-1.5 font-montserrat text-[8px] font-semibold uppercase tracking-[0.15em] text-[#80755F]">Comparisons</p></div>
              <div className="h-9 w-px bg-[#80755F]/25" />
              <div><p className="font-seasons text-3xl leading-none text-[#4C5534]">{new Set(items.map((item) => item.title)).size.toString().padStart(2, "0")}</p><p className="mt-1.5 font-montserrat text-[8px] font-semibold uppercase tracking-[0.15em] text-[#80755F]">Treatments</p></div>
              <button type="button" onClick={openAdd} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#4C5534] px-5 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#35452F]"><Icon><path d="M12 5v14M5 12h14" /></Icon> Add result</button>
            </div>
          </div>
        </header>

        <section>
          <div className="mb-5 flex justify-end">
            <label className="flex min-h-10 w-full items-center gap-2 rounded-full border border-[#80755F]/20 bg-[#F7F2E8] px-4 sm:max-w-[320px]">
              <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon>
              <span className="sr-only">Search results</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search treatment or view..." className="min-w-0 flex-1 bg-transparent font-montserrat text-[10px] outline-none" />
            </label>
          </div>

          {visible.length > 0 ? (
            <div className="grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((item) => <article key={item.id} className="overflow-hidden rounded-[22px] border border-[#80755F]/15 bg-[#F8F4EB] shadow-[0_12px_32px_-28px_rgba(35,54,40,0.55)] transition-shadow duration-200 hover:shadow-[0_18px_38px_-26px_rgba(35,54,40,0.45)]">
                <div className="bg-[#F1EBDD] p-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[{src:item.before,label:"Before"},{src:item.after,label:"After"}].map((photo) => <figure key={photo.label} className="min-w-0">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[#E8E4DC]"><Image src={photo.src} alt={photo.label + " " + item.title} fill sizes="(max-width: 768px) 45vw, 25vw" className="object-cover" unoptimized /></div>
                      <figcaption className="mt-2 text-center font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-[#69745F]">{photo.label}</figcaption>
                    </figure>)}
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-4">
                  <div className="min-w-0"><h2 className="truncate font-seasons text-xl text-[#4C5534]">{item.title}</h2><p className="mt-1 font-montserrat text-[9px] text-[#80755F]">{item.view}</p></div>
                  <div className="flex shrink-0 gap-2">
                    <button type="button" onClick={() => openEdit(item)} className="min-h-9 rounded-full border border-[#4C5534]/20 px-3.5 font-montserrat text-[8px] font-bold uppercase text-[#4C5534] transition-colors hover:bg-[#E8EEE3]">Edit</button>
                    <button type="button" onClick={() => setPendingDelete(item)} aria-label={"Remove " + item.title + " " + item.view} className="grid h-9 w-9 place-items-center rounded-full border border-[#8A5148]/20 text-[#8A5148] transition-colors hover:bg-[#F5E9E4]"><Icon><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></Icon></button>
                  </div>
                </div>
              </article>)}
            </div>
          ) : <div className="rounded-[22px] border border-dashed border-[#80755F]/25 bg-[#F8F4EB] px-6 py-16 text-center"><p className="font-seasons text-2xl text-[#4C5534]">No matching results</p><p className="mt-2 font-montserrat text-[10px] text-[#80755F]">Try another treatment name or view.</p></div>}
        </section>
      </div>

      {formOpen && resultForm && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#25291f]/55 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] shadow-2xl">
            {resultForm}
          </div>
        </div>
      )}

      {pendingDelete && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172119]/55 px-5 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}><section role="alertdialog" aria-modal="true" aria-labelledby="delete-result-title" className="w-full max-w-[420px] rounded-[24px] border border-[#80755F]/20 bg-[#FFFCF3] p-6 shadow-2xl"><p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A6653]">Confirm removal</p><h2 id="delete-result-title" className="mt-2 font-seasons text-2xl text-[#4C5534]">Remove this result?</h2><p className="mt-3 font-montserrat text-xs leading-6 text-[#80755F]">{pendingDelete.title} · {pendingDelete.view}</p><div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setPendingDelete(null)} className="min-h-10 rounded-full border border-[#4C5534]/20 px-5 font-montserrat text-[9px] font-semibold uppercase text-[#4C5534]">Cancel</button><button type="button" onClick={removeResult} className="min-h-10 rounded-full bg-[#8A5148] px-5 font-montserrat text-[9px] font-semibold uppercase text-white">Remove</button></div></section></div>}
      {notice && <div role="status" className="fixed bottom-5 right-5 z-[95] max-w-sm rounded-2xl border border-[#80755F]/15 bg-[#F7F2E8] px-5 py-4 font-montserrat text-[10px] leading-5 text-[#4F6442] shadow-xl">{notice}</div>}
    </main>
  );
}
