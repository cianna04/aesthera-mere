import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { ChevronLeftIcon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Admin Sign In | Aesthera Mère",
  description: "Sign in to the Aesthera Mère clinic workspace.",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-linear-to-br from-[#e0e9df] via-[#f5f0e8] to-[#dfd1bf] p-3 text-[#29382b] sm:p-6">
      <div className="grid w-full max-w-[1040px] overflow-hidden rounded-[26px] border border-[#344b38]/10 bg-[#fffcf7] shadow-[0_20px_65px_-36px_rgba(50,56,35,0.35)] lg:min-h-[610px] lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-[610px] items-end overflow-hidden bg-[#344b38] lg:flex">
          <Image
            src="/images/about/about.png"
            alt="Aesthera Mère clinic reception"
            fill
            sizes="(min-width: 1024px) 470px, 1px"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#1d2a20]/95 via-[#253526]/30 to-transparent" />
          <div className="relative m-9 w-full border-t border-[#daccae]/50 pt-6 text-[#fffaf0]">
            <p className="font-seasons text-5xl leading-none tracking-tight">Aesthera Mère</p>
            <p className="font-montserrat mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#eaddc3]">
              Beauty Creations
            </p>
          </div>
        </div>

        <div className="flex min-h-[580px] flex-col px-6 py-6 sm:px-12 sm:py-8 lg:min-h-0">
          <Link
            href="/"
            className="font-montserrat inline-flex min-h-10 w-fit items-center gap-1.5 rounded-md text-xs font-semibold text-[#526557] transition-colors hover:text-[#29382b]"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            Back to website
          </Link>

          <section aria-labelledby="login-heading" className="mx-auto flex w-full max-w-[350px] flex-1 flex-col justify-center py-8">
            <Image src="/images/brand/logo_name.png" alt="Aesthera Mère" width={150} height={59} className="mb-7 h-auto w-[145px] object-contain" />
            <p className="font-montserrat mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#526557]">Admin portal</p>
            <h1 id="login-heading" className="font-seasons text-[clamp(2.6rem,5vw,3.4rem)] leading-none tracking-[-0.04em]">
              Welcome back.
            </h1>
            <p className="font-montserrat mt-3 text-sm leading-6 text-[#606b61]">Sign in to your clinic workspace.</p>
            <AdminLoginForm />
          </section>

          <p className="font-montserrat border-t border-[#344b38]/12 pt-5 text-xs text-[#606b61]">For authorized clinic staff.</p>
        </div>
      </div>
    </main>
  );
}
