"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Consultation from "@/components/Consultation";
import BookingTrigger from "@/components/BookingTrigger";
import { ArrowUpRightIcon } from "@/components/Icons";
import promo1Image from "@/public/images/promotions/promo1.png";
import promo2Image from "@/public/images/promotions/promo2.png";
import promo3Image from "@/public/images/promotions/promo3.png";

type PromoOffer = {
  id: string;
  name: string;
  category: "all" | "facials" | "lasers" | "wellness";
  categoryLabel: string;
  tag: string;
  treatment: string;
  sessions: string;
  promoPrice: string;
  regularPrice: string;
  validity: string;
  description: string;
  inclusions: string[];
  image: StaticImageData;
};

const promoOffers: PromoOffer[] = [
  {
    id: "facial-holiday",
    name: "Facial Holiday Treat",
    category: "facials",
    categoryLabel: "Facial Aesthetics",
    tag: "Signature Care",
    treatment: "Selected Premium Facial",
    sessions: "1 session",
    promoPrice: "Starts at ₱999",
    regularPrice: "Inquire for regular price",
    validity: "Confirm current validity when booking",
    description: "Deep cleansing, gentle pore refinement, and intensive hydration to restore skin clarity with motherly, attentive touch.",
    inclusions: ["Physician-guided skin assessment", "Deep pore extraction & purifying care", "Targeted antioxidant nutrient mask", "Cooling globe lymphatic circulation massage"],
    image: promo1Image,
  },
  {
    id: "laser-holiday",
    name: "Laser Holiday Treat",
    category: "lasers",
    categoryLabel: "Laser & Skin Rejuvenation",
    tag: "Clinical Excellence",
    treatment: "Selected Laser Treatment",
    sessions: "1 session",
    promoPrice: "Starts at ₱999",
    regularPrice: "Inquire for regular price",
    validity: "Confirm current validity when booking",
    description: "Precision non-invasive laser therapy targeting blemishes, hyperpigmentation, and tone balance with minimal downtime.",
    inclusions: ["Doctor consultation & skin typing", "Medical-grade laser toning session", "Post-laser calming hydration", "Personalized homecare protocol"],
    image: promo2Image,
  },
  {
    id: "drip-holiday",
    name: "Aesthera Drip Treat",
    category: "wellness",
    categoryLabel: "Wellness & Vitality",
    tag: "Wellness Favorite",
    treatment: "Selected Wellness Drip",
    sessions: "1 session",
    promoPrice: "Starts at ₱899",
    regularPrice: "Inquire for regular price",
    validity: "Confirm current validity when booking",
    description: "Carefully formulated blend of vital antioxidants, vitamins, and minerals delivered directly for whole-body radiance.",
    inclusions: ["Pre-infusion vitals check", "Customized IV vitamin formulation", "Comfort lounge recovery", "Warm complimentary herbal tea"],
    image: promo3Image,
  },
  {
    id: "radiance-duo",
    name: "Radiance Duo Facial Package",
    category: "facials",
    categoryLabel: "Facial Aesthetics",
    tag: "Curated Bundle",
    treatment: "Oxy-Radiance & Hydration Infusion",
    sessions: "2 sessions",
    promoPrice: "Starts at ₱1,899",
    regularPrice: "₱2,800",
    validity: "Valid within 60 days of purchase",
    description: "Structured multi-visit facial therapy designed for persistent hydration, texture softening, and luminous tone.",
    inclusions: ["2 comprehensive facial therapies", "Custom botanical booster infusion", "Physician skin progress evaluation"],
    image: promo1Image,
  },
  {
    id: "laser-toning-series",
    name: "Complete Laser Toning Series",
    category: "lasers",
    categoryLabel: "Laser & Skin Rejuvenation",
    tag: "Multi-Session",
    treatment: "Pico Genesis / Q-Switched Toning",
    sessions: "3 sessions",
    promoPrice: "Starts at ₱2,699",
    regularPrice: "₱4,500",
    validity: "Valid within 90 days of purchase",
    description: "Progressive laser toning sessions for visible pore refinement, collagen renewal, and even skin tone without harsh downtime.",
    inclusions: ["3 physician-supervised laser sessions", "Post-treatment regenerative serum", "Dedicated progress check-in"],
    image: promo2Image,
  },
  {
    id: "glow-vitality-pack",
    name: "Glow & Vitality Drip Package",
    category: "wellness",
    categoryLabel: "Wellness & Vitality",
    tag: "Signature Wellness",
    treatment: "Glutathione + Vitamin C Infusion",
    sessions: "3 sessions",
    promoPrice: "Starts at ₱2,399",
    regularPrice: "₱3,600",
    validity: "Valid within 90 days of purchase",
    description: "Comprehensive medical-grade IV infusion designed for systemic cellular protection, immunity, and luminous skin from within.",
    inclusions: ["3 sterile IV wellness infusions", "Clinical monitoring throughout session", "Relaxation suite experience"],
    image: promo3Image,
  },
];

