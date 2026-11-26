
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PrivacySectionNav from "@/components/PrivacySectionNav";

export const metadata: Metadata = {
  title: "Privacy Policy | Aesthera Mère",
  description:
    "Learn how Aesthera Mère handles appointment previews, browser storage, external services, and privacy requests.",
};

const sections = [
  { id: "responsible", title: "Who is responsible" },
  { id: "information", title: "Information you enter" },
  { id: "contact", title: "Contacting the clinic" },
  { id: "storage", title: "Cookies & outside services" },
  { id: "retention", title: "How long information remains" },
  { id: "rights", title: "Your privacy rights" },
  { id: "updates", title: "Changes to this policy" },
];

const sectionClass =
  "scroll-mt-32 border-b border-[#4C5534]/15 py-8 first:pt-0 last:border-b-0 md:py-10";
const headingClass =
  "font-seasons text-[clamp(1.7rem,2.8vw,2.3rem)] leading-[1.2] text-[#4C5534]";

const bodyClass =
  "mt-4 font-montserrat text-[14px] leading-[1.9] text-[#696D5C] md:text-[15px]";

const linkClass =
  "font-medium text-[#4C5534] underline decoration-[#B7A47D] underline-offset-4 transition-colors hover:text-[#A68B58]";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FFFCF3] text-[#4C5534]">
        <div className="mx-auto max-w-[1200px] px-6 pb-20 pt-10 md:px-10 md:pb-28 md:pt-14">

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="font-montserrat text-[11px] uppercase tracking-[0.16em] text-[#80755F]"
          >
            <Link
              href="/"
              className="transition-colors hover:text-[#4C5534]"
            >
              Home
            </Link>

            <span className="mx-3" aria-hidden="true">
              /
            </span>

            <span aria-current="page" className="text-[#4C5534]">
              Privacy Policy
            </span>
          </nav>

          {/* Page Heading */}
          <header className="max-w-[850px] pb-10 pt-10 md:pb-14 md:pt-14">
            <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.23em] text-[#80755F]">
              Aesthera Mère Beauty Creations
            </p>

            <h1 className="mt-4 font-seasons text-[clamp(3.5rem,7vw,5.8rem)] leading-[1.05] tracking-[-0.025em]">
              Privacy Policy
            </h1>

            <p className="mt-6 max-w-[720px] font-montserrat text-[15px] leading-[1.9] text-[#696D5C]">
              Your privacy matters to us. This notice explains
              how our website handles the information you enter,
              your browser preferences, and interactions with
              external services.
            </p>

            <p className="mt-5 font-montserrat text-[12px] text-[#80755F]">
              Last updated: 23 November 2026
            </p>
          </header>

          {/* Main Content */}
          <div className="grid items-start gap-10 border-t border-[#4C5534]/20 pt-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-14 lg:gap-20">


{/* Sticky Desktop Navigation */}
<aside className="hidden self-start md:sticky md:top-28 md:block md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
  <PrivacySectionNav />
</aside>


            {/* Policy Content */}
            <article className="min-w-0 max-w-[780px]">

              {/* Mobile Navigation */}
              <nav
                aria-label="Privacy policy sections"
                className="mb-8 rounded-xl bg-[#F6F3ED] p-5 md:hidden"
              >
                <p className="mb-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.15em]">
                  On This Page
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-3">
                  {sections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="font-montserrat text-[12px] leading-5 text-[#80755F] underline decoration-[#B6A47D] underline-offset-4"
                    >
                      {section.title}
                    </a>
                  ))}
                </div>
              </nav>

              <section id="responsible" className={sectionClass}>
                <h2 className={headingClass}>
                  Who is responsible
                </h2>

                <p className={bodyClass}>
                  Aesthera Mère Beauty Creations is the clinic
                  identified on this website.
                </p>

                <p className={bodyClass}>
                  For privacy-related questions or requests,
                  you may contact us at{" "}
                  <a
                    href="tel:+639189365679"
                    className={linkClass}
                  >
                    +63 918 936 5679
                  </a>
                  {" "}or visit our clinic at Unit 3 No. 4,
                  Madison Square, Pioneer St.,
                  Mandaluyong City, Metro Manila.
                </p>
              </section>

              <section id="information" className={sectionClass}>
                <h2 className={headingClass}>
                  Information you enter
                </h2>

                <p className={bodyClass}>
                  Our appointment form may ask for your name,
                  contact number, email address, appointment
                  type, preferred date and time, and, where
                  relevant, your preferred treatment, doctor,
                  and optional notes.
                </p>

                <p className={bodyClass}>
                  Currently, this information is used to
                  display an appointment preview in your
                  browser. The preview is not submitted or
                  saved as a confirmed appointment by the
                  website. Closing or reloading the page
                  clears the form state.
                </p>

                <div className="mt-6 rounded-[14px] border-l-[3px] border-[#B6A47D] bg-[#F6F3ED] px-5 py-4">
                  <p className="font-montserrat text-[13px] leading-[1.9] text-[#4C5534]">
                    Please avoid entering sensitive medical
                    information in the optional notes.
                    To arrange an appointment or discuss
                    your care, contact the clinic directly.
                  </p>
                </div>
              </section>

              <section id="contact" className={sectionClass}>
                <h2 className={headingClass}>
                  Contacting the clinic
                </h2>

                <p className={bodyClass}>
                  If you contact us by phone, messaging
                  applications, social media, or in person,
                  you may provide information needed to
                  respond to your inquiry or arrange services.
                </p>

                <p className={bodyClass}>
                  These communications take place separately
                  from the website&apos;s appointment preview.
                  For details about how information shared
                  directly with the clinic is recorded,
                  protected, or retained, please contact
                  the clinic before sharing sensitive details.
                </p>
              </section>

              <section id="storage" className={sectionClass}>
                <h2 className={headingClass}>
                  Cookies & outside services
                </h2>

                <p className={bodyClass}>
                  Our website stores your cookie preference
                  in your browser&apos;s local storage under
                  the key{" "}
                  <span className="break-all font-medium text-[#4C5534]">
                    aesthera-cookie-consent
                  </span>.
                  {" "}You can update this preference
                  through Cookie Settings in the footer.
                </p>

                <p className={bodyClass}>
                  Allowing optional cookies enables the embedded
                  Google Map on our Contact page. Declining keeps
                  the map off unless you choose to load it once.
                  The website does not run analytics or advertising
                  scripts.
                </p>

                <p className={bodyClass}>
                  Loading the embedded map may allow Google
                  to receive technical information about
                  your visit and use its own cookies or
                  similar technologies.
                </p>

                <p className={bodyClass}>
                  Links to Google Maps, Facebook, Instagram,
                  TikTok, WhatsApp, or Viber open external
                  services governed by their own privacy
                  notices. The website&apos;s hosting provider
                  may also process technical information
                  necessary to deliver the website.
                </p>
              </section>

              <section id="retention" className={sectionClass}>
                <h2 className={headingClass}>
                  How long information remains
                </h2>

                <p className={bodyClass}>
                  Appointment preview details are maintained
                  only in the current page session and are
                  not saved by this website.
                </p>

                <p className={bodyClass}>
                  Your cookie preference remains in browser
                  storage until you clear it or replace
                  your choice through Cookie Settings.
                </p>

                <p className={bodyClass}>
                  Retention of information provided directly
                  to the clinic or to external services
                  depends on their respective practices.
                  Please contact the clinic or the relevant
                  service for more information.
                </p>
              </section>

              <section id="rights" className={sectionClass}>
                <h2 className={headingClass}>
                  Your privacy rights
                </h2>

                <p className={bodyClass}>
                  Under the Philippine Data Privacy Act of
                  2012, you have certain rights concerning
                  your personal information, subject to
                  applicable legal requirements.
                </p>

                <ul className="mt-5 list-disc space-y-3 pl-5 font-montserrat text-[14px] leading-[1.8] text-[#696D5C] marker:text-[#B6A47D]">
                  <li>Be informed about how your personal data is processed.</li>
                  <li>Request access to your personal information.</li>
                  <li>Request correction of inaccurate or incomplete information.</li>
                  <li>Object to certain processing activities.</li>
                  <li>Request erasure or blocking where applicable.</li>
                  <li>Request data portability where applicable.</li>
                  <li>Seek damages or file a privacy complaint where warranted.</li>
                </ul>

                <p className={bodyClass}>
                  To make a privacy-related request, contact
                  the clinic using the contact details
                  provided above.
                </p>

                <p className={bodyClass}>
                  You may also learn more about your rights
                  through the{" "}
                  <a
                    href="https://privacy.gov.ph/data-subject-rights/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClass}
                  >
                    National Privacy Commission
                  </a>.
                </p>
              </section>

              <section id="updates" className={sectionClass}>
                <h2 className={headingClass}>
                  Changes to this policy
                </h2>

                <p className={bodyClass}>
                  We may update this Privacy Policy when
                  website features, data handling practices,
                  or applicable requirements change.
                </p>

                <p className={bodyClass}>
                  When this page is revised, the last
                  updated date shown above will be changed
                  to reflect the revision.
                </p>
              </section>

            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
