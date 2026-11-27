"use client";

import { useState, type FormEvent, type ReactNode } from "react";

type SettingsValues = {
  clinicName: string;
  address: string;
  phone: string;
  hours: string;
  cancellationPolicy: string;
  depositRules: string;
  minimumBookingNotice: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  otherSocialLinks: string;
};

const initialSettings: SettingsValues = {
  clinicName: "",
  address: "",
  phone: "",
  hours: "",
  cancellationPolicy: "",
  depositRules: "",
  minimumBookingNotice: "",
  instagram: "",
  facebook: "",
  tiktok: "",
  otherSocialLinks: "",
};

const inputClassName = "min-h-11 w-full rounded-xl border border-[#4C5534]/18 bg-[#FFFCF3] px-3 font-montserrat text-xs text-[#4C5534] outline-none placeholder:text-[#9A927F] focus:border-[#71835E]";
const labelClassName = "mb-1.5 block font-montserrat text-[9px] font-semibold uppercase tracking-wide text-[#80755F]";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
      {children}
    </svg>
  );
}

function SettingsCard({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-[22px] border border-[#80755F]/15 bg-[#FFFEFA] p-5 shadow-[0_10px_32px_rgba(51,75,57,0.04)] sm:p-7">
      <div className="border-b border-[#4C5534]/12 pb-4">
        <h2 className="font-seasons text-2xl text-[#4C5534]">{title}</h2>
        <p className="mt-1 font-montserrat text-[10px] leading-5 text-[#80755F]">{description}</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function SettingsWorkspace() {
  const [settings, setSettings] = useState(initialSettings);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notice, setNotice] = useState("");

  function update<K extends keyof SettingsValues>(key: K, value: SettingsValues[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Preview only: these settings have not been saved.");
  }

  return (
    <main className="min-h-screen bg-[#FFFCF3] px-5 pb-16 pt-7 text-[#4C5534] sm:px-8 lg:px-10 lg:pt-8">
      <div className="mx-auto max-w-[1100px]">
        <header className="flex flex-col gap-5 rounded-[22px] border border-[#80755F]/15 bg-[#F1EBDD] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="font-montserrat text-[9px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">Administration</p>
            <h1 className="mt-2 font-seasons text-[clamp(2.2rem,4vw,3.2rem)] leading-none text-[#4C5534]">Settings</h1>
            <p className="mt-3 max-w-xl font-montserrat text-[10px] leading-5 text-[#716D5E]">Manage clinic details, booking policies, and social links.</p>
          </div>
          <div className="rounded-2xl border border-[#80755F]/15 bg-[#FFFCF3]/75 p-4 sm:min-w-[220px]">
            <p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.14em] text-[#80755F]">Appearance</p>
            <button
              type="button"
              onClick={() => setIsDarkMode((current) => !current)}
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode (preview only)`}
              className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-[#4C5534]/20 bg-white px-4 font-montserrat text-[9px] font-semibold text-[#4C5534] transition-colors hover:bg-[#E8EEE3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C5534]"
            >
              {isDarkMode ? (
                <Icon><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></Icon>
              ) : (
                <Icon><path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" /></Icon>
              )}
              {isDarkMode ? "Light mode" : "Dark mode"}
            </button>
            <p className="mt-2 font-montserrat text-[8px] leading-4 text-[#80755F]">Proposal control only; the workspace appearance will not change.</p>
          </div>
        </header>

        <form onSubmit={submit} className="mt-5 space-y-5">
          <SettingsCard title="Clinic details" description="Contact and opening information shown to your clients.">
            <label>
              <span className={labelClassName}>Clinic name</span>
              <input value={settings.clinicName} onChange={(event) => update("clinicName", event.target.value)} className={inputClassName} placeholder="Enter clinic name" />
            </label>
            <label>
              <span className={labelClassName}>Phone</span>
              <input type="tel" value={settings.phone} onChange={(event) => update("phone", event.target.value)} className={inputClassName} placeholder="Enter clinic phone number" />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClassName}>Address</span>
              <textarea rows={2} value={settings.address} onChange={(event) => update("address", event.target.value)} className={`${inputClassName} py-3`} placeholder="Enter full clinic address" />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClassName}>Hours</span>
              <textarea rows={3} value={settings.hours} onChange={(event) => update("hours", event.target.value)} className={`${inputClassName} py-3`} placeholder={"Monday – Friday: 9:00 AM – 6:00 PM\nSaturday: 10:00 AM – 4:00 PM\nSunday: Closed"} />
            </label>
          </SettingsCard>

          <SettingsCard title="Booking policies" description="Set expectations for cancellations, deposits, and advance notice.">
            <label className="sm:col-span-2">
              <span className={labelClassName}>Cancellation policy</span>
              <textarea rows={4} value={settings.cancellationPolicy} onChange={(event) => update("cancellationPolicy", event.target.value)} className={`${inputClassName} py-3`} placeholder="Enter the cancellation and rescheduling policy" />
            </label>
            <label className="sm:col-span-2">
              <span className={labelClassName}>Deposit rules</span>
              <textarea rows={4} value={settings.depositRules} onChange={(event) => update("depositRules", event.target.value)} className={`${inputClassName} py-3`} placeholder="Enter deposit amounts, payment timing, and refund rules" />
            </label>
            <label>
              <span className={labelClassName}>Minimum booking notice</span>
              <input value={settings.minimumBookingNotice} onChange={(event) => update("minimumBookingNotice", event.target.value)} className={inputClassName} placeholder="e.g. 24 hours" />
            </label>
          </SettingsCard>

          <SettingsCard title="Social media links" description="Add the clinic’s social profiles. Leave a field blank if it does not apply.">
            <label>
              <span className={labelClassName}>Instagram</span>
              <input type="url" value={settings.instagram} onChange={(event) => update("instagram", event.target.value)} className={inputClassName} placeholder="https://instagram.com/..." />
            </label>
            <label>
              <span className={labelClassName}>Facebook</span>
              <input type="url" value={settings.facebook} onChange={(event) => update("facebook", event.target.value)} className={inputClassName} placeholder="https://facebook.com/..." />
            </label>
            <label>
              <span className={labelClassName}>TikTok</span>
              <input type="url" value={settings.tiktok} onChange={(event) => update("tiktok", event.target.value)} className={inputClassName} placeholder="https://tiktok.com/@..." />
            </label>
            <label>
              <span className={labelClassName}>Other social media links</span>
              <input value={settings.otherSocialLinks} onChange={(event) => update("otherSocialLinks", event.target.value)} className={inputClassName} placeholder="Add other profile links" />
            </label>
          </SettingsCard>

          <div className="flex flex-col items-start justify-between gap-3 rounded-[22px] border border-[#80755F]/15 bg-[#F3F0E6] p-5 sm:flex-row sm:items-center sm:px-7">
            <p className="font-montserrat text-[9px] leading-5 text-[#80755F]">Settings are for proposal preview only and are not connected to clinic data.</p>
            <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#4C5534] px-6 font-montserrat text-[9px] font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#35452F] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C5534]">
              <Icon><path d="M5 12l4 4L19 6" /></Icon>
              Preview save
            </button>
          </div>
        </form>
      </div>

      {notice && <p role="status" className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-[#80755F]/15 bg-[#F7F2E8] px-5 py-4 font-montserrat text-[10px] leading-5 text-[#4F6442] shadow-xl">{notice}</p>}
    </main>
  );
}
