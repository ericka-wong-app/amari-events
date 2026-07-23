"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { FlatMember } from "@/lib/admin-data";
import { setRole } from "../actions";

const inp = "w-full rounded-md border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const btnSm = "rounded-md border border-rose px-3 py-1 text-xs font-semibold text-rose-deep";

export default function GodparentManager({ members }: { members: FlatMember[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  const act = (id: string, role: "Ninong" | "Ninang" | null) => {
    setMsg(null);
    start(async () => {
      const r = await setRole(id, role);
      if (r.ok) { setQ(""); router.refresh(); } else setMsg(r.error ?? "Failed");
    });
  };

  const ninong = members.filter((m) => m.godparentRole === "Ninong");
  const ninang = members.filter((m) => m.godparentRole === "Ninang");

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return members.filter((m) => m.displayName.toLowerCase().includes(s)).slice(0, 8);
  }, [members, q]);

  return (
    <div className="space-y-6">
      {/* Assign */}
      <section className="rounded-lg border border-blush-2 bg-white px-4 py-4">
        <p className="font-display text-lg italic text-rose-deep">Assign a godparent</p>
        <p className="mt-0.5 text-sm text-ink-soft">Search anyone on the guest list and set their role.</p>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a person by name" className={`${inp} mt-3`} />
        {msg && <p className="mt-2 text-sm text-rose-deep">{msg}</p>}
        <div className="mt-2 divide-y divide-blush-2/60">
          {results.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="text-ink">{m.displayName}{m.groupName ? <span className="text-ink-soft"> · {m.groupName}</span> : null}
                {m.godparentRole && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[0.6rem] font-semibold text-rose-deep">{m.godparentRole}</span>}
              </span>
              <span className="flex gap-2">
                <button disabled={pending} onClick={() => act(m.id, "Ninong")} className={btnSm}>Set Ninong</button>
                <button disabled={pending} onClick={() => act(m.id, "Ninang")} className={btnSm}>Set Ninang</button>
              </span>
            </div>
          ))}
          {q.trim() && results.length === 0 && <p className="py-2 text-sm text-ink-soft">No match.</p>}
        </div>
      </section>

      <RoleTable title="Ninong" people={ninong} pending={pending} onRemove={(id) => act(id, null)} />
      <RoleTable title="Ninang" people={ninang} pending={pending} onRemove={(id) => act(id, null)} />
    </div>
  );
}

function RoleTable({ title, people, pending, onRemove }: {
  title: string; people: FlatMember[]; pending: boolean; onRemove: (id: string) => void;
}) {
  return (
    <section className="rounded-lg border border-blush-2 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-display text-lg italic text-rose-deep">{title}</p>
        <span className="text-sm text-ink-soft">{people.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead className="bg-blush/40 text-[0.66rem] uppercase tracking-wide text-ink-soft">
            <tr><th className="px-4 py-2 font-semibold">Name</th><th className="px-4 py-2 font-semibold">Group</th><th className="px-3 py-2" /></tr>
          </thead>
          <tbody>
            {people.map((m) => (
              <tr key={m.id} className="border-t border-blush-2/70">
                <td className="px-4 py-2 font-semibold text-ink">{m.displayName}</td>
                <td className="px-4 py-2 text-ink-soft">{m.groupName || "—"}</td>
                <td className="px-3 py-2 text-right"><button disabled={pending} onClick={() => onRemove(m.id)} className="text-xs font-semibold text-rose-deep">Remove</button></td>
              </tr>
            ))}
            {people.length === 0 && <tr><td colSpan={3} className="px-4 py-5 text-center text-ink-soft">None yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
