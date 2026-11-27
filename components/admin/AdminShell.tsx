"use client";

import Image from "next/image";
import { ChevronRightIcon } from "@/components/Icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode, type SVGProps } from "react";
import { ADMIN_LOGIN_PATH, ADMIN_SESSION_KEY, createAdminSession, isAdminSessionActive } from "@/lib/admin-session";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

const dashboardIcon = <Icon><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></Icon>;
const calendarIcon = <Icon><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></Icon>;
const peopleIcon = <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></Icon>;
const contentIcon = <Icon><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 8h10M7 12h10M7 16h6" /></Icon>;
const settingsIcon = <Icon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.38.35.72.6 1 .3.29.68.43 1.1.4H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z" /></Icon>;

const navigationSections = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/admin", icon: dashboardIcon },
      { label: "Appointments", href: "/admin/appointments", icon: calendarIcon, count: "5" },
      { label: "Calendar", href: "/admin/calendar", icon: calendarIcon },
      { label: "Patients", href: "/admin/patients", icon: peopleIcon },
    ],
  },
  {
    label: "Website", 
    items: [
      { label: "Doctors", href: "/admin/doctors", icon: peopleIcon },
      { label: "Treatments", href: "/admin/treatments", icon: <Icon><circle cx="12" cy="12" r="9" /><path d="M12 7v10M7 12h10" /></Icon> },
      { label: "Promotions", href: "/admin/promotions", icon: <Icon><path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-7M2 7h20v5H2zM12 7v14" /></Icon> },
      { label: "Results", href: "/admin/results", icon: <Icon><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></Icon> },
      { label: "Testimonials", href: "/admin/testimonials", icon: <Icon><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z" /></Icon> },
      { label: "Content", href: "/admin/content", icon: contentIcon },
    ],

  },
  {
    label: "Administration",
    items: [
      { label: "Messages", href: "/admin#module-map", icon: <Icon><path d="M4 4h16v12H7l-3 3Z" /></Icon> },
      { label: "Reports", href: "/admin/reports", icon: <Icon><path d="M4 19V9M10 19V5M16 19v-7M22 19V3" /></Icon> },
      { label: "Users & roles", href: "/admin/users", icon: peopleIcon },
      { label: "Settings", href: "/admin/settings", icon: settingsIcon },
      { label: "Audit log", href: "/admin#module-map", icon: <Icon><path d="M9 12l2 2 4-4" /><path d="M12 22a10 10 0 1 0-9.5-7" /></Icon> },
    ],
  },
];

function SidebarContent({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#29382b] text-[#f8f4eb]">
      <div className="flex h-[86px] items-center justify-between gap-3 border-b border-white/10 px-5 xl:px-7">
        <Link href="/admin" onClick={onNavigate} className="inline-flex items-center gap-3 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white">
          <Image src="/images/brand/logo_white.png" alt="" width={42} height={42} className="h-10 w-10 object-contain" priority />
          <span>
            <span className="font-seasons block text-[22px] leading-none tracking-[0.01em]">Aesthera Mère</span>
            <span className="mt-1.5 block font-montserrat text-[8px] font-medium uppercase tracking-[0.28em] text-[#cdbd9f]">Admin studio</span>
          </span>
        </Link>
        {onNavigate && (
          <button type="button" onClick={onNavigate} aria-label="Close admin navigation" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
            <Icon className="h-5 w-5"><path d="M6 6l12 12M18 6 6 18" /></Icon>
          </button>
        )}
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-4 py-6 [scrollbar-color:rgba(216,199,167,0.45)_transparent] [scrollbar-width:thin]">
        {navigationSections.map((section, index) => (
          <div key={section.label} className={index === 0 ? "" : "mt-6"}>
            <p className="px-3 font-montserrat text-[9px] font-semibold uppercase tracking-[0.24em] text-white/40">{section.label}</p>
            <div className="mt-2 space-y-0.5">
              {section.items.map((item) => {
                const active = item.href.includes("#")
                  ? false
                  : pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 font-montserrat text-[11px] font-medium transition-colors ${active ? "bg-white text-[#29382b]" : "text-white/70 hover:bg-white/8 hover:text-white"}`}
                  >
                    <span className={`h-[17px] w-[17px] shrink-0 ${active ? "text-[#58705a]" : "text-[#cdbd9f]"}`}>{item.icon}</span>
                    <span>{item.label}</span>
                    {item.count && <span className={`ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold ${active ? "bg-[#e7eee4] text-[#3c5540]" : "bg-white/10 text-white/70"}`}>{item.count}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 p-4 pt-0">
        <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8c7a7] font-seasons text-base font-semibold text-[#29382b]">AM</span>
            <span className="min-w-0">
              <span className="block truncate font-montserrat text-[11px] font-semibold">Clinic administrator</span>
              <span className="mt-0.5 block font-montserrat text-[9px] text-white/45">Clinic workspace</span>
            </span>
          </div>
          <Link href="/" onClick={onNavigate} className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-[#d8c7a7] transition-colors hover:text-white">
            View website
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
          <button type="button" onClick={onLogout} className="mt-3 flex w-full cursor-pointer items-center justify-between font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-[#f8f4eb]/80 transition-colors hover:text-white">
            Log out
            <Icon className="h-4 w-4"><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-6" /></Icon>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === ADMIN_LOGIN_PATH) return children;

  return <AdminSessionGate>{children}</AdminSessionGate>;
}

function AdminSessionGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let lastTouch = 0;
    function signOut() {
      try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* Storage may be unavailable. */ }
      setChecked(false);
      router.replace(ADMIN_LOGIN_PATH);
    }
    function checkSession(refresh = false) {
      try {
        const saved = sessionStorage.getItem(ADMIN_SESSION_KEY);
        if (!isAdminSessionActive(saved)) { signOut(); return; }
        if (saved === "1" || (refresh && Date.now() - lastTouch > 30_000)) {
          sessionStorage.setItem(ADMIN_SESSION_KEY, createAdminSession());
          lastTouch = Date.now();
        }
        setChecked(true);
      } catch { signOut(); }
    }
    const frame = window.requestAnimationFrame(() => {
      checkSession();
    });
    const onActivity = () => checkSession(true);
    const onVisible = () => { if (document.visibilityState === "visible") checkSession(true); };
    for (const event of ["pointerdown", "keydown", "scroll", "pointermove"] as const) window.addEventListener(event, onActivity, { passive: true });
    document.addEventListener("visibilitychange", onVisible);
    const interval = window.setInterval(() => checkSession(), 30_000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(interval);
      for (const event of ["pointerdown", "keydown", "scroll", "pointermove"] as const) window.removeEventListener(event, onActivity);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  function logOut() {
    try { sessionStorage.removeItem(ADMIN_SESSION_KEY); } catch { /* Storage may be unavailable. */ }
    setChecked(false);
    router.replace(ADMIN_LOGIN_PATH);
  }

  return checked ? <AdminWorkspaceShell onLogout={logOut}>{children}</AdminWorkspaceShell> : null;
}

function AdminWorkspaceShell({ children, onLogout }: { children: ReactNode; onLogout: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-dvh bg-[#f4f1ea] text-[#28332b]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] xl:block">
        <SidebarContent onLogout={onLogout} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Admin navigation">
          <button type="button" className="absolute inset-0 bg-[#172119]/55 backdrop-blur-sm" aria-label="Close admin navigation" onClick={() => setMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-[min(86vw,320px)] shadow-2xl">
            <SidebarContent onNavigate={() => setMenuOpen(false)} onLogout={onLogout} />
          </aside>
        </div>
      )}

      <div className="xl:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[72px] items-center border-b border-[#2f4434]/10 bg-[#f4f1ea]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10 xl:h-[86px]">
          <button type="button" onClick={() => setMenuOpen(true)} className="mr-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#2f4434]/15 bg-white text-[#344b38] xl:hidden" aria-label="Open admin navigation">
            <Icon className="h-5 w-5"><path d="M4 7h16M4 12h16M4 17h16" /></Icon>
          </button>

          <label className="hidden w-full max-w-[360px] items-center gap-3 rounded-full border border-[#2f4434]/10 bg-white/70 px-4 py-2.5 text-[#6f786f] md:flex">
            <Icon className="h-4 w-4 shrink-0"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></Icon>
            <span className="sr-only">Search admin</span>
            <input type="search" disabled title="Search is unavailable" placeholder="Search patients, bookings, treatments…" className="w-full cursor-not-allowed bg-transparent font-montserrat text-[11px] text-[#28332b] outline-none placeholder:text-[#8c918b]" />
          </label>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <button type="button" disabled title="Notifications are unavailable" aria-label="Notifications" className="relative flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-full border border-[#2f4434]/10 bg-white/75 text-[#45584a]">
              <Icon className="h-[18px] w-[18px]"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" /></Icon>
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#a47a55] ring-2 ring-white" />
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#344b38] font-seasons text-sm font-semibold text-white">AM</span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
