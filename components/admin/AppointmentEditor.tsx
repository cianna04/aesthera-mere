"use client";

import { useEffect, type FormEvent, type ReactNode } from "react";

export type AppointmentFormRecord = {
  client: string;
  treatment: string;
  date: string;
  time: string;
  doctor: string;
  type: "Consultation" | "Treatment";
  source: string;
  phone: string;
  email: string;
  note: string;
};

const inputClass = "min-h-11 w-full rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3.5 font-montserrat text-[10px] text-[#354239] outline-none focus:border-[#344b38]/35 focus:ring-3 focus:ring-[#344b38]/8";
const doctors = ["Dr. Raine", "Dr. Dan", "Dr. Ian", "Non-doctor"];
const manualSources = ["Walk-in", "Phone", "Facebook", "Instagram"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid gap-2"><span className="font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#667068]">{label}</span>{children}</label>;
}

export default function AppointmentEditor({ appointment, defaultDate, onClose, onSubmit }: {
  appointment?: Partial<AppointmentFormRecord> | null;
  defaultDate: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const editing = Boolean(appointment);
  const legacyDoctor = appointment?.doctor && !doctors.includes(appointment.doctor) ? appointment.doctor : null;
  const legacySource = appointment?.source && !manualSources.includes(appointment.source) ? appointment.source : null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={editing ? "Edit appointment" : "New appointment"}>
      <button type="button" onClick={onClose} className="fixed inset-0 bg-[#172119]/55 backdrop-blur-sm" aria-label="Close appointment form" />
      <section className="relative my-5 w-full max-w-2xl rounded-[28px] bg-[#fbfaf6] p-6 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.14em] text-[#8a918a]">{editing ? "Update booking" : "Create booking"}</p><h2 className="font-seasons mt-2 text-3xl text-[#334b38]">{editing ? "Edit appointment" : "New appointment"}</h2></div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#edf0e9] text-[#536057]" aria-label="Close"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-4 w-4"><path d="M6 6l12 12M18 6 6 18" /></svg></button>
        </div>
        <form onSubmit={onSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label="Patient name"><input name="client" required autoFocus defaultValue={appointment?.client} className={inputClass} /></Field>
          <Field label="Treatment"><input name="treatment" required defaultValue={appointment?.treatment} className={inputClass} /></Field>
          <Field label="Date"><input name="date" required type="date" defaultValue={appointment?.date ?? defaultDate} className={inputClass} /></Field>
          <Field label="Time"><input name="time" required type="time" defaultValue={appointment?.time ?? "09:00"} className={inputClass} /></Field>
          <Field label="Doctor"><select name="doctor" defaultValue={appointment?.doctor ?? "Dr. Raine"} className={inputClass}>{legacyDoctor && <option>{legacyDoctor}</option>}{doctors.map((doctor) => <option key={doctor}>{doctor}</option>)}</select></Field>
          <Field label="Visit type"><select name="type" defaultValue={appointment?.type ?? "Treatment"} className={inputClass}><option>Treatment</option><option>Consultation</option></select></Field>
          <Field label="Booking source"><select name="source" defaultValue={appointment?.source ?? "Walk-in"} className={inputClass}>{legacySource && <option>{legacySource}</option>}{manualSources.map((source) => <option key={source}>{source}</option>)}</select></Field>
          <Field label="Phone"><input name="phone" type="tel" defaultValue={appointment?.phone} placeholder="+63 9…" className={inputClass} /></Field>
          <Field label="Email"><input name="email" type="email" defaultValue={appointment?.email} placeholder="patient@example.com" className={inputClass} /></Field>
          <div className="sm:col-span-2"><Field label="Booking note"><textarea name="note" rows={3} defaultValue={appointment?.note} className={`${inputClass} py-3`} /></Field></div>
          <div className="sm:col-span-2 flex flex-col-reverse gap-2 border-t border-[#334b39]/8 pt-4 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="min-h-11 rounded-full border border-[#334b39]/15 px-5 font-montserrat text-[9px] font-bold uppercase text-[#536057]">Discard</button>
            <button type="submit" className="min-h-11 rounded-full bg-[#344c38] px-6 font-montserrat text-[9px] font-bold uppercase tracking-[0.1em] text-white">{editing ? "Save changes" : "Create appointment"}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
