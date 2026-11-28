"use client";

import { useMemo, useState } from "react";
import BookingTrigger from "@/components/BookingTrigger";
import { FAQ_CATEGORIES, FAQ_ITEMS, type FAQCategory } from "./faqData";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className="h-5 w-5">
      <circle cx="10.8" cy="10.8" r="6.8" />
      <path d="m16 16 4.2 4.2" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FAQContent() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory | "All">("All");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(FAQ_ITEMS[0]?.id ?? null);

  const visibleFAQs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.category === activeCategory;
      const matchesSearch =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  function chooseCategory(category: FAQCategory | "All") {
    setActiveCategory(category);
    setOpenId(null);
  }

  return (
    <>
      <section className="border-b border-[#80755F]/15 px-6 py-10 md:px-10 md:py-12">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#80755F]">
              Aesthera Mère · Help Centre
            </p>
            <h1 className="font-seasons mt-2 text-[clamp(2.4rem,5vw,4rem)] leading-none text-[#4C5534]">
              What you need to know.
            </h1>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1280px] gap-10 px-6 py-12 md:px-10 md:py-16 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
        <aside className="space-y-7">
          <div>
            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#80755F]">
              Find an answer
            </p>
            <h2 className="font-seasons mt-2 text-3xl text-[#4C5534]">
              How can we help?
            </h2>
          </div>

          <label className="flex min-h-12 items-center gap-3 rounded-full border border-[#80755F]/25 bg-white px-4 text-[#80755F] focus-within:border-[#4C5534]">
            <SearchIcon />
            <span className="sr-only">Search frequently asked questions</span>
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setOpenId(null);
              }}
              placeholder="Search a question..."
              className="min-w-0 flex-1 bg-transparent font-montserrat text-xs text-[#4C5534] outline-none placeholder:text-[#80755F]/70"
            />
          </label>

          <nav aria-label="FAQ categories" className="flex flex-wrap gap-2 lg:flex-col lg:items-start">
            <button
              type="button"
              onClick={() => chooseCategory("All")}
              aria-pressed={activeCategory === "All"}
              className={`min-h-10 rounded-full border px-4 font-montserrat text-xs font-medium transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 ${activeCategory === "All" ? "border-[#4C5534] bg-[#4C5534] text-white lg:bg-transparent lg:text-[#4C5534]" : "border-[#80755F]/25 text-[#80755F] lg:border-transparent lg:hover:text-[#4C5534]"}`}
            >
              All questions
            </button>
            {FAQ_CATEGORIES.map((category) => {
              const active = activeCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => chooseCategory(category)}
                  aria-pressed={active}
                  className={`min-h-10 rounded-full border px-4 font-montserrat text-xs font-medium transition-colors lg:rounded-none lg:border-0 lg:border-l-2 lg:px-4 ${active ? "border-[#4C5534] bg-[#4C5534] text-white lg:bg-transparent lg:text-[#4C5534]" : "border-[#80755F]/25 text-[#80755F] lg:border-transparent lg:hover:text-[#4C5534]"}`}
                >
                  {category}
                </button>
              );
            })}
          </nav>

          <div className="hidden border-t border-[#80755F]/20 pt-5 lg:block">
            <p className="font-montserrat text-xs leading-6 text-[#80755F]">
              Have a question that is not listed? Reach out to the clinic for assistance with your specific concern.
            </p>
            <BookingTrigger
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#4C5534] px-6 font-montserrat text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#4C5534]"
            >
              Ask about a treatment
            </BookingTrigger>
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4 border-b border-[#80755F]/20 pb-4">
            <div>
              <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">
                {activeCategory === "All" ? "The essentials" : activeCategory}
              </p>
              <h2 className="font-seasons mt-1 text-2xl text-[#4C5534]">
                FAQs
              </h2>
            </div>
            <span className="font-montserrat text-[10px] text-[#80755F]">
              {visibleFAQs.length} {visibleFAQs.length === 1 ? "answer" : "answers"}
            </span>
          </div>

          {visibleFAQs.length > 0 ? (
            <div className="divide-y divide-[#80755F]/20">
              {visibleFAQs.map((item, index) => {
                const open = openId === item.id;
                const answerId = `faq-answer-${item.id}`;
                return (
                  <article key={item.id} className="py-1">
                    <button
                      type="button"
                      aria-expanded={open}
                      aria-controls={answerId}
                      onClick={() => setOpenId(open ? null : item.id)}
                      className="flex min-h-[76px] w-full items-center justify-between gap-5 py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C5534]"
                    >
                      <span className="flex min-w-0 items-start gap-4">
                        <span className="pt-0.5 font-seasons text-sm text-[#80755F]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-seasons text-xl leading-snug text-[#4C5534] sm:text-2xl">
                            {item.question}
                          </span>
                          <span className="mt-1 block font-montserrat text-[9px] font-semibold uppercase tracking-[0.14em] text-[#80755F]">
                            {item.category}
                          </span>
                        </span>
                      </span>
                      <ChevronIcon open={open} />
                    </button>
                    {open && (
                      <div id={answerId} className="pb-6 pl-10 pr-8 sm:pl-12">
                        <p className="max-w-[680px] font-montserrat text-sm leading-7 text-[#777568]">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="border-b border-[#80755F]/20 py-16 text-center">
              <p className="font-seasons text-2xl text-[#4C5534]">
                No matching questions
              </p>
              <p className="mt-2 font-montserrat text-xs leading-6 text-[#80755F]">
                We could not find that question in the FAQs. You can ask Aesthera instead.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3"><button type="button" onClick={() => window.dispatchEvent(new CustomEvent("aesthera:open-assistant", { detail: { question: search.trim() } }))} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#4C5534] px-6 font-montserrat text-xs font-semibold text-white transition-colors hover:bg-[#38442d]"><span aria-hidden="true">✦</span>Ask Aesthera</button><button type="button" onClick={() => { setSearch(""); chooseCategory("All"); }} className="min-h-11 px-3 font-montserrat text-xs font-semibold text-[#4f6442] underline underline-offset-4">Clear filters</button></div>
            </div>
          )}
        </div>
      </section>

      <section className="px-6 pb-16 md:px-10 md:pb-24">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-6 rounded-[24px] border border-[#80755F]/20 bg-white px-6 py-9 sm:flex-row sm:items-center sm:px-10">
          <div className="max-w-[620px]">
            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#80755F]">
              Still have questions?
            </p>
            <h2 className="font-seasons mt-2 text-3xl leading-tight text-[#4C5534] sm:text-4xl">
              Let&apos;s talk about your goals.
            </h2>
            <p className="mt-3 font-montserrat text-xs leading-6 text-[#80755F]">
              Get in touch with the team to discuss your concerns and learn about the next steps.
            </p>
          </div>
          <BookingTrigger
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#4C5534] px-7 font-montserrat text-xs font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#4C5534]"
          />
        </div>
      </section>
    </>
  );
}
