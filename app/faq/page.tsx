import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQContent from "./FAQContent";

export const metadata: Metadata = {
  title: "FAQs | Aesthera Mère",
  description:
    "Find helpful information about Aesthera Mère consultations, treatments, promotions, and clinic visits.",
};

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FFFCF3] text-[#4C5534]">
        <FAQContent />
      </main>
      <Footer />
    </>
  );
}
