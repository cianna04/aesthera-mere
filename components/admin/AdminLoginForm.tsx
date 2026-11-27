"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { ADMIN_SESSION_KEY, createAdminSession } from "@/lib/admin-session";

type Step = "sign-in" | "reset-email" | "new-password" | "complete";
const inputClass = "h-11 w-full rounded-xl border border-[#344b38]/25 bg-white pl-11 pr-4 text-sm text-[#29382b] outline-none focus:border-[#4f6442] focus:ring-2 focus:ring-[#4f6442]/20";
const buttonClass = "h-11 w-full cursor-pointer rounded-xl bg-[#344b38] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#29382b]";

function Icon({ children }: { children: ReactNode }) {
  return <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-[#69806d]">{children}</span>;
}
function MailIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>;
}
function LockIcon() {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
}
function EyeIcon({ visible }: { visible: boolean }) {
  return <svg aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" />{!visible && <path d="m3 3 18 18" />}</svg>;
}
export default function AdminLoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function go(next: Step) { setError(""); setStep(next); }
  function finishSignIn() {
    sessionStorage.setItem(ADMIN_SESSION_KEY, createAdminSession());
    setPassword("");
    router.replace("/admin");
  }

  function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      finishSignIn();
    } catch { setError("Sign-in is currently unavailable in this browser."); }
  }

  function submitNewPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) { setError("Use at least eight characters."); return; }
    if (newPassword !== confirmation) { setError("The passwords do not match."); return; }
    setNewPassword(""); setConfirmation(""); setPassword(""); go("complete");
  }

  const emailField = <div><label htmlFor="admin-login-email" className="mb-2 block text-xs font-semibold text-[#35483a]">Email address</label><div className="relative"><Icon><MailIcon /></Icon><input id="admin-login-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@clinic.com" className={inputClass} /></div></div>;
  const passwordField = (id: string, value: string, setValue: (value: string) => void, autoComplete: string) => <div className="relative"><Icon><LockIcon /></Icon><input id={id} type={showPassword ? "text" : "password"} autoComplete={autoComplete} required minLength={id === "admin-login-password" ? undefined : 8} value={value} onChange={(event) => setValue(event.target.value)} className={`${inputClass} pr-12`} /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-controls={id} onClick={() => setShowPassword((current) => !current)} className="absolute inset-y-0 right-1 flex w-10 cursor-pointer items-center justify-center rounded-lg text-[#526b58] hover:bg-[#edf0e9]"><EyeIcon visible={showPassword} /></button></div>;
  const message = error && <p role="alert" className="text-xs leading-5 text-[#9a4d42]">{error}</p>;

  return <div className="font-montserrat mt-7">
    {step === "sign-in" && <form className="space-y-4" onSubmit={submitCredentials}>{emailField}<div><label htmlFor="admin-login-password" className="mb-2 block text-xs font-semibold text-[#35483a]">Password</label>{passwordField("admin-login-password", password, setPassword, "current-password")}</div><button type="button" onClick={() => go("reset-email")} className="block cursor-pointer text-xs font-semibold text-[#405e47] hover:underline">Forgot password?</button>{message}<button type="submit" className={buttonClass}>Sign in</button></form>}
    {step === "reset-email" && <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); go("new-password"); }}><div><h2 className="font-seasons text-2xl">Reset your password</h2><p className="mt-1 text-xs leading-5 text-[#606b61]">Enter your admin email to continue.</p></div>{emailField}<button type="submit" className={buttonClass}>Continue</button><button type="button" onClick={() => go("sign-in")} className="cursor-pointer text-xs font-semibold text-[#405e47] hover:underline">Back to sign in</button></form>}
    {step === "new-password" && <form className="space-y-4" onSubmit={submitNewPassword}><div><h2 className="font-seasons text-2xl">Choose a new password</h2><p className="mt-1 text-xs leading-5 text-[#606b61]">Use at least eight characters.</p></div><div><label htmlFor="admin-new-password" className="mb-2 block text-xs font-semibold text-[#35483a]">New password</label>{passwordField("admin-new-password", newPassword, setNewPassword, "new-password")}</div><div><label htmlFor="admin-confirm-password" className="mb-2 block text-xs font-semibold text-[#35483a]">Confirm password</label>{passwordField("admin-confirm-password", confirmation, setConfirmation, "new-password")}</div>{message}<button type="submit" className={buttonClass}>Save password</button></form>}
    {step === "complete" && <div className="space-y-4"><h2 className="font-seasons text-2xl">Password updated</h2><p className="text-xs leading-5 text-[#606b61]">Return to sign in with your new password.</p><button type="button" onClick={() => go("sign-in")} className={buttonClass}>Back to sign in</button></div>}
  </div>;
}
