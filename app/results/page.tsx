import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResultsGallery from "@/components/ResultsGallery";

export const metadata: Metadata = {
  title: "Before & After Results | Aesthera Mère",
  description:
    "Browse before-and-after photographs by treatment at Aesthera Mère.",
};

export default function ResultsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FFFCF3]">
        <ResultsGallery />
      </main>
      <Footer />
    </>
  );
}
