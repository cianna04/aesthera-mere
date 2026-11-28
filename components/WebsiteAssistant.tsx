"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useBooking } from "@/components/BookingProvider";
import type { AssistantReply } from "@/lib/assistant";

type Message = { role: "user" | "assistant"; text: string; reply?: AssistantReply };
const welcomeMessage = (nickname = ""): Message => ({
  role: "assistant",
  text: `${nickname ? `Hi ${nickname}!` : "Hello!"} You can ask in English, Filipino, or Taglish about Aesthera Mère's treatments, prices, promos, doctors, hours, location, or booking.`,
});

function inlineMarkdown(text: string): ReactNode[] {
  return text.split(/(\*\*[^*\n]+\*\*)/g).filter(Boolean).map((part, index) =>
    part.startsWith("**") && part.endsWith("**")
      ? <strong key={index} className="font-semibold text-[#354126]">{part.slice(2, -2)}</strong>
      : part,
  );
}

function SafeMarkdown({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];
  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push(<p key={`p-${blocks.length}`}>{paragraph.map((line, index) => <span key={index}>{index > 0 && <br />}{inlineMarkdown(line)}</span>)}</p>);
    paragraph = [];
  };
  const flushBullets = () => {
    if (!bullets.length) return;
    blocks.push(<ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-5">{bullets.map((line, index) => <li key={index}>{inlineMarkdown(line)}</li>)}</ul>);
    bullets = [];
  };

  for (const line of text.split("\n")) {
    const bullet = line.match(/^\s*(?:[-*•])\s+(.+)$/);
    if (bullet) { flushParagraph(); bullets.push(bullet[1]); continue; }
    flushBullets();
    if (!line.trim()) { flushParagraph(); continue; }
    paragraph.push(line);
  }
  flushParagraph();
  flushBullets();
  return <div className="space-y-3">{blocks}</div>;
}

