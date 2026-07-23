"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Group, Member } from "@/lib/admin-data";
import { newGroup, editGroup, delGroup, newMember, editMember, delMember } from "../actions";

const input = "w-full rounded-lg border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const label = "block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft";

export default function GroupManager({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [pax, setPax] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => router.refresh();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setMsg(null);
    start(async () => { const r = await fn(); if (r.ok) refresh(); else setMsg(r.error ?? "Failed"); });
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    return groups.filter(
      (g) => g.name.toLowerCase().includes(s) || g.members.some((m) => m.displayName.toLowerCase().includes(s))
    );
  }, [groups, q]);

  return (
    <div>
      <div className="rounded-xl border border-blush-2 bg-blush/30 px-4 py-3 text-xs text-ink-soft">
        💡 An <strong className="text-rose-deep">invite is a Group</strong> (a person or a family). Set its <strong className="text-rose-deep">pax</strong> (total seats)
        and table <em>once</em>, then add the people in it. Everyone in the group shares that pax and can log in with their own name.
      </div>

      {/* New group */}
      <div className="mt-4 rounded-xl border border-blush-2 bg-white px-4 py-3">
        <p className={label}>New invite / group</p>
        <div className="mt-1 flex flex-wrap gap-2">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Wong Family, or Lola V)" className={`${input} flex-1`} />
          <div className="flex items-center gap-1">
            <span className="text-xs text-ink-soft">pax</span>
            <input type="number" min={1} value={pax} onChange={(e) => setPax(Number(e.target.value))} className="w-16 rounded-lg border border-blush-2 bg-white px-2 py-2 text-sm" />
          </div>
          <button onClick={() => { if (name.trim()) run(async () => { const r = await newGroup(name, pax); if (r.ok) { setName(""); setPax(1); } return r; }); }}
            disabled={pending} className="rounded-lg bg-rose px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">+ Create</button>
        </div>
      </div>

      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search group or person…" className={`${input} mt-3`} />
      {msg && <p className="mt-2 text-sm text-rose-deep">{msg}</p>}
      <p className="mt-3 text-xs text-ink-soft">{filtered.length} of {groups.length} groups</p>

      <div className="mt-2 space-y-3">
        {filtered.map((g) => (
          <GroupCard key={g.id} group={g} pending={pending} run={run} />
        ))}
      </div>
    </div>
  );
}