const promoCategories = [
  { id: "all", label: "All Offers" },
  { id: "facials", label: "Facial Aesthetics" },
  { id: "lasers", label: "Laser Treatments" },
  { id: "wellness", label: "Wellness & Drips" },
];

export default function PromosPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const filteredOffers =
    activeCategory === "all"
      ? promoOffers
      : promoOffers.filter((offer) => offer.category === activeCategory);

  return (
    <>
      <Navbar />

      <main className="bg-[#FFFCF3] text-[#4C5534]">
        {/* 1. Header & Breadcrumb */}
        <section className="border-b border-[#80755F]/15 px-6 py-12 md:px-10 md:py-16">
          <div className="mx-auto max-w-[1280px]">
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-montserrat text-[10px] font-semibold uppercase tracking-[0.14em] text-[#80755F]">
              <Link href="/" className="hover:text-[#4C5534]">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-[#4C5534]">Promos &amp; Packages</span>
            </nav>

            <div className="mt-8 max-w-[840px]">
              <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.22em] text-[#80755F]">
                Aesthera Mère • Curated Packages
              </p>
              <h1 className="font-seasons mt-3 text-[clamp(3.2rem,6.5vw,5.5rem)] leading-[0.95] text-[#4C5534]">
                Promotions &amp; Packages
              </h1>
              <p className="mt-3 font-seasons italic text-lg text-[#4f6442] sm:text-xl">
                “Premium Aesthetic Care, Made Accessible”
              </p>
              <p className="mt-4 font-montserrat text-sm leading-7 text-[#80755F] sm:text-base">
                Explore our current treatment specials and bundled sessions. Thoughtfully created to provide premium clinical expertise without intimidation, and accessible care without compromising quality.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Category Filter & Offers Grid */}
        <section className="mx-auto max-w-[1280px] px-6 py-12 md:px-10 md:py-16">
          {/* Category Tabs */}
          <div className="mb-10">
            <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.2em] text-[#80755F]">
              Filter by offer type
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {promoCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`inline-flex min-h-11 items-center rounded-full border px-5 font-montserrat text-xs font-semibold transition-all ${
                      isActive
                        ? "border-[#4C5534] bg-[#4C5534] text-white shadow-sm"
                        : "border-[#80755F]/30 bg-transparent text-[#4C5534] hover:border-[#4C5534]"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section Header */}
          <div className="mb-8 flex items-end justify-between gap-5 border-b border-[#80755F]/15 pb-5">
            <div>
              <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.18em] text-[#80755F]">
                {promoCategories.find((c) => c.id === activeCategory)?.label}
              </p>
              <h2 className="font-seasons mt-2 text-[clamp(2rem,3.5vw,3rem)] leading-tight text-[#4C5534]">
                Available Packages ({filteredOffers.length})
              </h2>
            </div>
            <p className="font-montserrat text-xs text-[#80755F]">
              Final eligibility confirmed during consultation
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredOffers.map((offer) => (
              <article
                key={offer.id}
                className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#80755F]/20 bg-white shadow-[0_18px_45px_-30px_rgba(30,58,42,0.35)] transition-all duration-300 hover:shadow-[0_24px_50px_-20px_rgba(30,58,42,0.4)]"
              >
                {/* Image Banner */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#E7E1D7]">
                  <Image
                    src={offer.image}
                    alt={offer.name}
                    fill
                    quality={90}
                    sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#4C5534] px-3.5 py-1.5 font-montserrat text-[10px] font-semibold uppercase tracking-[0.12em] text-white shadow-sm">
                    {offer.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.16em] text-[#80755F]">
                    {offer.categoryLabel}
                  </p>
                  <h3 className="font-seasons mt-2 text-2xl font-normal leading-tight text-[#4C5534]">
                    {offer.name}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-[#80755F]">
                    {offer.description}
                  </p>

                  {/* Pricing Details */}
                  <dl className="mt-5 space-y-2.5 border-y border-[#80755F]/15 py-4 font-montserrat text-xs">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#80755F]">Treatment</dt>
                      <dd className="text-right font-medium text-[#4C5534]">{offer.treatment}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#80755F]">Package Inclusions</dt>
                      <dd className="text-right font-medium text-[#4C5534]">{offer.sessions}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#80755F]">Promo Price</dt>
                      <dd className="text-right text-base font-bold text-[#4C5534]">{offer.promoPrice}</dd>
                    </div>
                    {offer.regularPrice && (
                      <div className="flex justify-between gap-4">
                        <dt className="text-[#80755F]">Regular Price</dt>
                        <dd className="text-right text-[#80755F] line-through">{offer.regularPrice}</dd>
                      </div>
                    )}
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#80755F]">Validity</dt>
                      <dd className="max-w-[200px] text-right text-[11px] text-[#4C5534]">{offer.validity}</dd>
                    </div>
                  </dl>

                  {/* Inclusions */}
                  <div className="mt-4 flex-1">
                    <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.14em] text-[#80755F]">
                      Inclusions:
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {offer.inclusions.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 font-montserrat text-[11px] text-[#4C5534]">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4f6442]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Booking Trigger */}
                  <BookingTrigger
                    initialTreatment={offer.name}
                    className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#4C5534] px-5 font-montserrat text-xs font-semibold text-white transition-all hover:bg-[#35452F]"
                  >
                    Book This Offer <ArrowUpRightIcon className="h-4 w-4" />
                  </BookingTrigger>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. The Aesthera Mère Care Principle */}
        <section className="border-t border-[#80755F]/15 bg-[#F9F5EC] px-6 py-14 md:px-10 md:py-20">
          <div className="mx-auto max-w-[1280px]">
            <div className="mx-auto max-w-[720px] text-center">
              <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.24em] text-[#80755F]">
                Our Promise
              </p>
              <h2 className="font-seasons mt-3 text-[clamp(2.4rem,4.5vw,3.8rem)] leading-tight text-[#4C5534]">
                The Aesthera Mère Standard
              </h2>
              <p className="mt-3 font-seasons italic text-base text-[#4f6442]">
                Accessible without feeling ordinary. Affordable without becoming a discount brand.
              </p>
              <p className="mt-4 font-montserrat text-sm leading-7 text-[#80755F]">
                Born from a tribute to our mother, every treatment package embodies warm, attentive, and genuine aesthetic care tailored to your individual skin journey.
              </p>
            </div>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-[22px] border border-[#80755F]/15 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4C5534]/10 font-seasons text-xl font-bold text-[#4C5534]">
                  01
                </div>
                <h3 className="font-seasons text-xl text-[#4C5534]">Doctor-Supervised Expertise</h3>
                <p className="mt-2.5 font-montserrat text-xs leading-6 text-[#80755F]">
                  Every offer includes personalized medical guidance from our aesthetic physicians to verify clinical suitability and skin safety.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#80755F]/15 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4C5534]/10 font-seasons text-xl font-bold text-[#4C5534]">
                  02
                </div>
                <h3 className="font-seasons text-xl text-[#4C5534]">Authentic Medical Technology</h3>
                <p className="mt-2.5 font-montserrat text-xs leading-6 text-[#80755F]">
                  We exclusively use authentic, FDA-cleared devices and premium medical-grade formulations with proven efficacy records.
                </p>
              </div>

              <div className="rounded-[22px] border border-[#80755F]/15 bg-white p-7 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#4C5534]/10 font-seasons text-xl font-bold text-[#4C5534]">
                  03
                </div>
                <h3 className="font-seasons text-xl text-[#4C5534]">Thoughtful Experience</h3>
                <p className="mt-2.5 font-montserrat text-xs leading-6 text-[#80755F]">
                  Enjoy an unhurried, welcoming clinic environment designed to give you genuine confidence and peace of mind at every step.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Consultation CTA */}
        <Consultation />
      </main>

      <Footer />
    </>
  );
}
