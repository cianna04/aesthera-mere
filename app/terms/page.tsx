
import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TermsSectionNav from "@/components/TermsSectionNav";
import { CalendarIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Terms of Use | Aesthera Mère",
  description:
    "Read the terms governing use of the Aesthera Mère website, treatment information, appointment previews, promotions, and external services.",
};

const sections = [
  { id: "acceptance", title: "Acceptance of terms" },
  { id: "website", title: "Website information" },
  { id: "appointments", title: "Appointments & inquiries" },
  { id: "treatments", title: "Treatments & results" },
  { id: "pricing", title: "Pricing & promotions" },
  { id: "conduct", title: "Acceptable use" },
  { id: "external", title: "External services" },
  { id: "ownership", title: "Intellectual property" },
  { id: "disclaimer", title: "Website disclaimers" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact information" },
];

const sectionClass =
  "scroll-mt-32 border-b border-[#4C5534]/15 py-8 first:pt-0 last:border-b-0 md:py-10";

const headingClass =
  "font-seasons text-[clamp(1.7rem,2.8vw,2.3rem)] leading-[1.2] text-[#4C5534]";

const bodyClass =
  "mt-4 font-montserrat text-[14px] leading-[1.9] text-[#696D5C] md:text-[15px]";

const linkClass =
  "font-medium text-[#4C5534] underline decoration-[#B7A47D] underline-offset-4 transition-colors hover:text-[#A68B58]";

export default function TermsPage() {
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

            <span
              aria-hidden="true"
              className="mx-3"
            >
              /
            </span>

            <span
              aria-current="page"
              className="text-[#4C5534]"
            >
              Terms of Use
            </span>
          </nav>

          {/* Page Header */}
          <header className="mx-auto max-w-[850px] pb-10 pt-10 text-center md:pb-14 md:pt-14">
            <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.16em] text-[#80755F]">
              Aesthera Mère Beauty Creations
            </p>

            <h1 className="mt-4 font-seasons text-[clamp(3.4rem,5.5vw,5.2rem)] leading-[1.05] tracking-[-0.025em]">
              Terms of Use
            </h1>

            <p className="mx-auto mt-2 max-w-[720px] font-montserrat text-[14px] leading-[1.8] text-[#696D5C] md:text-[15px]">
             These terms explain the conditions for using our website, browsing treatment information, viewing promotions, and making inquiries about our aesthetic services.
            </p>

            <p className="mt-5 flex items-center justify-center gap-2 font-montserrat text-[12px] text-[#80755F]">
              <CalendarIcon className="h-4 w-4 shrink-0" />
              Last updated: 23 November 2026
            </p>
          </header>

          {/* Main Layout */}
          <div className="grid items-start gap-10 border-t border-[#4C5534]/20 pt-10 md:grid-cols-[220px_minmax(0,1fr)] md:gap-14 lg:gap-20">


{/* Sticky Desktop Navigation */}
<aside className="hidden self-start md:sticky md:top-28 md:block md:max-h-[calc(100vh-8rem)] md:overflow-y-auto">
  <TermsSectionNav />
</aside>


            {/* Terms Content */}
            <article className="min-w-0 max-w-[780px]">

              {/* Mobile Navigation */}
              <nav
                aria-label="Terms of use sections"
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

              {/* 1. Acceptance */}
              <section
                id="acceptance"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Acceptance of terms
                </h2>

                <p className={bodyClass}>
                  Welcome to the official website of
                  Aesthera Mère Beauty Creations.
                  By accessing or using this website,
                  you agree to comply with these Terms
                  of Use and applicable laws.
                </p>

                <p className={bodyClass}>
                  If you do not agree with these terms,
                  please discontinue using the website.
                  These terms concern the website and
                  do not replace any separate agreements
                  or consent forms required for
                  clinic services.
                </p>
              </section>

              {/* 2. Website Information */}
              <section
                id="website"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Website information
                </h2>

                <p className={bodyClass}>
                  This website provides general information
                  about Aesthera Mère, including our
                  treatments, aesthetic services,
                  clinic location, operating hours,
                  promotions, and contact details.
                </p>

                <p className={bodyClass}>
                  We aim to keep the information accurate
                  and updated. However, service descriptions,
                  availability, schedules, and other
                  website content may change.
                </p>

                <p className={bodyClass}>
                  Visitors are encouraged to contact
                  the clinic directly to confirm
                  information before making arrangements.
                </p>
              </section>

              {/* 3. Appointments */}
              <section
                id="appointments"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Appointments & inquiries
                </h2>

                <p className={bodyClass}>
                  Our website may provide an appointment
                  form allowing visitors to select
                  preferred services, dates, times,
                  and other appointment details.
                </p>

                <p className={bodyClass}>
                  In the current website version,
                  this form displays an appointment
                  preview only. It does not automatically
                  submit, reserve, or confirm
                  an appointment.
                </p>

                <p className={bodyClass}>
                  <strong className="font-semibold text-[#4C5534]">Important:</strong>{" "}
                  An appointment preview is not a confirmed booking.
                  Please contact the clinic directly to arrange and confirm an appointment.
                </p>

                <p className={bodyClass}>
                  Appointment availability may depend
                  on clinic schedules, treatment
                  availability, and the availability
                  of the relevant healthcare or
                  aesthetic professional.
                </p>

                <p className={bodyClass}>
                  The appointment form is not intended
                  for emergencies or urgent
                  medical concerns.
                </p>
              </section>

              {/* 4. Treatments */}
              <section
                id="treatments"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Treatments & results
                </h2>

                <p className={bodyClass}>
                  Treatment descriptions, expected
                  benefits, estimated durations,
                  downtime information, and other
                  details on this website are
                  provided for general
                  informational purposes.
                </p>

                <p className={bodyClass}>
                  Individual suitability, treatment
                  responses, recovery experiences,
                  and results may vary depending
                  on personal circumstances.
                </p>

                <p className={bodyClass}>
                  Images, testimonials, and before-and-after
                  comparisons, where displayed, represent
                  individual experiences and do not
                  guarantee identical outcomes.
                </p>

                <p className={bodyClass}>
                  Website information should not replace
                  an appropriate professional consultation,
                  medical evaluation, diagnosis,
                  or individualized treatment advice.
                </p>
              </section>

              {/* 5. Pricing */}
              <section
                id="pricing"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Pricing & promotions
                </h2>

                <p className={bodyClass}>
                  Treatment prices, promotional offers,
                  packages, and discounts displayed
                  on this website are subject to
                  their stated conditions and
                  applicable availability.
                </p>

                <p className={bodyClass}>
                  We aim to display current pricing
                  information, but published prices
                  and promotional details may change.
                  Please confirm the final price,
                  inclusions, eligibility, and
                  applicable conditions with the
                  clinic before receiving a service.
                </p>

                <p className={bodyClass}>
                  Any cancellation, rescheduling,
                  payment, or refund conditions
                  applicable to a particular service
                  should be confirmed with the
                  clinic when making arrangements.
                  These website terms do not establish
                  a separate cancellation or
                  refund policy.
                </p>
              </section>

              {/* 6. Acceptable Use */}
              <section
                id="conduct"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Acceptable use
                </h2>

                <p className={bodyClass}>
                  Visitors are expected to use
                  this website responsibly and
                  for lawful purposes.
                </p>

                <p className={bodyClass}>
                  You must not attempt to interfere
                  with the website&apos;s operation,
                  compromise its security, obtain
                  unauthorized access to systems
                  or information, or use the
                  website for unlawful or
                  fraudulent activities.
                </p>

                <p className={bodyClass}>
                  You should also provide accurate
                  information when contacting the
                  clinic and avoid submitting
                  misleading, harmful, or
                  inappropriate content.
                </p>
              </section>

              {/* 7. External Services */}
              <section
                id="external"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  External services
                </h2>

                <p className={bodyClass}>
                  Our website may provide links
                  to external platforms, including
                  Google Maps, Facebook, Instagram,
                  TikTok, WhatsApp, and Viber.
                </p>

                <p className={bodyClass}>
                  These services are operated
                  independently and may have
                  their own terms, privacy notices,
                  and service conditions.
                </p>

                <p className={bodyClass}>
                  We encourage visitors to review
                  the applicable policies before
                  sharing personal information
                  or interacting with
                  third-party platforms.
                </p>
              </section>

              {/* 8. Intellectual Property */}
              <section
                id="ownership"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Intellectual property
                </h2>

                <p className={bodyClass}>
                  The Aesthera Mère name, branding,
                  original website materials,
                  graphics, and other content
                  may be protected by applicable
                  intellectual property laws.
                </p>

                <p className={bodyClass}>
                  Except as permitted by applicable
                  law or with appropriate authorization,
                  visitors must not reproduce,
                  distribute, modify, or commercially
                  exploit protected website
                  materials without permission
                  from the relevant rights holder.
                </p>

                <p className={bodyClass}>
                  Certain photographs, logos,
                  embedded content, or third-party
                  materials may belong to
                  their respective owners.
                </p>
              </section>

              {/* 9. Disclaimer */}
              <section
                id="disclaimer"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Website disclaimers
                </h2>

                <p className={bodyClass}>
                  We make reasonable efforts
                  to maintain the website and
                  provide useful, accurate
                  information. However, temporary
                  interruptions, technical errors,
                  or outdated information
                  may occur.
                </p>

                <p className={bodyClass}>
                  General information displayed
                  on this website is not a
                  substitute for individualized
                  professional advice, and
                  visitors should verify important
                  information directly with
                  the clinic.
                </p>

                <p className={bodyClass}>
                  Nothing in these terms is
                  intended to exclude or limit
                  rights, remedies, or liabilities
                  that cannot lawfully be excluded
                  or limited under applicable law.
                </p>
              </section>

              {/* 10. Changes */}
              <section
                id="changes"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Changes to these terms
                </h2>

                <p className={bodyClass}>
                  Aesthera Mère may update these
                  Terms of Use as website features,
                  services, or applicable
                  requirements change.
                </p>

                <p className={bodyClass}>
                  Revised terms will be published
                  on this page, together with
                  an updated revision date.
                  Visitors are encouraged
                  to review this page periodically.
                </p>
              </section>

              {/* 11. Contact */}
              <section
                id="contact"
                className={sectionClass}
              >
                <h2 className={headingClass}>
                  Contact information
                </h2>

                <p className={bodyClass}>
                  If you have questions about
                  these Terms of Use, the
                  information displayed on
                  this website, or any of
                  our services, you may contact
                  Aesthera Mère Beauty Creations.
                </p>

                <div className="mt-6 rounded-[16px] border border-[#4C5534]/10 bg-[#F6F3ED] p-6">
                  <p className="font-montserrat text-[13px] font-semibold text-[#4C5534]">
                    Aesthera Mère Beauty Creations
                  </p>

                  <p className="mt-3 font-montserrat text-[13px] leading-7 text-[#696D5C]">
                    Unit 3 No. 4, Madison Square,
                    <br />
                    Pioneer St., Mandaluyong City,
                    <br />
                    Metro Manila, Philippines
                  </p>

                  <a
                    href="tel:+639189365679"
                    className={`mt-3 inline-block font-montserrat text-[13px] ${linkClass}`}
                  >
                    +63 918 936 5679
                  </a>
                </div>
              </section>

            </article>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
