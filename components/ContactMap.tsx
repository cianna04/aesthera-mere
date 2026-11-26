"use client";

import { useEffect, useState } from "react";
import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_KEY,
  readCookieConsent,
  type CookieConsent,
} from "@/lib/cookieConsent";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=14.5705298,121.0519195&z=16&output=embed";

export default function ContactMap() {
  const [consent, setConsent] = useState<CookieConsent>(null);
  const [ready, setReady] = useState(false);
  const [loadOnce, setLoadOnce] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setConsent(readCookieConsent());
      setReady(true);
    }, 0);

    const onConsentChange = (event: Event) => {
      setConsent((event as CustomEvent<CookieConsent>).detail);
      setLoadOnce(false);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== COOKIE_CONSENT_KEY) return;
      setConsent(readCookieConsent());
      setLoadOnce(false);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener(COOKIE_CONSENT_EVENT, onConsentChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (ready && (consent === "accepted" || loadOnce)) {
    return (
      <iframe
        title="Map to Aesthera Mère Beauty Creations"
        src={MAP_EMBED_URL}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="min-h-[340px] w-full border-0 md:min-h-[440px]"
      />
    );
  }

  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center p-8 text-center md:min-h-[440px]">
      <p className="font-seasons text-[28px] leading-tight text-[#4C5534]">Explore the neighborhood</p>
      <p className="mt-3 max-w-[340px] font-montserrat text-xs leading-6 text-[#6F7568]">
        The embedded map is optional and may use Google cookies. It will load only if you allow it.
      </p>
      <button
        type="button"
        onClick={() => setLoadOnce(true)}
        className="mt-5 min-h-11 rounded-full border border-[#4C5534] px-6 font-montserrat text-xs font-medium text-[#4C5534] transition-colors hover:bg-[#4C5534] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4C5534]"
      >
        Load Google Map once
      </button>
    </div>
  );
}
