"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { ContentCategory, ContentEntry, ContentStatus } from "@/types/content";

type Props = { initialEntries: ContentEntry[] };
type FormState = Omit<ContentEntry, "id" | "updatedAt">;

const categories: ContentCategory[] = [
  "About Us",
  "FAQ",
  "Pre-Treatment Care",
  "Post-Treatment Care",
  "Blog Posts",
  "Privacy Policy",
  "Terms & Conditions",
  "Contact Details",
  "Clinic Hours",
];

const emptyForm: FormState = {
  category: "About Us",
  title: "",
  body: "",
  status: "draft",
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {children}
    </svg>
  );
}

function statusClass(status: ContentStatus) {
  return status === "published"
    ? "border-[#4C5534]/20 bg-[#E8EEE3] text-[#40543A]"
    : "border-[#B68D54]/25 bg-[#F8F0DF] text-[#8A6940]";
}

export default function ContentWorkspace({ initialEntries }: Props) {
  const [items, setItems] = useState(initialEntries);
  const [activeCategory, setActiveCategory] = useState<ContentCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [pendingDelete, setPendingDelete] = useState<ContentEntry | null>(null);
  const [notice, setNotice] = useState("");

  const counts = useMemo(() => ({
    total: items.length,
    published: items.filter((item) => item.status === "published").length,
    drafts: items.filter((item) => item.status === "draft").length,
    categories: new Set(items.map((item) => item.category)).size,
  }), [items]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      const categoryMatch = activeCategory === "All" || item.category === activeCategory;
      const textMatch = !term || [item.title, item.body, item.category].some((value) => value.toLowerCase().includes(term));
      return categoryMatch && textMatch;
    });
  }, [items, activeCategory, query]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openAdd(category: ContentCategory = activeCategory === "All" ? "About Us" : activeCategory) {
    setEditingId(null);
    setForm({ ...emptyForm, category });
    setFormOpen(true);
    setNotice("");
  }

  function openEdit(item: ContentEntry) {
    setEditingId(item.id);
    setForm({ category: item.category, title: item.title, body: item.body, status: item.status });
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
    if (!form.title.trim() || !form.body.trim()) {
      setNotice("A title and content are required.");
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) =>
        item.id === editingId ? { ...item, ...form, title: form.title.trim(), body: form.body.trim() } : item
      ));
    } else {
      setItems((current) => [...current, {
        ...form,
        id: `content-${Date.now()}`,
        title: form.title.trim(),
        body: form.body.trim(),
        updatedAt: "Just now",
      }]);
    }

    closeForm();
    setNotice("Content entry updated.");
  }

  function setStatus(item: ContentEntry, status: ContentStatus) {
    setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status } : entry));
    setNotice(status === "published"
      ? "Page status set to Published in the workspace."
      : "Page status set to Draft.");
  }

  function remove() {
    if (!pendingDelete) return;
    setItems((current) => current.filter((item) => item.id !== pendingDelete.id));
    setPendingDelete(null);
    setNotice("Content entry removed.");
  }

  const formPanel = formOpen ? (
    <section className="rounded-[22px] border border-[#4C5534]/12 bg-[#FFFEFA] p-5 shadow-[0_10px_32px_rgba(51,75,57,0.055)] sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-[#4C5534]/12 pb-4">
        <div>
          <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#80755F]">{editingId ? "Edit content" : "New content"}</p>
          <h2 className="mt-2 font-seasons text-2xl text-[#4C5534]">{editingId ? "Update website content" : "Add website content"}</h2>
        </div>
        <button type="button" onClick={closeForm} className="min-h-9 rounded-full border border-[#4C5534]/20 px-4 font-montserrat text-[9px] font-bold uppercase text-[#718071] transition-colors hover:bg-[#F4F1E8]">Close</button>
      </div>

      <form onSubmit={save} className="mt-6 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Content section *</span>
            <select value={form.category} onChange={(event) => update("category", event.target.value as ContentCategory)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]">
              {categories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Publishing status</span>
            <select value={form.status} onChange={(event) => update("status", event.target.value as ContentStatus)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Title *</span>
          <input required value={form.title} onChange={(event) => update("title", event.target.value)} className="min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs outline-none focus:border-[#71835E]" placeholder="Enter a page title or FAQ question" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-montserrat text-[9px] font-semibold uppercase text-[#80755F]">Content *</span>
          <textarea required rows={9} value={form.body} onChange={(event) => update("body", event.target.value)} className="w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 py-3 font-montserrat text-xs leading-6 outline-none focus:border-[#71835E]" placeholder="Enter the approved website content..." />
        </label>
        <div className="flex justify-end border-t border-[#4C5534]/12 pt-4">
          <button type="submit" className="min-h-11 rounded-full bg-[#4C5534] px-6 font-montserrat text-[10px] font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-[#35452F]">{editingId ? "Save changes" : "Add content"}</button>
        </div>
      </form>
    </section>
  ) : null;


  return (
    <main className="min-h-screen bg-[#FFFCF3] px-5 pb-16 pt-7 text-[#4C5534] sm:px-8 lg:px-10 lg:pt-8">
      <div className="mx-auto max-w-[1460px]">
        <header className="rounded-[22px] border border-[#80755F]/15 bg-[#F1EBDD] px-6 py-6 sm:px-8">
          <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">Website management</p>
          <h1 className="mt-2 font-seasons text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-[#4C5534]">Content</h1>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Content summary">
          {[
            { label: "Total entries", value: counts.total },
            { label: "Published", value: counts.published },
            { label: "Drafts", value: counts.drafts },
            { label: "Content sections", value: counts.categories },
          ].map((stat) => (
            <article key={stat.label} className="rounded-[18px] border border-[#80755F]/15 bg-[#F7F2E8] px-5 py-4">
              <p className="font-seasons text-3xl text-[#4C5534]">{stat.value.toString().padStart(2, "0")}</p>
              <p className="mt-1 font-montserrat text-[9px] font-semibold uppercase tracking-wide text-[#80755F]">{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#80755F]/15 bg-[#F3F0E6]">
          <div className="grid gap-3 border-b border-[#334b39]/10 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div>
              <h2 className="font-seasons text-2xl text-[#4C5534]">Website content</h2>
              <p className="mt-1 font-montserrat text-[9px] text-[#80755F]">Choose a section, then edit the content shown on the website.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#80755F]/20 bg-[#F8F4EB] px-3 sm:w-[280px]">
                <Icon><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon>
                <span className="sr-only">Search content</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search content..." className="min-w-0 flex-1 bg-transparent font-montserrat text-[10px] outline-none" />
              </label>
              <button type="button" onClick={() => openAdd()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4C5534] px-5 font-montserrat text-[9px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#35452F]">
                <Icon><path d="M12 5v14M5 12h14" /></Icon> {activeCategory === "All" ? "Add content" : `Add ${activeCategory === "FAQ" ? "FAQ" : activeCategory}`}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="border-b border-[#334b39]/10 bg-[#F8F4EB] p-3 lg:border-b-0 lg:border-r">
              <div className="px-3 pb-2 pt-1">
                <p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.16em] text-[#80755F]">Content sections</p>
              </div>
              <nav aria-label="Filter content by section" className="flex gap-1.5 overflow-x-auto lg:flex-col lg:overflow-visible">
                <button type="button" onClick={() => setActiveCategory("All")} aria-pressed={activeCategory === "All"} className={`flex min-h-10 shrink-0 items-center justify-between gap-3 rounded-xl px-3 text-left font-montserrat text-[9px] font-semibold transition-colors lg:w-full ${activeCategory === "All" ? "bg-[#E8EEE3] text-[#40543A]" : "text-[#687260] hover:bg-[#F1EBDD]"}`}>
                  <span>All content</span>
                  <span className="rounded-full bg-white/80 px-2 py-1 text-[8px]">{items.length}</span>
                </button>
                {categories.map((category) => {
                  const count = items.filter((item) => item.category === category).length;
                  return (
                    <button key={category} type="button" onClick={() => setActiveCategory(category)} aria-pressed={activeCategory === category} className={`flex min-h-10 shrink-0 items-center justify-between gap-3 rounded-xl px-3 text-left font-montserrat text-[9px] font-semibold transition-colors lg:w-full ${activeCategory === category ? "bg-[#E8EEE3] text-[#40543A]" : "text-[#687260] hover:bg-[#F1EBDD]"}`}>
                      <span className="truncate">{category}</span>
                      <span className="rounded-full bg-white/80 px-2 py-1 text-[8px]">{count}</span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="min-w-0 p-4 sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.15em] text-[#80755F]">Showing section</p>
                  <h3 className="mt-1 font-seasons text-xl text-[#4C5534]">{activeCategory === "All" ? "All content" : activeCategory}</h3>
                </div>
                <p className="font-montserrat text-[9px] text-[#80755F]">{visible.length} {visible.length === 1 ? "entry" : "entries"}</p>
              </div>

              {visible.length ? (
                <div className="overflow-hidden rounded-[18px] border border-[#80755F]/15 bg-[#FFFCF3]">
                  {visible.map((item, index) => (
                    <article key={item.id} className={`p-4 sm:p-5 ${index > 0 ? "border-t border-[#80755F]/12" : ""}`}>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-montserrat text-[8px] font-bold uppercase tracking-[0.13em] text-[#80755F]">{item.category}</span>
                            <span className={`rounded-full border px-2.5 py-1 font-montserrat text-[7px] font-bold uppercase tracking-[0.08em] ${statusClass(item.status)}`}>{item.status}</span>
                          </div>
                          <h4 className="mt-2 font-seasons text-xl leading-tight text-[#4C5534]">{item.title}</h4>
                          <p className="mt-2 line-clamp-3 whitespace-pre-line font-montserrat text-[10px] leading-6 text-[#687260]">{item.body}</p>
                          <p className="mt-3 font-montserrat text-[8px] text-[#80755F]">Updated: {item.updatedAt}</p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                          <button type="button" onClick={() => openEdit(item)} className="min-h-9 rounded-full border border-[#4C5534]/20 px-4 font-montserrat text-[8px] font-bold uppercase text-[#4C5534] transition-colors hover:bg-[#E8EEE3]">Edit</button>
                          {item.status === "published" ? (
                            <button type="button" onClick={() => setStatus(item, "draft")} className="min-h-9 rounded-full border border-[#80755F]/20 px-4 font-montserrat text-[8px] font-bold uppercase text-[#80755F] transition-colors hover:bg-[#F1EBDD]">Move to draft</button>
                          ) : (
                            <button type="button" onClick={() => setStatus(item, "published")} className="min-h-9 rounded-full bg-[#4C5534] px-4 font-montserrat text-[8px] font-bold uppercase text-white transition-colors hover:bg-[#35452F]">Publish</button>
                          )}
                          <button type="button" onClick={() => setPendingDelete(item)} aria-label={`Delete content: ${item.title}`} className="grid h-9 w-9 place-items-center rounded-full border border-[#8A5148]/20 text-[#8A5148] transition-colors hover:bg-[#F5E9E4]">
                            <Icon><path d="M4 7h16M10 11v6M14 11v6M5 7l1 14h12l1-14M9 7V4h6v3" /></Icon>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-[18px] border border-dashed border-[#80755F]/25 bg-[#F8F4EB] px-6 py-16 text-center">
                  <p className="font-seasons text-2xl text-[#4C5534]">No content found</p>
                  <p className="mt-2 font-montserrat text-[10px] text-[#80755F]">Try another section or search term.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {formOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-[#25291f]/55 px-4 py-6 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="max-h-[92vh] w-full max-w-[760px] overflow-y-auto rounded-[24px] shadow-2xl">{formPanel}</div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#172119]/55 px-5 py-8 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setPendingDelete(null); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="delete-content-title" className="w-full max-w-[420px] rounded-[24px] border border-[#80755F]/20 bg-[#FFFCF3] p-6 shadow-2xl">
            <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8A5148]">Confirm removal</p>
            <h2 id="delete-content-title" className="mt-2 font-seasons text-2xl text-[#4C5534]">Delete this content?</h2>
            <p className="mt-3 font-montserrat text-xs leading-6 text-[#80755F]">Remove “{pendingDelete.title}” from the content list?</p>
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
