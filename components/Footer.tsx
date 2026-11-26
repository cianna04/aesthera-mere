
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpIcon, ChevronRightIcon } from "@/components/Icons";
import {
  COOKIE_CONSENT_KEY,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsent,
} from "@/lib/cookieConsent";

const GOOGLE_MAPS_URL =
  "https://www.google.com/maps/place/Aesthera+Mere+Beauty+Creations/@14.570535,121.0493446,17z/data=!4m8!3m7!1s0x3397c9ff0d4effff:0x8f90fb8a8325a1c2!8m2!3d14.5705298!4d121.0519195!9m1!1b1!16s%2Fg%2F11nb_t70wc";

const socialLinks = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/aestheramereph/",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/aestheramereph/",
  },
  {
    name: "TikTok",
    url: "https://www.tiktok.com/@aestheramere",
  },
];

function SocialIcon({ name }: { name: string }) {
  if (name === "Facebook") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="h-[17px] w-[17px]"
        aria-hidden="true"
      >
        <path d="M22 12a10 10 0 1 0-11.56 9.88v-7H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.25.2 2.25.2v2.47H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.88h-2.34v7A10 10 0 0 0 22 12Z" />
      </svg>
    );
  }

  if (name === "Instagram") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        className="h-[17px] w-[17px]"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="18"
          cy="6"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[17px] w-[17px]"
      aria-hidden="true"
    >
      <path d="M16.7 2h-3.2v13.3a3.3 3.3 0 1 1-2.8-3.27V8.76a6.5 6.5 0 1 0 6 6.48V8.5a8.3 8.3 0 0 0 4.9 1.45V5.34A5.1 5.1 0 0 1 16.7 2Z" />
    </svg>
  );
}

function FooterHeading({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <h3 className="font-seasons text-[22px] leading-tight text-[#4C5534] md:text-[24px]">
      {children}
    </h3>
  );
}

