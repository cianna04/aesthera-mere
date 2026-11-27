"use client";

import { useMemo, useState, type SVGProps } from "react";
import AdminSelect from "@/components/admin/AdminSelect";

type IconProps = SVGProps<SVGSVGElement>;
type Patient = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  email: string;
  birthday: string;
  firstVisit: string;
  lastVisit: string;
  visits: number;
  status: "Active" | "New" | "Inactive";
  source: string;
  treatment: string;
  doctor: string;
  notes: string;
};

const initialPatients: Patient[] = [
  { id: "PAT-1001", name: "Sofia Reyes", initials: "SR", phone: "+63 917 410 2381", email: "sofia.reyes@example.com", birthday: "June 14, 1994", firstVisit: "August 12, 2026", lastVisit: "November 23, 2026", visits: 5, status: "Active", source: "Instagram", treatment: "Oxy Radiance Facial", doctor: "Dr. Raine", notes: "Prefers afternoon appointments. Sensitive skin noted during consultation." },
  { id: "PAT-1002", name: "Bianca Lim", initials: "BL", phone: "+63 917 882 1045", email: "bianca.lim@example.com", birthday: "February 3, 1990", firstVisit: "November 23, 2026", lastVisit: "November 23, 2026", visits: 1, status: "New", source: "Website", treatment: "Skin consultation", doctor: "Dr. Dan", notes: "First consultation. Interested in a long-term skin plan." },
  { id: "PAT-1003", name: "Mika Santos", initials: "MS", phone: "+63 917 330 4720", email: "mika.santos@example.com", birthday: "September 22, 1996", firstVisit: "September 4, 2026", lastVisit: "November 23, 2026", visits: 3, status: "Active", source: "Referral", treatment: "Thera JuveLook", doctor: "Dr. Raine", notes: "Follow-up photos and consent are due at the next visit." },
  { id: "PAT-1004", name: "Claire Yu", initials: "CY", phone: "+63 917 225 6098", email: "claire.yu@example.com", birthday: "December 8, 1988", firstVisit: "July 18, 2026", lastVisit: "November 23, 2026", visits: 4, status: "Active", source: "Facebook", treatment: "Ultraformer MPT", doctor: "Dr. Dan", notes: "Completed initial consultation and treatment consent." },
  { id: "PAT-1005", name: "Andrea Cruz", initials: "AC", phone: "+63 917 551 9072", email: "andrea.cruz@example.com", birthday: "April 19, 1998", firstVisit: "October 11, 2026", lastVisit: "November 12, 2026", visits: 2, status: "Active", source: "Instagram", treatment: "Aqua Reset Facial", doctor: "Dr. Raine", notes: "Requested reminder one day before appointments." },
  { id: "PAT-1006", name: "Lara Tan", initials: "LT", phone: "+63 917 143 8860", email: "lara.tan@example.com", birthday: "January 30, 1992", firstVisit: "March 2, 2026", lastVisit: "August 17, 2026", visits: 6, status: "Inactive", source: "Walk-in", treatment: "Botox", doctor: "Dr. Dan", notes: "No upcoming appointment. Last visit completed without concerns." },
];

const statusClass: Record<Patient["status"], string> = {
  Active: "bg-[#e7efe5] text-[#4d6e54]",
  New: "bg-[#f3eadb] text-[#85683d]",
  Inactive: "bg-[#eceae6] text-[#77766f]",
};

function Icon({ children, ...props }: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...props}>{children}</svg>;
}

