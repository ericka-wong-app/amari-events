"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "../actions";

export default function AdminLogin() {
  const router = useRouter();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    start(async () => {
      const r = await adminLogin(u, p);
      if (r.ok) router.replace("/admin");
      else setError(r.error ?? "Login failed.");
    });
  }

  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-blush-2 bg-white/80 px-6 py-8 shadow-[0_18px_44px_-28px_rgba(183,110,125,0.6)]">
      <h1 className="text-center font-display text-3xl italic text-rose-deep">Admin</h1>
      <p className="mt-1 text-center text-sm text-ink-soft">Amari&apos;s Baptism · host control</p>

      <label className="mt-6 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Username</label>
      <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username"
        className="mt-1 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 outline-none focus:border-rose" />

      <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Password</label>
      <input value={p} onChange={(e) => setP(e.target.value)} type="password" autoComplete="current-password"
        onKeyDown={(e) => e.key === "Enter" && submit()}
        className="mt-1 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 outline-none focus:border-rose" />

      <button onClick={submit} disabled={pending}
        className="mt-6 w-full rounded-full bg-rose px-6 py-3 font-semibold text-white shadow-[0_12px_28px_-14px_rgba(183,110,125,0.9)] disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
      {error && <p className="mt-3 text-center text-sm text-rose-deep">{error}</p>}
    </div>
  );
}