export default function Footer() {
  const [cookieVisible, setCookieVisible] = useState(false);
  const [cookieReady, setCookieReady] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>(null);
  const [year, setYear] = useState(2026);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const saved = readCookieConsent();
      setConsent(saved);
      setCookieVisible(saved === null);
      setCookieReady(true);
      setYear(new Date().getFullYear());
    }, 0);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== COOKIE_CONSENT_KEY) return;
      const saved = readCookieConsent();
      setConsent(saved);
      setCookieVisible(saved === null);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const saveConsent = (choice: Exclude<CookieConsent, null>) => {
    saveCookieConsent(choice);
    setConsent(choice);
    setCookieVisible(false);
  };

  return (
    <>
      <footer className="relative isolate overflow-hidden bg-[#FFFCF3] text-[#4C5534]">


{/* Ivory-to-olive gradient with overlapping circles */}
<div
  aria-hidden="true"
  className="pointer-events-none absolute inset-0 -z-10"
  style={{
    background:
      "linear-gradient(105deg, #FFFCF3 0%, #F6F3ED 28%, #E9EBDD 55%, #C7D2B5 100%)",
  }}
>
  {/* Large circle at upper-right */}
  <div
    className="absolute -right-[6%] -top-[45%] h-[360px] w-[360px] rounded-full bg-[#DCE5CC]/35"
  />

  {/* Main olive circle */}
  <div
    className="absolute right-[7%] top-[4%] h-[280px] w-[280px] rounded-full bg-[#A9BB93]/20"
  />


</div>


        {/* Footer content */}
        <div className="relative z-10 mx-auto max-w-[1280px] px-6 pb-3 pt-8 md:px-10 md:pt-10">

          {/* Four vertically aligned columns */}
          <div className="grid items-start gap-x-8 gap-y-6 border-b border-[#4C5534]/15 pb-7 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1.25fr] lg:gap-x-10">

            {/* Column 1: Branding */}
            <div className="flex flex-col items-start">
              <Link
                href="/"
                aria-label="Aesthera Mère homepage"
                className="inline-block"
              >
                <Image
                  src="/images/brand/logo_name.png"
                  alt="Aesthera Mère Beauty Creations"
                  width={2048}
                  height={342}
                  quality={90}
                  className="h-auto w-[225px] max-w-full"
                />
              </Link>

              <p className="mt-2 font-montserrat text-[12px] leading-6 text-[#4C5534]/85">
                Premium Aesthetic Care,
                <br />
                Made Accessible.
              </p>
            </div>

            {/* Column 2: Contact Us */}
            <div className="flex flex-col items-start">
              <FooterHeading>Contact Us</FooterHeading>
  {/* Social Media */}
            <div className="mt-3 flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Aesthera Mère on ${social.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4C5534]/35 text-[#4C5534] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#4C5534] hover:bg-[#4C5534] hover:text-white"
                >
                  <SocialIcon name={social.name} />
                </a>
              ))}
            </div>
              <p className="mt-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.17em] text-[#4C5534]/80">
                Phone Number
              </p>

              <a
                href="tel:+639189365679"
                className="mt-2 inline-flex items-center gap-2 font-montserrat text-[13px] leading-6 transition-colors hover:text-[#80632F]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7a2 2 0 0 1 1.73 2.03Z" />
                </svg>
                +63 918 936 5679
              </a>

            </div>

            {/* Column 3: Opening Hours */}
            <div className="flex flex-col items-start">
              <FooterHeading>Opening Hours</FooterHeading>

              <p className="mt-3 font-montserrat text-[13px] leading-[1.9]">
                Mon–Tue &amp; Thu–Sun
                <br />
                10:00 AM – 8:00 PM
              </p>

              <p className="mt-3 font-montserrat text-[13px] text-[#4C5534]/80">
                Wednesday — Closed
              </p>
            </div>

            {/* Column 4: Visit Us */}
            <div className="flex flex-col items-start">
              <FooterHeading>Visit Us</FooterHeading>

              <p className="mt-3 font-montserrat text-[10px] font-semibold uppercase tracking-[0.17em] text-[#4C5534]/80">
                Clinic Address
              </p>

              <address className="mt-2 font-montserrat text-[13px] not-italic leading-[1.9]">
                Unit 3 No. 4, Madison Square,
                <br />
                Pioneer St., Mandaluyong City,
                <br />
                Metro Manila, Philippines
              </address>

              <a
                href={GOOGLE_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 border-b border-[#4C5534]/35 pb-1 font-montserrat text-[12px] font-medium transition-all duration-300 hover:gap-3 hover:border-[#4C5534]"
              >
                Get Directions
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          {/* Bottom footer */}
          <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">

            {/* Copyright */}
            <div>
              <p className="font-montserrat text-[11px] text-[#4C5534]/85">
                © {year} Aesthera Mère. All rights reserved.
              </p>

            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 font-montserrat text-[11px] text-[#4C5534]">
              <Link
                href="/privacy-policy"
                className="transition-colors hover:text-[#80632F]"
              >
                Privacy Policy
              </Link>

              <Link
                href="/terms"
                className="transition-colors hover:text-[#80632F]"
              >
                Terms of Use
              </Link>

              <button
                type="button"
                onClick={() => setCookieVisible(true)}
                className="transition-colors hover:text-[#80632F]"
              >
                Cookie Settings
              </button>

              <button
                type="button"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#80632F]"
              >
                Back to Top
                <ArrowUpIcon className="h-3.5 w-3.5" />
              </button>
            </div>


          </div>
        </div>
      </footer>

      {/* Cookie Consent Banner */}
      {cookieReady && cookieVisible && (
        <div
          role="region"
          aria-label="Cookie preferences"
          className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-[680px] rounded-[16px] border border-[#80755F]/25 bg-[#FFFCF3] p-5 shadow-[0_12px_45px_rgba(76,85,52,0.18)] md:p-6"
        >
          <h2 className="font-seasons text-[28px] leading-tight text-[#4C5534]">
            Your Privacy Matters
          </h2>

          <p className="mt-2 font-montserrat text-[12px] leading-[1.8] text-[#80755F]">
            We store your preference in this browser. Allowing optional cookies
            loads the Google Map on our Contact page; declining keeps it off.
            You can change your choice here anytime.
          </p>

          {consent && <p className="mt-2 font-montserrat text-[11px] text-[#4C5534]" role="status">
            Current choice: {consent === "accepted" ? "Optional cookies allowed" : "Optional cookies declined"}
          </p>}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => saveConsent("accepted")}
              aria-pressed={consent === "accepted"}
              className="min-h-11 rounded-full bg-[#4C5534] px-6 py-3 font-montserrat text-[11px] font-medium text-[#FFFCF3] transition-colors hover:bg-[#4F6442]"
            >
              Accept Optional Cookies
            </button>

            <button
              type="button"
              onClick={() => saveConsent("rejected")}
              aria-pressed={consent === "rejected"}
              className="min-h-11 rounded-full border border-[#80755F] px-6 py-3 font-montserrat text-[11px] font-medium text-[#4C5534] transition-colors hover:bg-[#80755F] hover:text-white"
            >
              Reject Optional Cookies
            </button>
          </div>
        </div>
      )}
    </>
  );
}
