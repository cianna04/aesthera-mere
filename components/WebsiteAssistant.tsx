"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useBooking } from "@/components/BookingProvider";
import type { AssistantReply } from "@/lib/assistant";

type Message = { role: "user" | "assistant"; text: string; reply?: AssistantReply };
const welcome: Message = { role: "assistant", text: "Hello! You can ask in English, Filipino, or Taglish about Aesthera Mère's treatments, prices, promos, doctors, hours, location, or booking." };

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
  const [messages, setMessages] = useState<Message[]>([welcome]);
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
  if (pathname.startsWith("/admin")) return null;

  async function send(text: string) {
    if (busy || !consent || !text.trim()) return;
    setError(""); setQuestion(""); setBusy(true);
    setMessages((current) => [...current.slice(-29), { role: "user", text }]);
    try {
      const contextId = messages.at(-1)?.reply?.contextId;
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, ...(contextId ? { contextId } : {}) }), signal: AbortSignal.timeout(15000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Please try again.");
      setMessages((current) => [...current, { role: "assistant", text: data.text, reply: data }]);
    } catch (error) { setError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "The assistant is unavailable. Please try again or contact the clinic."); setQuestion(text); }
    finally { setBusy(false); }
  }
  function submit(event: FormEvent) { event.preventDefault(); void send(question); }

  return <div className="fixed bottom-5 right-4 z-[90] font-montserrat sm:right-6">
    {open && <section role="dialog" aria-label="Aesthera Mère website assistant" className="mb-3 flex h-[min(620px,75dvh)] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-[24px] border border-[#54603b]/15 bg-[#fffdf5] text-[#414d32] shadow-2xl">
      <header className="flex items-center justify-between bg-[#515c3b] px-5 py-4 text-[#fffdf5]"><div><h2 className="font-seasons text-2xl">Aesthera Mère</h2><p className="text-[10px] tracking-wide text-white/70">Aesthera Mère assistant · AI-assisted FAQ</p></div><button onClick={() => setOpen(false)} aria-label="Close assistant" className="h-10 w-10 rounded-full hover:bg-white/10">×</button></header>
      {!consent ? <div className="flex flex-1 flex-col justify-center gap-4 p-6 text-xs leading-6"><p>I can help with Aesthera Mère treatments, prices, promos, doctors, clinic details, and appointment requests. Medical and treatment decisions belong with your doctor.</p><p>Please don’t share names, contact details, photos, or medical history. Questions may be processed by Google Gemini. Chat messages stay in this tab and clear on refresh.</p><a href="/privacy-policy" className="underline underline-offset-4">Privacy policy</a><button onClick={() => setConsent(true)} className="rounded-full bg-[#515c3b] px-5 py-3 text-white">Start chat</button></div> : <>
        <div className="flex justify-end px-4 py-2 text-[10px] text-[#7f856f]"><button disabled={busy} onClick={() => { setMessages([welcome]); setQuestion(""); setError(""); }} className="underline underline-offset-4 disabled:opacity-40">Clear chat</button></div>
        <div role="log" aria-live="polite" aria-relevant="additions" className="flex-1 space-y-4 overflow-y-auto px-3 pb-4 sm:px-4">{messages.map((message, index) => <div key={index} className={`max-w-[94%] break-words rounded-[20px] px-4 py-3.5 text-[13px] leading-[1.75] sm:max-w-[92%] sm:px-5 sm:py-4 ${message.role === "user" ? "ml-auto bg-[#515c3b] text-white" : "bg-[#f0eee4]"}`}>{message.role === "assistant" ? <SafeMarkdown text={message.text} /> : <p className="whitespace-pre-wrap">{message.text}</p>}{message.reply?.consult && <button onClick={() => { setOpen(false); openBooking(); }} className="mt-4 rounded-full bg-[#515c3b] px-5 py-2.5 text-[11px] font-medium text-white transition-colors hover:bg-[#404a2f]">Book Now</button>}</div>)}{busy && <p className="px-2 text-xs" role="status">Checking Aesthera Mère information…</p>}<div ref={end} /></div>
        {messages.length === 1 && <div className="flex flex-wrap gap-2 px-4 pb-3">{["Clinic hours", "Where is the clinic?", "Book a consultation", "Current promos"].map((text) => <button disabled={busy} key={text} onClick={() => void send(text)} className="rounded-full bg-[#e7e9dd] px-3 py-2 text-[10px] hover:bg-[#dce1cf]">{text}</button>)}</div>}
        {error && <p role="alert" className="px-4 pb-2 text-xs text-[#915744]">{error}</p>}
        <form onSubmit={submit} className="flex gap-2 border-t border-[#515c3b]/10 p-3"><label className="sr-only" htmlFor="assistant-question">Your question</label><input id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={600} disabled={busy} placeholder="Ask about the clinic…" autoComplete="off" className="min-w-0 flex-1 rounded-full bg-[#f0eee4] px-4 py-3 text-xs outline-offset-2" /><button disabled={busy || !question.trim()} className="rounded-full bg-[#515c3b] px-4 text-xs text-white disabled:opacity-40" aria-label="Send question">Send</button></form>
      </>}
    </section>}
    <button onClick={() => setOpen((current) => !current)} aria-expanded={open} aria-label={open ? "Close website assistant" : "Open website assistant"} className="ml-auto flex min-h-12 items-center gap-2 rounded-full bg-[#515c3b] px-5 py-3 text-xs font-medium text-[#fffdf5] shadow-lg hover:bg-[#404a2f]"><span aria-hidden="true">✦</span> Ask Aesthera</button>
  </div>;
}
