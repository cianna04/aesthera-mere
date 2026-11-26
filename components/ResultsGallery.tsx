"use client";

import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/Icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { treatmentResults, type ResultPhoto } from "@/data/results";
import styles from "./ResultsGallery.module.css";

const PREVIEW_COUNT = 4;
type ComparisonItem = { id: string; title: string; photo: ResultPhoto };
const treatmentNames = [...new Set(treatmentResults.map((result) => result.title))];
// Keep every comparison of one treatment together, including alternate angles.
const comparisons: ComparisonItem[] = treatmentNames.flatMap((title) =>
  treatmentResults.filter((result) => result.title === title).flatMap((result) =>
    result.photos.map((photo, index) => ({ id: `${result.id}-${index}`, title, photo }))
  )
);

function Comparison({ item, enlarged = false, eager = false }: {
  item: ComparisonItem; enlarged?: boolean; eager?: boolean;
}) {
  const stacked = item.photo.layout === "stacked";
  const sizes = enlarged
    ? stacked ? "(max-width: 700px) 88vw, 880px" : "(max-width: 700px) 44vw, 430px"
    : stacked ? "(max-width: 700px) 90vw, 50vw" : "(max-width: 700px) 44vw, 25vw";
  return (
    <div className={`${styles.comparison} ${stacked ? styles.stacked : ""} ${enlarged ? styles.enlarged : ""}`} role="group" aria-label={`${item.title}, ${item.photo.view}`}>
      {(["before", "after"] as const).map((side) => <figure key={side} className={styles.photoPanel}>
        <figcaption>{side === "before" ? "Before" : "After"}</figcaption>
        <div className={styles.imageViewport}>
          <Image src={item.photo[side]} alt={`${side === "before" ? "Before" : "After"} ${item.title}, ${item.photo.view}`}
            fill sizes={sizes} quality={90} preload={eager} className={styles.photo} />
        </div>
      </figure>)}
    </div>
  );
}

function ResultViewer({ item, position, total, onClose, onPrevious, onNext }: {
  item: ComparisonItem; position: number; total: number;
  onClose: () => void; onPrevious: () => void; onNext: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="result-viewer-title" aria-describedby="result-viewer-note"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={(event) => {
        if (total < 2) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); onPrevious(); }
        if (event.key === "ArrowRight") { event.preventDefault(); onNext(); }
      }}>
      <div className={styles.dialogContent}>
        <div className={styles.dialogHeader}>
          <div><h2 id="result-viewer-title">{item.title}</h2></div>
          <button type="button" autoFocus onClick={onClose} className={styles.iconButton} aria-label="Close result"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6" /></svg></button>
        </div>
        <div className={styles.viewerPhotoArea}><Comparison item={item} enlarged /></div>
        <div className={styles.viewerFooter}>
          <p id="result-viewer-note">Results vary per individual.</p>
          {total > 1 && <div className={styles.viewerControls}>
            <button type="button" className={styles.iconButton} aria-label="Previous result" onClick={onPrevious}><ChevronLeftIcon /></button>
            <span aria-live="polite">{position} / {total}</span>
            <button type="button" className={styles.iconButton} aria-label="Next result" onClick={onNext}><ChevronRightIcon /></button>
          </div>}
        </div>
      </div>
    </dialog>
  );
}

export default function ResultsGallery() {
  const [filter, setFilter] = useState("All treatments");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const closeViewer = useCallback(() => setSelectedId(null), []);
  const filtered = comparisons.filter((item) => filter === "All treatments" || item.title === filter);
  const featured = filter === "All treatments"
    ? filtered.filter((item, index, list) => list.findIndex((other) => other.title === item.title) === index).slice(0, PREVIEW_COUNT)
    : filtered.slice(0, PREVIEW_COUNT);
  const visible = expanded ? filtered : featured;
  const visibleGroups = treatmentNames.map((title) => ({ title, items: visible.filter((item) => item.title === title) })).filter((group) => group.items.length);
  const selected = comparisons.find((item) => item.id === selectedId);
  const selectedGroup = selected ? comparisons.filter((item) => item.title === selected.title) : [];
  const selectedIndex = selectedGroup.findIndex((item) => item.id === selectedId);

  useEffect(() => {
    if (!filterOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) setFilterOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [filterOpen]);

  function chooseFilter(value: string) {
    setFilter(value);
    setExpanded(false);
    setFilterOpen(false);
    filterButtonRef.current?.focus();
  }

  function changeResult(direction: number) {
    if (selectedGroup.length < 2) return;
    setSelectedId(selectedGroup[(selectedIndex + direction + selectedGroup.length) % selectedGroup.length].id);
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}><h1>Real <em>results.</em></h1><p>Explore before-and-after comparisons by treatment.</p></header>
      <section className={styles.gallery} aria-label="Before-and-after gallery">
        <div className={styles.toolbar}>
          <div ref={filterRef} className={styles.filterControl} onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setFilterOpen(false);
          }} onKeyDown={(event) => {
            if (event.key === "Escape" && filterOpen) { setFilterOpen(false); filterButtonRef.current?.focus(); }
          }}>
            <button ref={filterButtonRef} type="button" className={styles.filterButton} aria-label={`Filter results by treatment: ${filter}`} aria-expanded={filterOpen} aria-controls={filterOpen ? "results-filter-options" : undefined} onClick={() => setFilterOpen((open) => !open)}>
              <span>{filter}</span>
              <svg viewBox="0 0 12 8" fill="none" aria-hidden="true" className={filterOpen ? styles.chevronOpen : ""}><path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
            {filterOpen && <div id="results-filter-options" className={styles.filterMenu} role="group" aria-label="Treatments">
              {["All treatments", ...treatmentNames].map((title) => <button key={title} type="button" className={`${styles.filterOption} ${filter === title ? styles.filterOptionActive : ""}`} aria-pressed={filter === title} onClick={() => chooseFilter(title)}>{title}</button>)}
            </div>}
          </div>
          <p className={styles.resultCount} role="status">{visible.length === filtered.length ? filtered.length : `${visible.length} of ${filtered.length}`} {filtered.length === 1 ? "comparison" : "comparisons"}</p>
        </div>
        <div id="results-grid" className={styles.groups}>
          {visibleGroups.map((group) => <section key={group.title} className={`${styles.resultGroup} ${group.items.length > 1 ? styles.wideGroup : ""}`} aria-label={`${group.title} results`}>
            <div className={styles.groupHeading}><h2>{group.title}</h2></div>
            <div className={styles.groupGrid}>
              {group.items.map((item) => <article key={item.id}>
                <button type="button" className={styles.resultCard} onClick={() => setSelectedId(item.id)} aria-label={`View ${item.title}: ${item.photo.view}`} aria-haspopup="dialog">
                  <Comparison item={item} eager={visible.indexOf(item) < 2} />
                  <span className={styles.expandIcon} aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M8 16 16 8M9 8h7v7" /></svg>
                  </span>
                </button>
              </article>)}
            </div>
          </section>)}
        </div>
        {filtered.length > featured.length && <div className={styles.moreResults}><button type="button" className={styles.viewAll} aria-expanded={expanded} aria-controls="results-grid" onClick={() => setExpanded((value) => !value)}>{expanded ? "Show fewer results" : "View all results"}</button></div>}
        <p className={styles.resultsNote}>Results vary per individual.</p>
      </section>
      {selected && <ResultViewer item={selected} position={selectedIndex + 1} total={selectedGroup.length} onClose={closeViewer} onPrevious={() => changeResult(-1)} onNext={() => changeResult(1)} />}
    </div>
  );
}
