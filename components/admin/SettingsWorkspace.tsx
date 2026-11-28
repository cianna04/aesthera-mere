"use client";

import { useEffect, useState, type FormEvent } from "react";

type Settings = {
  clinicName: string; address: string; phone: string; hours: string;
  cancellationPolicy: string; depositRule: "Not set" | "No deposit" | "Fixed amount" | "Percentage";
  depositAmount: string; minimumNoticeHours: string;
  facebook: string; instagram: string; tiktok: string;
};
const key = "aesthera-admin-clinic-settings-v1";
const defaults: Settings = {
  clinicName: "Aesthera Mère Beauty Creations",
  address: "Unit 3 No. 4, Madison Square, Pioneer St., Mandaluyong City, Metro Manila",
  phone: "+63 918 936 5679",
  hours: "Monday–Tuesday and Thursday–Sunday: 10:00 AM–8:00 PM\nWednesday: Closed",
  cancellationPolicy: "", depositRule: "Not set", depositAmount: "", minimumNoticeHours: "",
  facebook: "https://www.facebook.com/aestheramereph/",
  instagram: "https://www.instagram.com/aestheramereph/",
  tiktok: "https://www.tiktok.com/@aestheramere",
};
const inputClass = "mt-2 min-h-11 w-full rounded-xl border border-[#334b39]/15 bg-[#faf9f5] px-3.5 py-2.5 font-montserrat text-xs text-[#354239] outline-none focus:border-[#344b38]/40 focus:ring-2 focus:ring-[#344b38]/10";
const labelClass = "block font-montserrat text-[10px] font-semibold text-[#536057]";

function normalize(value: unknown): Settings {
  if (!value || typeof value !== "object") return defaults;
  const saved = value as Record<string, unknown>;
  const result = { ...defaults };
  for (const field of Object.keys(defaults) as (keyof Settings)[]) {
    if (typeof saved[field] === "string") result[field] = saved[field] as never;
  }
  if (!["Not set", "No deposit", "Fixed amount", "Percentage"].includes(result.depositRule)) result.depositRule = "Not set";
  return result;
}

export default function SettingsWorkspace() {
  const [settings, setSettings] = useState(defaults);
  const [saved, setSaved] = useState(defaults);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(settings) !== JSON.stringify(saved);

  useEffect(() => {
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(key);
        if (raw) { const value = normalize(JSON.parse(raw)); setSettings(value); setSaved(value); }
      } catch { setNotice("Clinic settings could not be loaded."); }
      setLoaded(true);
    });
  }, []);

  function update(field: keyof Settings, value: string) { setSettings((current) => ({ ...current, [field]: value })); setNotice(""); }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    for (const field of ["facebook", "instagram", "tiktok"] as const) {
      if (!settings[field]) continue;
      try { if (new URL(settings[field]).protocol !== "https:") throw new Error(); }
      catch { setNotice(`Enter a valid HTTPS link for ${field}.`); return; }
    }
    if (settings.depositRule === "Fixed amount" || settings.depositRule === "Percentage") {
      const amount = Number(settings.depositAmount);
      if (!Number.isFinite(amount) || amount <= 0 || (settings.depositRule === "Percentage" && amount > 100)) { setNotice("Enter a valid deposit amount."); return; }
    }
    try { localStorage.setItem(key, JSON.stringify(settings)); }
    catch { setNotice("Clinic settings could not be saved in this browser."); return; }
    setSaved(settings);
    setNotice("Clinic settings saved.");
  }

  return <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10"><div className="mx-auto max-w-[1200px]">
    <header><p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">Administration</p><h1 className="font-seasons mt-3 text-[clamp(2.4rem,4vw,3.7rem)] leading-none text-[#2e4433]">Settings</h1></header>
    <form onSubmit={save} className="mt-8 space-y-5">
      <section className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 sm:p-7"><div className="mb-6"><h2 className="font-seasons text-2xl text-[#2e4433]">Clinic details</h2></div><div className="grid gap-5 md:grid-cols-2"><label className={`${labelClass} md:col-span-2`}>Clinic name<input required value={settings.clinicName} onChange={(event) => update("clinicName", event.target.value)} className={inputClass} /></label><label className={`${labelClass} md:col-span-2`}>Address<textarea required rows={2} value={settings.address} onChange={(event) => update("address", event.target.value)} className={inputClass} /></label><label className={labelClass}>Phone number<input required type="tel" value={settings.phone} onChange={(event) => update("phone", event.target.value)} className={inputClass} /></label><label className={`${labelClass} md:col-span-2`}>Opening hours<textarea required rows={3} value={settings.hours} onChange={(event) => update("hours", event.target.value)} className={inputClass} /></label></div></section>
      <section className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 sm:p-7"><div className="mb-6"><h2 className="font-seasons text-2xl text-[#2e4433]">Booking policies</h2></div><div className="grid gap-5 md:grid-cols-2"><label className={`${labelClass} md:col-span-2`}>Cancellation policy<textarea rows={4} value={settings.cancellationPolicy} onChange={(event) => update("cancellationPolicy", event.target.value)} placeholder="Enter the clinic’s cancellation and rescheduling terms" className={inputClass} /></label><label className={labelClass}>Deposit rule<select value={settings.depositRule} onChange={(event) => update("depositRule", event.target.value)} className={inputClass}><option>Not set</option><option>No deposit</option><option>Fixed amount</option><option>Percentage</option></select></label>{(settings.depositRule === "Fixed amount" || settings.depositRule === "Percentage") && <label className={labelClass}>Deposit {settings.depositRule === "Percentage" ? "percentage" : "amount (PHP)"}<input required type="number" min="0.01" max={settings.depositRule === "Percentage" ? "100" : undefined} step="0.01" value={settings.depositAmount} onChange={(event) => update("depositAmount", event.target.value)} className={inputClass} /></label>}<label className={labelClass}>Minimum booking notice (hours)<input type="number" min="0" max="720" step="1" value={settings.minimumNoticeHours} onChange={(event) => update("minimumNoticeHours", event.target.value)} placeholder="Not set" className={inputClass} /></label></div></section>
      <section className="rounded-[24px] border border-[#334b39]/10 bg-white/80 p-5 sm:p-7"><div className="mb-6"><h2 className="font-seasons text-2xl text-[#2e4433]">Social media</h2></div><div className="grid gap-5 md:grid-cols-2">{(["facebook", "instagram", "tiktok"] as const).map((field) => <label key={field} className={labelClass}>{field[0].toUpperCase() + field.slice(1)}<input type="url" value={settings[field]} onChange={(event) => update(field, event.target.value)} className={inputClass} /></label>)}</div></section>
      {notice && <p role="status" className="rounded-xl bg-[#e8eee6] px-4 py-3 font-montserrat text-[10px] text-[#405745]">{notice}</p>}
      <div className="flex flex-wrap justify-end gap-2"><button type="button" disabled={!dirty} onClick={() => { setSettings(saved); setNotice(""); }} className="min-h-11 rounded-full border border-[#334b39]/15 px-5 font-montserrat text-[9px] font-bold uppercase text-[#536057] disabled:opacity-40">Discard changes</button><button type="submit" disabled={!loaded || !dirty} className="min-h-11 rounded-full bg-[#344c38] px-6 font-montserrat text-[9px] font-bold uppercase text-white disabled:opacity-40">Save settings</button></div>
    </form>
  </div></main>;
}
