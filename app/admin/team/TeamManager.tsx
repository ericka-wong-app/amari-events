"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/lib/admin";
import { createAdmin, deleteAdmin } from "./actions";

const input = "w-full rounded-lg border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const label = "block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft";

export default function TeamManager({ admins }: { admins: AdminUser[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  function add() {
    setMsg(null);
    start(async () => {
      const r = await createAdmin(username, password, role);
      if (r.ok) { setUsername(""); setPassword(""); setRole(""); setMsg("Admin added ✓"); router.refresh(); }
      else setMsg(r.error);
    });
  }
  function remove(a: AdminUser) {
    if (!confirm(`Remove admin ${a.username}? They will no longer be able to log in.`)) return;
    setMsg(null);
    start(async () => { const r = await deleteAdmin(a.id); if (r.ok) router.refresh(); else setMsg(r.error); });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Add a helper admin</h2>
        <p className="mt-1 text-sm text-ink-soft">Give the father, a ninang, or anyone helping you their own login to manage guests, RSVPs, and check-in.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div><span className={label}>Username / email</span><input value={username} onChange={(e) => setUsername(e.target.value)} className={input} placeholder="name@email.com" /></div>
          <div><span className={label}>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="min. 6 characters" /></div>
          <div><span className={label}>Role (optional)</span><input value={role} onChange={(e) => setRole(e.target.value)} className={input} placeholder="e.g. Father, Ninang" /></div>
        </div>
        <button disabled={pending || !username.trim() || password.length < 6} onClick={add}
          className="mt-3 rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Adding…" : "Add admin"}
        </button>
        {msg && <p className="mt-2 text-sm text-rose-deep">{msg}</p>}
      </section>

      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Admins ({admins.length})</h2>
        <div className="mt-3 space-y-2">
          {admins.map((a) => (
            <div key={a.id} className="flex items-center gap-3 rounded-xl border border-blush-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{a.username}</p>
                <p className="text-xs text-ink-soft">{a.role || "Admin"}</p>
              </div>
              <button onClick={() => remove(a)} disabled={pending} className="rounded-lg border border-rose/40 px-3 py-1.5 text-xs font-semibold text-rose-deep">Remove</button>
            </div>
          ))}
          {admins.length === 0 && <p className="text-sm text-ink-soft">No admins yet.</p>}
        </div>
      </section>
    </div>
  );
}
