
"use client";

import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { useBooking } from "@/components/BookingProvider";

const doctors = [
  {
    id: "dr-dan",
    name: "Dr. John Daniel Co",
    shortName: "Dr. Dan",
    title: "Aesthetic Physician",
    tagline: "Regenerative • Wellness • Aesthetic Medicine",
    image: "/images/doctors/dr-dan.png",
    bio: [
      "Dr. John Daniel Co is an aesthetic physician dedicated to providing personalized, patient-centered aesthetic care. His practice focuses on non-surgical treatments, with an emphasis on precision, safety, and natural-looking results.",
      "With experience in facial injectables, skin boosters, biostimulators, and thread lifting, Dr. Co combines aesthetic techniques with individualized treatment planning to help patients address their aesthetic concerns.",
    ],
    expertise: [
      "Facial Injectables",
      "Dermal Fillers",
      "Botulinum Toxin",
      "Skin Boosters",
      "Biostimulators",
      "Thread Lifting",
      "Mesolipo",
    ],
    credentials: [
      "University of the East Ramon Magsaysay Medical Center",
      "De La Salle University–Dasmariñas — Nursing",
    ],
    affiliations: [
      "American Academy of Aesthetic Medicine",
      "Philippine Academy of Aesthetic and Age Management Medicine",
      "Philippine Science of Skin and Aesthetic Medicine",
    ],
  },
  {
    id: "dr-raine",
    name: "Dr. Raine",
    shortName: "Dr. Raine",
    title: "Aesthetic Physician",
    tagline: "Personalized Aesthetic & Skin Rejuvenation Care",
    image: "/images/doctors/dr-raine.png",
    bio: [
      "Dr. Raine is an aesthetic physician who focuses on personalized, evidence-based aesthetic care. Her approach combines individualized treatment planning with attention to patient safety, comfort, and naturally refined results.",
      "Her practice addresses concerns such as pigmentation, acne, and skin rejuvenation. She has experience in aesthetic injectables, dermal fillers, biostimulators, and other non-surgical aesthetic treatments.",
    ],
    expertise: [
      "Skin Rejuvenation",
      "Pigmentation & Acne Concerns",
      "Aesthetic Injectables",
      "Dermal Fillers",
      "Biostimulators",
      "Lipolytics",
      "Personalized Treatment Planning",
    ],
    credentials: [
      "University of the East Ramon Magsaysay Medical Center, Inc. — College of Medicine",
      "Postgraduate Internship — Jose Reyes Memorial Medical Center",
      "ECFMG-Certified",
    ],
    affiliations: [
      "Philippine Science of Skin and Aesthetic Medicine",
      "American Academy of Aesthetic Medicine",
    ],
  },
];

