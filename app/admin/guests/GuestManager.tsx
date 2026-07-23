"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AdminGuest } from "@/lib/admin-data";
import { addGuest, saveGuest, removeGuest } from "../actions";

const input = "w-full rounded-lg border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const label = "block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft";
const UNGROUPED = "— Not in a group —";

export default function GuestManager({ guests }: { guests: AdminGuest[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const groupNames = useMemo(
    () => Array.from(new Set(guests.map((g) => g.groupName).filter((n): n is string => Boolean(n)))).sort(),
    [guests]
  );

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return guests;
    return guests.filter(
      (g) => g.displayName.toLowerCase().includes(s) || (g.groupName ?? "").toLowerCase().includes(s)
    );
  }, [guests, q]);

  // group the (filtered) guests by family for display
  const grouped = useMemo(() => {
    const map = new Map<string, AdminGuest[]>();
    for (const g of filtered) {
      const key = g.groupName ?? UNGROUPED;
      (map.get(key) ?? map.set(key, []).get(key)!).push(g);
    }
    const keys = Array.from(map.keys()).sort((a, b) =>
      a === UNGROUPED ? 1 : b === UNGROUPED ? -1 : a.localeCompare(b)
    );
    return keys.map((k) => ({ name: k, members: map.get(k)! }));
  }, [filtered]);

  const refresh = () => router.refresh();

  function add() {
    if (!newName.trim()) return;
    setMsg(null);
    start(async () => {
      const r = await addGuest(newName);
      if (r.ok) { setNewName(""); refresh(); } else setMsg(r.error ?? "Failed");
    });
  }

  return (
    <div>
      <div className="rounded-xl border border-blush-2 bg-blush/30 px-4 py-3 text-xs text-ink-soft">
        💡 <strong className="text-rose-deep">Groups</strong> link a family together (e.g. <em>Wong Family</em>). Open a
        guest, then pick an existing group or type a new one — everyone with the same group name is linked.
      </div>

      {/* Add guest */}
      <div className="mt-4 flex gap-2">
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New guest name…"
          onKeyDown={(e) => e.key === "Enter" && add()} className={input} />
        <button onClick={add} disabled={pending} className="whitespace-nowrap rounded-lg bg-rose px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
          + Add
        </button>
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or group…" className={`${input} mt-3`} />
      {msg && <p className="mt-2 text-sm text-rose-deep">{msg}</p>}

      <div className="mt-4 space-y-5">
        {grouped.map((grp) => {
          const pax = grp.members.filter((m) => m.rsvpStatus === "attending").reduce((s, m) => s + (m.confirmedPax ?? 0), 0);
          return (
            <div key={grp.name}>
              <div className="mb-1.5 flex items-baseline justify-between px-1">
                <p className="font-display text-lg italic text-rose-deep">
                  {grp.name === UNGROUPED ? "Not in a group" : `📁 ${grp.name}`}
                </p>
                <p className="text-xs text-ink-soft">{grp.members.length} {grp.members.length === 1 ? "guest" : "guests"}{pax ? ` · ${pax} coming` : ""}</p>
              </div>
              <div className="space-y-2">
                {grp.members.map((g) =>
                  editing === g.id ? (
                    <GuestEditor key={g.id} guest={g} groups={groupNames} pending={pending}
                      onCancel={() => setEditing(null)}
                      onSave={(fields) => start(async () => {
                        const r = await saveGuest(g.id, fields);
                        if (r.ok) { setEditing(null); refresh(); } else setMsg(r.error ?? "Failed");
                      })}
                      onDelete={() => start(async () => {
                        if (!confirm(`Delete ${g.displayName}?`)) return;
                        const r = await removeGuest(g.id);
                        if (r.ok) { setEditing(null); refresh(); } else setMsg(r.error ?? "Failed");
                      })}
                    />
                  ) : (
                    <button key={g.id} onClick={() => setEditing(g.id)}
                      className="flex w-full items-center justify-between gap-2 rounded-xl border border-blush-2 bg-white px-4 py-3 text-left">
                      <span>
                        <span className="font-semibold text-ink">{g.displayName}</span>
                        {g.godparentRole && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[0.62rem] font-semibold text-rose-deep">{g.godparentRole}</span>}
                        <span className="mt-0.5 block text-xs text-ink-soft">
                          {g.rsvpStatus === "attending" ? `✅ ${g.confirmedPax}/${g.maxPax} coming` : g.rsvpStatus === "declined" ? "❌ declined" : `⏳ pending · ${g.maxPax} pax`}
                          {g.tableNumber ? ` · Table ${g.tableNumber}` : ""}
                          {g.checkedIn ? " · 🎀 checked in" : ""}
                        </span>
                      </span>
                      <span className="text-xs text-rose-deep">edit ›</span>
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-ink-soft">No guests match.</p>}
      </div>
    </div>
  );
}

function GuestEditor({
  guest, groups, pending, onSave, onCancel, onDelete,
}: {
  guest: AdminGuest; groups: string[]; pending: boolean;
  onSave: (f: { displayName: string; altNames: string[]; maxPax: number; tableNumber: string | null; groupName: string | null; godparentRole: "Ninong" | "Ninang" | null }) => void;
  onCancel: () => void; onDelete: () => void;
}) {
  const [displayName, setDisplayName] = useState(guest.displayName);
  const [alt, setAlt] = useState(guest.altNames.join(", "));
  const [maxPax, setMaxPax] = useState(guest.maxPax);
  const [table, setTable] = useState(guest.tableNumber ?? "");
  const [group, setGroup] = useState(guest.groupName ?? "");
  const [role, setRole] = useState<string>(guest.godparentRole ?? "");

  return (
    <div className="rounded-xl border-2 border-rose/40 bg-white px-4 py-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><span className={label}>Name</span><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={input} /></div>
        <div className="col-span-2"><span className={label}>Nicknames / alt spellings (comma-separated)</span><input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Tita Demo, Demz" className={input} /></div>
        <div><span className={label}>Max pax</span><input type="number" min={1} value={maxPax} onChange={(e) => setMaxPax(Number(e.target.value))} className={input} /></div>
        <div><span className={label}>Table #</span><input value={table} onChange={(e) => setTable(e.target.value)} className={input} /></div>
        <div className="col-span-2">
          <span className={label}>Group / family (pick or type new)</span>
          <input list="admin-group-list" value={group} onChange={(e) => setGroup(e.target.value)} placeholder="e.g. Wong Family" className={input} />
          <datalist id="admin-group-list">
            {groups.map((g) => <option key={g} value={g} />)}
          </datalist>
        </div>
        <div className="col-span-2"><span className={label}>Godparent</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
            <option value="">— none —</option>
            <option value="Ninong">Ninong</option>
            <option value="Ninang">Ninang</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button disabled={pending}
          onClick={() => onSave({ displayName, altNames: alt.split(",").map((s) => s.trim()).filter(Boolean), maxPax, tableNumber: table || null, groupName: group || null, godparentRole: (role || null) as "Ninong" | "Ninang" | null })}
          className="rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">Save</button>
        <button onClick={onCancel} className="rounded-lg border border-blush-2 bg-white px-4 py-2 text-sm font-semibold text-ink-soft">Cancel</button>
        <button onClick={onDelete} disabled={pending} className="ml-auto rounded-lg border border-rose/40 px-4 py-2 text-sm font-semibold text-rose-deep">Delete</button>
      </div>
    </div>
  );
}