export default function WebsiteAssistant() {
  const pathname = usePathname();
  const { openBooking } = useBooking();
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [handoffOpen, setHandoffOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcomeMessage()]);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { if (open) end.current?.scrollIntoView({ block: "nearest" }); }, [messages, busy, open]);
  useEffect(() => {
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, []);
  useEffect(() => {
    const openFromWebsite = (event: Event) => {
      const detail = event instanceof CustomEvent ? event.detail as { question?: unknown } : undefined;
      const suggestedQuestion = typeof detail?.question === "string" ? detail.question.trim().slice(0, 600) : "";
      setHandoffOpen(false);
      setOpen(true);
      if (suggestedQuestion) setQuestion(suggestedQuestion);
    };
    window.addEventListener("aesthera:open-assistant", openFromWebsite);
    return () => window.removeEventListener("aesthera:open-assistant", openFromWebsite);
  }, []);
  if (pathname.startsWith("/admin")) return null;

  async function send(text: string) {
    if (busy || !consent || !text.trim()) return;
    const personalizeWithNickname = Boolean(nickname && !messages.some((message) => message.role === "user"));
    setError(""); setQuestion(""); setBusy(true);
    setMessages((current) => [...current.slice(-29), { role: "user", text }]);
    try {
      const contextId = messages.at(-1)?.reply?.contextId;
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, ...(contextId ? { contextId } : {}), ...(personalizeWithNickname ? { nickname } : {}) }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Please try again.");
      setMessages((current) => [...current, { role: "assistant", text: data.text, reply: data }]);
    } catch (error) { setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The assistant is unavailable. Please try again or contact the clinic."); setQuestion(text); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(question); }
  function beginChat(value = nameDraft) {
    const safeNickname = value.trim().replace(/\s+/g, " ").slice(0, 30);
    setNickname(safeNickname);
    setMessages([welcomeMessage(safeNickname)]);
    setOnboarded(true);
  }

  return <div className="fixed bottom-5 right-4 z-[90] font-montserrat sm:right-6">
    {open && <section role="dialog" aria-label="Aesthera Mère website assistant" className="relative mb-3 flex h-[min(640px,78dvh)] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-[26px] border border-[#54603b]/15 bg-[#fffdf5] text-[#414d32] shadow-[0_24px_70px_-24px_rgba(40,52,31,0.55)]">
      <header className="relative flex items-center justify-between bg-[#515c3b] px-4 py-4 text-[#fffdf5] sm:px-5"><div className="flex min-w-0 items-center gap-3"><span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20 bg-white/10 font-seasons text-lg">AM</span><div className="min-w-0"><h2 className="truncate font-seasons text-xl leading-tight sm:text-2xl">Aesthera Mère</h2><p className="mt-1 flex items-center gap-1.5 text-[10px] tracking-wide text-white/70"><span className="h-1.5 w-1.5 rounded-full bg-[#d7e6c7] shadow-[0_0_0_3px_rgba(215,230,199,0.12)]" />Clinic assistant</p></div></div><div className="flex items-center gap-1"><button onClick={() => setHandoffOpen((current) => !current)} aria-label="Talk to the clinic team" aria-expanded={handoffOpen} className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xl leading-none transition-colors hover:bg-white/10">⋮</button><button onClick={() => { setHandoffOpen(false); setOpen(false); }} aria-label="Close assistant" className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg transition-colors hover:bg-white/10">×</button></div></header>
      {handoffOpen && <div className="absolute right-3 top-[74px] z-30 w-[min(310px,calc(100%-24px))] overflow-hidden rounded-[22px] border border-[#515c3b]/10 bg-[#fffdf8] p-2 text-[#414d32] shadow-[0_18px_55px_-18px_rgba(40,52,31,0.5)]"><div className="px-3 pb-2 pt-1"><p className="text-[11px] font-semibold">Talk to the clinic team</p><p className="mt-1 text-[9px] leading-4 text-[#838978]">Continue through an official Aesthera Mère channel.</p></div><a href="https://m.me/aestheramereph" target="_blank" rel="noopener noreferrer" onClick={() => setHandoffOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[11px] transition-colors hover:bg-[#eef0e7]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e5eadc] font-semibold" aria-hidden="true">m</span><span><b className="block font-semibold">Continue on Messenger</b><small className="mt-0.5 block text-[9px] text-[#858b7c]">Aesthera Mère clinic team</small></span></a><a href="https://www.instagram.com/aestheramereph/" target="_blank" rel="noopener noreferrer" onClick={() => setHandoffOpen(false)} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-[11px] transition-colors hover:bg-[#eef0e7]"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#e5eadc] font-semibold" aria-hidden="true">◎</span><span><b className="block font-semibold">Continue on Instagram</b><small className="mt-0.5 block text-[9px] text-[#858b7c]">@aestheramereph</small></span></a></div>}
      {!consent ? <div className="flex flex-1 flex-col justify-center gap-5 bg-[#fbfaf4] p-6 text-xs leading-6"><div><h3 className="font-seasons text-2xl text-[#3f4c32]">Before we start</h3></div><p>I can help with Aesthera Mère treatments, prices, promos, doctors, clinic details, and appointment requests. Medical and treatment decisions belong with your doctor.</p><div className="rounded-2xl border border-[#515c3b]/8 bg-white p-4 text-[10px] leading-5 text-[#727968]"><p>Your questions may be processed by Google Gemini. Please do not share your full name, contact details, photos, medical records, or health history here. This chat stays in the current tab and clears on refresh.</p><a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="mt-2 inline-block font-semibold text-[#515c3b] underline underline-offset-4">Read our Privacy Policy</a></div><button onClick={() => setConsent(true)} className="rounded-full bg-[#515c3b] px-5 py-3 font-medium text-white transition-colors hover:bg-[#404a2f]">Continue</button></div> : !onboarded ? <form onSubmit={(event) => { event.preventDefault(); beginChat(); }} className="flex flex-1 flex-col justify-center bg-[#fbfaf4] p-6"><span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8a907d]">Optional</span><h3 className="mt-2 font-seasons text-3xl text-[#3f4c32]">What should we call you?</h3><p className="mt-3 text-[11px] leading-5 text-[#777e6d]">A nickname is enough. It personalizes your welcome and first reply. It is sent to this website with your first question, but is not included in the Gemini classifier prompt or saved by the website.</p><label htmlFor="assistant-nickname" className="mt-6 text-[10px] font-semibold text-[#515c3b]">Nickname</label><input id="assistant-nickname" value={nameDraft} onChange={(event) => setNameDraft(event.target.value)} maxLength={30} autoComplete="off" placeholder="e.g. Mia" className="mt-2 rounded-2xl border border-[#515c3b]/15 bg-white px-4 py-3 text-sm outline-none focus:shadow-[0_0_0_3px_rgba(81,92,59,0.12)]" /><div className="mt-5 flex items-center justify-between gap-3"><button type="button" onClick={() => { setNameDraft(""); beginChat(""); }} className="px-3 py-2 text-[10px] font-medium text-[#727968] underline underline-offset-4">Skip</button><button type="submit" className="rounded-full bg-[#515c3b] px-6 py-3 text-[11px] font-medium text-white">Start chat</button></div></form> : <>
        <div className="flex items-center justify-between border-b border-[#515c3b]/8 px-4 py-2.5 text-[10px] text-[#7f856f]"><span>{nickname ? `Chatting as ${nickname}` : "Ask in English, Filipino, or Taglish"}</span><button disabled={busy} onClick={() => { setMessages([welcomeMessage(nickname)]); setQuestion(""); setError(""); }} className="font-medium underline decoration-[#7f856f]/50 underline-offset-4 disabled:opacity-40">Clear chat</button></div>
        <div role="log" aria-live="polite" aria-relevant="additions" className="scrollbar-hidden flex-1 space-y-5 overflow-y-auto bg-[#fbfaf4] px-3 py-4 sm:px-4">{messages.map((message, index) => <div key={index} className={`flex items-end gap-2 ${message.role === "user" ? "flex-row-reverse" : ""}`}>
          <span aria-hidden="true" className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[9px] font-semibold ${message.role === "user" ? "bg-[#e3e7d8] text-[#515c3b]" : "bg-[#515c3b] text-white"}`}>{message.role === "user" ? (nickname ? nickname[0].toUpperCase() : "You") : "AM"}</span>
          <div className={`max-w-[84%] break-words px-4 py-3 text-[13px] leading-[1.7] shadow-sm sm:max-w-[82%] sm:px-4.5 ${message.role === "user" ? "rounded-[20px] rounded-br-md bg-[#515c3b] text-white" : "rounded-[20px] rounded-bl-md border border-[#515c3b]/8 bg-white"}`}>{message.role === "assistant" ? <SafeMarkdown text={message.text} /> : <p className="whitespace-pre-wrap">{message.text}</p>}{message.reply?.consult && <button onClick={() => { setOpen(false); openBooking(); }} className="mt-4 rounded-full bg-[#515c3b] px-5 py-2.5 text-[11px] font-medium text-white transition-colors hover:bg-[#404a2f]">Book Now</button>}</div>
        </div>)}{busy && <div className="flex items-end gap-2" role="status" aria-label="Aesthera Mère assistant is typing"><span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#515c3b] text-[9px] font-semibold text-white">AM</span><span className="flex items-center gap-1 rounded-[18px] rounded-bl-md border border-[#515c3b]/8 bg-white px-4 py-3.5 shadow-sm"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7c856b] [animation-delay:-0.3s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7c856b] [animation-delay:-0.15s]" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#7c856b]" /></span></div>}<div ref={end} /></div>
        {messages.length === 1 && <div className="border-t border-[#515c3b]/8 bg-[#fbfaf4] px-4 pb-3 pt-2"><p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8a907d]">Popular questions</p><div className="flex flex-wrap gap-2">{["Clinic hours", "Where is the clinic?", "Book a consultation", "Current promos"].map((text) => <button disabled={busy} key={text} onClick={() => void send(text)} className="rounded-full border border-[#515c3b]/10 bg-white px-3 py-2 text-[10px] text-[#596247] shadow-sm transition-colors hover:bg-[#e9ecdf]">{text}</button>)}</div></div>}
        {error && <p role="alert" className="px-4 pb-2 text-xs text-[#915744]">{error}</p>}
        <form onSubmit={submit} className="flex items-center gap-2 border-t border-[#515c3b]/10 bg-[#fffdf8] p-3"><label className="sr-only" htmlFor="assistant-question">Your question</label><input id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} disabled={busy} placeholder="Message Aesthera…" autoComplete="off" className="min-w-0 flex-1 rounded-full border border-[#515c3b]/8 bg-[#f1efe6] px-4 py-3 text-xs outline-none transition-shadow placeholder:text-[#9a9f90] focus:shadow-[0_0_0_3px_rgba(81,92,59,0.12)]" /><button disabled={busy || !question.trim()} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#515c3b] text-white transition-[background-color,transform] hover:bg-[#404a2f] active:scale-95 disabled:opacity-40" aria-label="Send question"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 4 17 8-17 8 3-8-3-8Z" /><path d="M7 12h14" /></svg></button></form>
      </>}
    </section>}
    <button onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Close website assistant" : "Open website assistant"} className="ml-auto flex min-h-12 items-center gap-2 rounded-full bg-[#515c3b] px-5 py-3 text-xs font-medium text-[#fffdf5] shadow-lg hover:bg-[#404a2f]"><span aria-hidden="true">✦</span> Ask Aesthera</button>
  </div>;
}