function GroupCard({ group, pending, run }: { group: Group; pending: boolean; run: (fn: () => Promise<{ ok: boolean; error?: string }>) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  const [pax, setPax] = useState(group.maxPax);
  const [table, setTable] = useState(group.tableNumber ?? "");
  const [memberName, setMemberName] = useState("");
  const [editMemberId, setEditMemberId] = useState<string | null>(null);

  const att =
    group.attendance === "both" ? " · ceremony + reception"
    : group.attendance === "reception" ? " · reception only"
    : group.attendance === "ceremony" ? " · ceremony only" : "";
  const status =
    group.rsvpStatus === "attending" ? `✅ ${group.confirmedPax ?? 0}/${group.maxPax} coming${att}`
    : group.rsvpStatus === "declined" ? "❌ declined" : "⏳ pending";

  return (
    <div className="rounded-2xl border border-blush-2 bg-white px-4 py-4">
      {editing ? (
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2"><span className={label}>Group name</span><input value={name} onChange={(e) => setName(e.target.value)} className={input} /></div>
          <div><span className={label}>Pax (seats)</span><input type="number" min={1} value={pax} onChange={(e) => setPax(Number(e.target.value))} className={input} /></div>
          <div><span className={label}>Table #</span><input value={table} onChange={(e) => setTable(e.target.value)} className={input} /></div>
          <div className="col-span-2 mt-1 flex gap-2">
            <button onClick={() => run(async () => { const r = await editGroup(group.id, { name, maxPax: pax, tableNumber: table || null }); if (r.ok) setEditing(false); return r; })} disabled={pending} className="rounded-lg bg-rose px-4 py-2 text-sm font-semibold text-white">Save</button>
            <button onClick={() => setEditing(false)} className="rounded-lg border border-blush-2 px-4 py-2 text-sm font-semibold text-ink-soft">Cancel</button>
            <button onClick={() => { if (confirm(`Delete group "${group.name}" and its members?`)) run(() => delGroup(group.id)); }} className="ml-auto rounded-lg border border-rose/40 px-4 py-2 text-sm font-semibold text-rose-deep">Delete group</button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg italic text-rose-deep">📁 {group.name}</p>
            <p className="text-xs text-ink-soft">{group.maxPax} pax{group.tableNumber ? ` · Table ${group.tableNumber}` : ""} · {status}</p>
          </div>
          <button onClick={() => setEditing(true)} className="text-xs text-rose-deep">edit ›</button>
        </div>
      )}

      {/* Members */}
      <div className="mt-3 space-y-1.5">
        {group.members.map((m) =>
          editMemberId === m.id ? (
            <MemberEditor key={m.id} member={m} pending={pending}
              onCancel={() => setEditMemberId(null)}
              onSave={(f) => run(async () => { const r = await editMember(m.id, f); if (r.ok) setEditMemberId(null); return r; })}
              onDelete={() => run(async () => { const r = await delMember(m.id); if (r.ok) setEditMemberId(null); return r; })}
            />
          ) : (
            <div key={m.id} className="flex items-center justify-between rounded-lg bg-blush/30 px-3 py-1.5 text-sm">
              <span className="text-ink">
                {m.displayName}
                {m.godparentRole && <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[0.6rem] font-semibold text-rose-deep">{m.godparentRole}</span>}
                {m.checkedIn && <span className="ml-2 text-[0.6rem] text-ink-soft">🎀 in</span>}
              </span>
              <button onClick={() => setEditMemberId(m.id)} className="text-xs text-rose-deep">edit</button>
            </div>
          )
        )}
        {group.members.length === 0 && <p className="text-xs text-ink-soft">No people yet — add them below.</p>}
      </div>

      {/* Add member */}
      <div className="mt-2 flex gap-2">
        <input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Add a person to this group…"
          onKeyDown={(e) => { if (e.key === "Enter" && memberName.trim()) run(async () => { const r = await newMember(group.id, memberName); if (r.ok) setMemberName(""); return r; }); }}
          className={`${input} text-sm`} />
        <button onClick={() => { if (memberName.trim()) run(async () => { const r = await newMember(group.id, memberName); if (r.ok) setMemberName(""); return r; }); }}
          disabled={pending} className="whitespace-nowrap rounded-lg border border-rose bg-white px-3 py-2 text-sm font-semibold text-rose-deep">+ Person</button>
      </div>
    </div>
  );
}

function MemberEditor({ member, pending, onSave, onCancel, onDelete }: {
  member: Member; pending: boolean;
  onSave: (f: { displayName: string; altNames: string[]; godparentRole: "Ninong" | "Ninang" | null }) => void;
  onCancel: () => void; onDelete: () => void;
}) {
  const [displayName, setDisplayName] = useState(member.displayName);
  const [alt, setAlt] = useState(member.altNames.join(", "));
  const [role, setRole] = useState<string>(member.godparentRole ?? "");
  return (
    <div className="rounded-lg border-2 border-rose/40 bg-white px-3 py-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2"><span className={label}>Name</span><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={input} /></div>
        <div className="col-span-2"><span className={label}>Nicknames / alt spellings</span><input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="comma-separated" className={input} /></div>
        <div className="col-span-2"><span className={label}>Godparent</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={input}>
            <option value="">— none —</option><option value="Ninong">Ninong</option><option value="Ninang">Ninang</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={pending} onClick={() => onSave({ displayName, altNames: alt.split(",").map((s) => s.trim()).filter(Boolean), godparentRole: (role || null) as "Ninong" | "Ninang" | null })}
          className="rounded-lg bg-rose px-4 py-1.5 text-sm font-semibold text-white">Save</button>
        <button onClick={onCancel} className="rounded-lg border border-blush-2 px-3 py-1.5 text-sm font-semibold text-ink-soft">Cancel</button>
        <button onClick={onDelete} className="ml-auto rounded-lg border border-rose/40 px-3 py-1.5 text-sm font-semibold text-rose-deep">Remove</button>
      </div>
    </div>
  );
}