export default function DoctorsPage() {
  const { openBooking } = useBooking();

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F6F3ED]">
        {/* PAGE INTRODUCTION */}
        <section className="mx-auto max-w-[1200px] px-6
          pb-14 pt-20 text-center md:px-10 md:pb-20">
          <p className="mb-4 font-montserrat text-[11px]
            uppercase tracking-[0.25em] text-[#4C5534]">
            AESTHERA MÈRE · OUR DOCTORS
          </p>

          <h1 className="font-bodoni text-5xl
            text-[#4C5534] md:text-6xl">
            Meet Our Experts
          </h1>

          <p className="mx-auto mt-5 max-w-[590px]
            font-montserrat text-sm leading-7 text-[#777568]">
            Discover the medical professionals behind our
            personalized approach to aesthetic care.
          </p>

          <div className="mx-auto mt-8 h-px w-16
            bg-[#4C5534]/40" />
        </section>

        {/* DOCTOR PROFILES */}
        <div className="mx-auto max-w-[1200px] px-6
          pb-20 md:px-10">

          {doctors.map((doctor, index) => (
            <section
              key={doctor.id}
              id={doctor.id}
              className="mb-20 scroll-mt-32
                md:mb-28"
            >
              <div className="grid items-center gap-8
                md:grid-cols-2 md:gap-14">

                {/* DOCTOR IMAGE */}
                <div
                  className={`relative overflow-hidden
                    rounded-[22px] bg-[#E8E4DC]
                    ${index % 2 === 1 ? "md:order-2" : ""}`}
                >
                  <div className="relative aspect-[4/5]">
                    <Image
                      src={doctor.image}
                      alt={`Portrait of ${doctor.name}`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* DOCTOR INFORMATION */}
                <div
                  className={`${
                    index % 2 === 1 ? "md:order-1" : ""
                  }`}
                >
                  <p className="mb-3 font-montserrat
                    text-[11px] font-medium uppercase
                    tracking-[0.2em] text-[#4F6442]">
                    {doctor.title}
                  </p>

                  <h2 className="font-bodoni text-[42px]
                    leading-tight text-[#4C5534]
                    md:text-[52px]">
                    {doctor.name}
                  </h2>

                  <p className="mt-3 font-montserrat
                    text-[12px] tracking-wide
                    text-[#777568]">
                    {doctor.tagline}
                  </p>

                  <div className="my-7 h-px w-16
                    bg-[#4C5534]/40" />

                  {/* BIOGRAPHY */}
                  <div className="space-y-4">
                    {doctor.bio.map((paragraph, i) => (
                      <p
                        key={i}
                        className="font-montserrat text-[13px]
                          leading-[1.9] text-[#666759]"
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* EXPERTISE */}
                  <div className="mt-8">
                    <h3 className="mb-4 font-bodoni
                      text-[25px] text-[#4C5534]">
                      Areas of Expertise
                    </h3>

                    <div className="flex flex-wrap gap-2">
                      {doctor.expertise.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border
                            border-[#4C5534]/20 bg-white
                            px-4 py-2 font-montserrat
                            text-[11px] text-[#4C5534]"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* BOOKING BUTTON */}
                  <button
                    type="button"
                    onClick={() => openBooking("", doctor.shortName)}
                    className="mt-9 inline-flex items-center
                      gap-3 rounded-full bg-[#4C5534]
                      px-8 py-3.5 font-montserrat
                      text-[12px] font-medium text-white
                      transition hover:bg-[#39432D]"
                  >
                    Book a Consultation
                    <span aria-hidden="true">↗</span>
                  </button>
                </div>
              </div>

              {/* CREDENTIALS CARD */}
              <div className="mt-8 rounded-[22px]
                border border-[#E3DDD1] bg-white
                p-6 shadow-[0_10px_30px_rgba(60,50,30,0.04)]
                md:mt-10 md:p-8">

                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="mb-5 font-bodoni
                      text-[25px] text-[#4C5534]">
                      Education & Credentials
                    </h3>

                    <ul className="space-y-3">
                      {doctor.credentials.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 font-montserrat
                            text-[12px] leading-6 text-[#666759]"
                        >
                          <span className="mt-2 h-1.5 w-1.5
                            shrink-0 rounded-full bg-[#4F6442]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-5 font-bodoni
                      text-[25px] text-[#4C5534]">
                      Professional Affiliations
                    </h3>

                    <ul className="space-y-3">
                      {doctor.affiliations.map((item) => (
                        <li
                          key={item}
                          className="flex gap-3 font-montserrat
                            text-[12px] leading-6 text-[#666759]"
                        >
                          <span className="mt-2 h-1.5 w-1.5
                            shrink-0 rounded-full bg-[#4F6442]" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          ))}

          {/* DR. IAN — DETAILS PENDING */}
          <section id="dr-ian" className="scroll-mt-32">
            <div className="grid items-center gap-8 rounded-[22px] border border-[#E3DDD1] bg-white p-6 md:grid-cols-[0.72fr_1.28fr] md:gap-12 md:p-8">
              <div role="img" aria-label="Portrait of Dr. Ian coming soon" className="flex aspect-[4/4.5] items-center justify-center overflow-hidden rounded-[18px] bg-gradient-to-br from-[#FFFCF3] to-[#80755F]/20 font-seasons text-7xl text-[#4C5534]/30">DI</div>
              <div>
                <p className="mb-3 font-montserrat text-[11px] uppercase tracking-[0.2em] text-[#4F6442]">Doctor Profile</p>
                <h2 className="font-bodoni text-4xl text-[#4C5534]">Dr. Ian</h2>
                <p className="mt-4 max-w-md font-montserrat text-sm leading-7 text-[#777568]">Full professional profile, specialty, credentials, and portrait will be added once verified clinic information is available.</p>
                <button type="button" onClick={() => openBooking("", "Dr. Ian")} className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#4C5534] px-8 py-3.5 font-montserrat text-[12px] font-medium text-white transition hover:bg-[#39432D]">Book a Consultation <span aria-hidden="true">↗</span></button>
              </div>
            </div>
          </section>
        </div>

      </main>
      <Footer />
    </>
  );
}