export default function PatientsWorkspace() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All patients");
  const [selectedId, setSelectedId] = useState(initialPatients[0].id);
  const [tab, setTab] = useState<"overview" | "history" | "documents">("overview");
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    return initialPatients.filter((patient) =>
      (!search || [patient.name, patient.phone, patient.email, patient.id].some((value) => value.toLowerCase().includes(search))) &&
      (status === "All patients" || patient.status === status),
    );
  }, [query, status]);
  const selected = initialPatients.find((patient) => patient.id === selectedId) ?? visible[0] ?? null;

  return (
    <main className="px-5 pb-16 pt-7 sm:px-8 lg:px-10 lg:pt-10">
      <div className="mx-auto max-w-[1460px]">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2"><p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7a8079]">Clinic records</p></div>
            <h1 className="font-seasons mt-3 text-[clamp(2.4rem,4vw,3.7rem)] leading-none text-[#2e4433]">Patients</h1>
          </div>
          <button type="button" className="inline-flex w-fit items-center gap-2 rounded-full bg-[#344c38] px-5 py-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-white"><Icon className="h-4 w-4"><path d="M12 5v14M5 12h14" /></Icon>Add patient</button>
        </header>

        <section aria-label="Patient summary" className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[["128", "Patients this month"], ["06", "Patient records"], ["05", "Active patients"], ["01", "Follow-up needed"]].map(([value, label], index) => <article key={label} className={`rounded-2xl border p-4 sm:p-5 ${index === 3 ? "border-[#b89a6d]/20 bg-[#eee4d3]" : "border-[#334b39]/10 bg-white/70"}`}><p className="font-seasons text-2xl text-[#334b38] sm:text-3xl">{value}</p><p className="mt-2 font-montserrat text-[9px] font-semibold sm:text-[10px]">{label}</p></article>)}
        </section>

        <section className="mt-5 overflow-hidden rounded-[24px] border border-[#334b39]/10 bg-white/75">
          <div className="grid min-h-[680px] xl:grid-cols-[minmax(0,1fr)_390px]">
            <div className="min-w-0 xl:border-r xl:border-[#334b39]/10">
              <div className="grid gap-3 border-b border-[#334b39]/10 p-4 sm:grid-cols-[minmax(220px,1fr)_180px] sm:p-5">
                <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[#334b39]/10 bg-[#f7f6f1] px-3"><span className="sr-only">Search patients</span><Icon className="h-4 w-4 text-[#778078]"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone, or email…" className="w-full bg-transparent font-montserrat text-[10px] outline-none" /></label>
                <AdminSelect label="Filter patient status" value={status} onChange={setStatus} filterIcon options={[{ value: "All patients", label: "All patients" }, { value: "Active", label: "Active" }, { value: "New", label: "New" }, { value: "Inactive", label: "Inactive" }]} />
              </div>
              <div className="hidden grid-cols-[1.3fr_1fr_1fr_90px] border-b border-[#334b39]/8 bg-[#faf9f5] px-5 py-3 font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#8c918c] md:grid"><span>Patient</span><span>Last treatment</span><span>Last visit</span><span>Status</span></div>
              <div className="divide-y divide-[#334b39]/7">
                {visible.map((patient) => <button key={patient.id} type="button" onClick={() => { setSelectedId(patient.id); setTab("overview"); }} className={`grid w-full gap-3 px-4 py-4 text-left transition-colors sm:px-5 md:grid-cols-[1.3fr_1fr_1fr_90px] md:items-center ${selected?.id === patient.id ? "bg-[#eef2eb]" : "hover:bg-[#faf9f5]"}`}><span className="flex min-w-0 items-center gap-3"><i className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e3e9df] font-montserrat text-[9px] font-bold not-italic text-[#526b56]">{patient.initials}</i><span className="min-w-0"><b className="block truncate font-montserrat text-[10px] text-[#39473d]">{patient.name}</b><small className="mt-1 block font-montserrat text-[8px] text-[#92978f]">{patient.id} · {patient.visits} visits</small></span></span><span className="font-montserrat text-[9px] text-[#59625b]">{patient.treatment}<small className="mt-1 block text-[8px] text-[#92978f]">{patient.doctor}</small></span><span className="font-montserrat text-[9px] text-[#59625b]">{patient.lastVisit}</span><span><i className={`rounded-full px-2.5 py-1.5 font-montserrat text-[8px] font-bold uppercase not-italic ${statusClass[patient.status]}`}>{patient.status}</i></span></button>)}
                {!visible.length && <div className="grid min-h-[360px] place-items-center text-center"><div><p className="font-seasons text-2xl">No patients found</p><p className="mt-2 font-montserrat text-[10px] text-[#8a9089]">Try another search or status.</p></div></div>}
              </div>
            </div>

            <aside className="bg-[#f8f6f0] p-5 sm:p-6">
              {selected ? <><div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#344b38] font-seasons text-lg text-white">{selected.initials}</span><span><h2 className="font-seasons text-2xl text-[#2e4433]">{selected.name}</h2><small className="font-montserrat text-[8px] text-[#8b918b]">{selected.id}</small></span></div><span className={`rounded-full px-2.5 py-1.5 font-montserrat text-[8px] font-bold uppercase ${statusClass[selected.status]}`}>{selected.status}</span></div>
                <div className="mt-6 flex rounded-full bg-[#e9ebe5] p-1">{(["overview", "history", "documents"] as const).map((name) => <button key={name} type="button" onClick={() => setTab(name)} className={`min-h-9 flex-1 rounded-full px-2 font-montserrat text-[8px] font-bold uppercase tracking-[0.08em] transition-all ${tab === name ? "bg-white text-[#405b45] shadow-sm" : "text-[#8b918b] hover:text-[#526557]"}`}>{name}</button>)}</div>
                {tab === "overview" && <div className="mt-5"><dl className="grid gap-2 sm:grid-cols-2">{[["Phone", selected.phone], ["Email", selected.email], ["Birthday", selected.birthday], ["Source", selected.source], ["First visit", selected.firstVisit]].map(([label, value], index) => <div key={label} className={`rounded-2xl bg-white/75 p-4 ${index === 4 ? "sm:col-span-2" : ""}`}><dt className="font-montserrat text-[7px] font-semibold uppercase tracking-[0.1em] text-[#9a9f99]">{label}</dt><dd className="mt-2 break-words font-montserrat text-[9px] font-semibold leading-4 text-[#405047]">{value}</dd></div>)}</dl><div className="mt-3 rounded-2xl bg-[#e7e5dc] p-4"><p className="font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-[#7f817b]">Clinic note</p><p className="mt-2 font-montserrat text-[9px] leading-5 text-[#59625b]">{selected.notes}</p></div></div>}
                {tab === "history" && <div className="mt-5 space-y-3"><History date={selected.lastVisit} title={selected.treatment} detail={`${selected.doctor} · Most recent visit`} /><History date={selected.firstVisit} title="Patient record created" detail={`${selected.source} booking source`} /></div>}
                {tab === "documents" && <div className="mt-5 space-y-3"><Document title="Treatment consent" status="Signed" /><Document title="Before & after consent" status={selected.id === "PAT-1003" ? "Required" : "On file"} /><Document title="Consultation notes" status="On file" /></div>}
                <button type="button" className="mt-5 min-h-11 w-full rounded-full bg-[#344c38] font-montserrat text-[8px] font-bold uppercase tracking-[0.1em] text-white">Book next appointment</button>
              </> : <p className="font-seasons text-xl">Select a patient record</p>}
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function History({ date, title, detail }: { date: string; title: string; detail: string }) {
  return <div className="rounded-2xl border border-[#334b39]/10 bg-white/70 p-4"><p className="font-montserrat text-[8px] uppercase text-[#92978f]">{date}</p><p className="mt-2 font-montserrat text-[10px] font-semibold text-[#3e4c42]">{title}</p><p className="mt-1 font-montserrat text-[8px] text-[#8a9089]">{detail}</p></div>;
}

function Document({ title, status }: { title: string; status: string }) {
  const warning = status === "Required";
  return <div className="flex items-center justify-between rounded-2xl border border-[#334b39]/10 bg-white/70 p-4"><span className="flex items-center gap-3"><i className="grid h-9 w-9 place-items-center rounded-full bg-[#e7ece4] text-[#58705b]"><Icon className="h-4 w-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></Icon></i><b className="font-montserrat text-[9px]">{title}</b></span><small className={`font-montserrat text-[8px] font-bold uppercase ${warning ? "text-[#9a7046]" : "text-[#5b765f]"}`}>{status}</small></div>;
}
