"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Group, Member } from "@/lib/admin-data";
import { makeInvite, editGroup, delGroup, newMember, editMember, delMember, toggleOnline, setInviteRsvp } from "../actions";

const inp = "w-full rounded-md border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const lbl = "block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft";
const btn = "rounded-md bg-rose px-4 py-2 text-sm font-semibold text-white disabled:opacity-60";
const btnGhost = "rounded-md border border-blush-2 bg-white px-4 py-2 text-sm font-semibold text-ink-soft";
const PER_PAGE = 12;

export default function GroupManager({ groups }: { groups: Group[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const refresh = () => router.refresh();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setMsg(null);
    start(async () => { const r = await fn(); if (r.ok) refresh(); else setMsg(r.error ?? "Failed"); });
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return groups;
    return groups.filter((g) => g.name.toLowerCase().includes(s) || g.members.some((m) => m.displayName.toLowerCase().includes(s)));
  }, [groups, q]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PER_PAGE, current * PER_PAGE + PER_PAGE);

  const activeGroup = selected ? groups.find((g) => g.id === selected) ?? null : null;

  if (activeGroup) {
    return <GroupDetail group={activeGroup} pending={pending} run={run} onBack={() => setSelected(null)} msg={msg} />;
  }

  return (
    <div>
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search invite or person" className={`${inp} max-w-xs flex-1`} />
        {!creating && <button onClick={() => setCreating(true)} className={btn}>New invite</button>}
      </div>

      {creating && (
        <NewInvite pending={pending}
          onCancel={() => setCreating(false)}
          onCreate={(name, pax, table, members) => run(async () => {
            const r = await makeInvite(name, pax, table, members);
            if (r.ok) setCreating(false);
            return r;
          })}
        />
      )}
      {msg && !creating && <p className="mt-2 text-sm text-rose-deep">{msg}</p>}

      {/* table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-blush-2">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-blush/40 text-[0.66rem] uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Invite</th>
              <th className="px-3 py-2.5 font-semibold">Pax</th>
              <th className="px-3 py-2.5 font-semibold">Table</th>
              <th className="px-3 py-2.5 font-semibold">RSVP</th>
              <th className="px-4 py-2.5 font-semibold">People</th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((g) => {
              const att = g.attendance === "both" ? "Ceremony + Reception" : g.attendance === "reception" ? "Reception only" : g.attendance === "ceremony" ? "Ceremony only" : "";
              const rsvp = g.rsvpStatus === "attending" ? `Attending (${g.confirmedPax ?? 0})` : g.rsvpStatus === "declined" ? "Declined" : "Pending";
              return (
                <tr key={g.id} className="border-t border-blush-2/70 hover:bg-blush/20">
                  <td className="px-4 py-2.5 font-semibold text-ink">{g.name}{g.members.some((m) => m.isOnline) && <span className="ml-2 rounded-full bg-sky/50 px-2 py-0.5 text-[0.6rem] font-semibold text-ink-soft">Online</span>}</td>
                  <td className="px-3 py-2.5 tabular-nums text-ink-soft">{g.maxPax}</td>
                  <td className="px-3 py-2.5 text-ink-soft">{g.tableNumber || "—"}</td>
                  <td className="px-3 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${g.rsvpStatus === "attending" ? "bg-sage/40 text-sage-deep" : g.rsvpStatus === "declined" ? "bg-blush-2 text-rose-deep" : "bg-white text-ink-soft"}`}>{rsvp}</span>
                    {att && <span className="ml-1 block text-[0.65rem] text-ink-soft">{att}</span>}
                  </td>
                  <td className="max-w-[220px] truncate px-4 py-2.5 text-ink-soft">{g.members.map((m) => m.displayName).join(", ") || "—"}</td>
                  <td className="px-3 py-2.5 text-right"><button onClick={() => setSelected(g.id)} className="text-xs font-semibold text-rose-deep">Manage</button></td>
                </tr>
              );
            })}
            {rows.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-ink-soft">No invites found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div className="mt-3 flex items-center justify-between text-sm text-ink-soft">
        <span>{filtered.length} invites</span>
        <div className="flex items-center gap-2">
          <button disabled={current === 0} onClick={() => setPage(current - 1)} className={`${btnGhost} px-3 py-1 disabled:opacity-40`}>Prev</button>
          <span>Page {current + 1} / {pageCount}</span>
          <button disabled={current >= pageCount - 1} onClick={() => setPage(current + 1)} className={`${btnGhost} px-3 py-1 disabled:opacity-40`}>Next</button>
        </div>
      </div>
    </div>
  );
}

function NewInvite({ pending, onCreate, onCancel }: {
  pending: boolean;
  onCreate: (name: string, pax: number, table: string | null, members: string[]) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [pax, setPax] = useState(1);
  const [table, setTable] = useState("");
  const [members, setMembers] = useState("");
  return (
    <div className="mt-3 rounded-lg border border-rose/40 bg-white px-4 py-4">
      <p className="font-display text-lg italic text-rose-deep">New invite</p>
      <div className="mt-2 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><span className={lbl}>Invite name (person or family)</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Wong Family — or — Lola V" className={inp} /></div>
        <div><span className={lbl}>Total pax (seats)</span><input type="number" min={1} value={pax} onChange={(e) => setPax(Number(e.target.value))} className={inp} /></div>
        <div><span className={lbl}>Table (optional)</span><input value={table} onChange={(e) => setTable(e.target.value)} className={inp} /></div>
        <div className="sm:col-span-3"><span className={lbl}>People in this invite (one name per line)</span><textarea value={members} onChange={(e) => setMembers(e.target.value)} rows={3} placeholder={"Maria\nJunjun\nTita"} className={`${inp} resize-y`} /></div>
      </div>
      <p className="mt-2 text-xs text-ink-soft">Mark individual people as &ldquo;online (from abroad)&rdquo; after adding them, via Edit.</p>
      <div className="mt-3 flex gap-2">
        <button disabled={pending || !name.trim()} className={btn}
          onClick={() => onCreate(name, pax, table || null, members.split("\n").map((m) => m.trim()).filter(Boolean))}>Create invite</button>
        <button onClick={onCancel} className={btnGhost}>Cancel</button>
      </div>
    </div>
  );
}

function GroupDetail({ group, pending, run, onBack, msg }: {
  group: Group; pending: boolean; onBack: () => void; msg: string | null;
  run: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
}) {
  const [name, setName] = useState(group.name);
  const [pax, setPax] = useState(group.maxPax);
  const [table, setTable] = useState(group.tableNumber ?? "");
  const [memberName, setMemberName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [showAttending, setShowAttending] = useState(false);
  const [rsvpPax, setRsvpPax] = useState(group.confirmedPax && group.confirmedPax > 0 ? group.confirmedPax : group.maxPax);
  const [rsvpAtt, setRsvpAtt] = useState<"both" | "reception">(group.attendance === "reception" ? "reception" : "both");

  const rsvpLabel =
    group.rsvpStatus === "attending"
      ? `Attending — ${group.confirmedPax ?? 0} coming${group.attendance === "reception" ? " (reception only)" : group.attendance === "both" ? " (ceremony + reception)" : ""}`
      : group.rsvpStatus === "declined" ? "Declined" : "Pending";

  return (
    <div>
      <button onClick={onBack} className="text-sm font-semibold text-rose-deep">← Back to all invites</button>

      <div className="mt-3 rounded-lg border border-blush-2 bg-white px-4 py-4">
        <p className={lbl}>Invite details</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2"><span className={lbl}>Name</span><input value={name} onChange={(e) => setName(e.target.value)} className={inp} /></div>
          <div><span className={lbl}>Pax</span><input type="number" min={1} value={pax} onChange={(e) => setPax(Number(e.target.value))} className={inp} /></div>
          <div><span className={lbl}>Table</span><input value={table} onChange={(e) => setTable(e.target.value)} className={inp} /></div>
        </div>
        <div className="mt-3 flex gap-2">
          <button disabled={pending} onClick={() => run(() => editGroup(group.id, { name, maxPax: pax, tableNumber: table || null }))} className={btn}>Save</button>
          <button disabled={pending} onClick={() => { if (confirm(`Delete "${group.name}" and everyone in it?`)) { run(() => delGroup(group.id)); onBack(); } }} className="ml-auto rounded-md border border-rose/40 px-4 py-2 text-sm font-semibold text-rose-deep">Delete invite</button>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-blush-2 bg-white px-4 py-4">
        <p className={lbl}>RSVP (set manually)</p>
        <p className="mt-1 text-sm text-ink">Current: <strong className="text-rose-deep">{rsvpLabel}</strong></p>
        <div className="mt-2 flex flex-wrap gap-2">
          <button onClick={() => setShowAttending((v) => !v)} className={btnGhost}>Mark attending…</button>
          <button disabled={pending} onClick={() => run(() => setInviteRsvp(group.id, "declined", 0, null))} className={btnGhost}>Mark declined</button>
          <button disabled={pending} onClick={() => run(() => setInviteRsvp(group.id, "pending", 0, null))} className={btnGhost}>Reset to pending</button>
        </div>
        {showAttending && (
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div><span className={lbl}>Coming (pax)</span>
              <select value={rsvpPax} onChange={(e) => setRsvpPax(Number(e.target.value))} className={inp}>
                {Array.from({ length: group.maxPax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div><span className={lbl}>Attendance</span>
              <select value={rsvpAtt} onChange={(e) => setRsvpAtt(e.target.value as "both" | "reception")} className={inp}>
                <option value="both">Ceremony + Reception</option>
                <option value="reception">Reception only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button disabled={pending} onClick={() => run(async () => { const r = await setInviteRsvp(group.id, "attending", rsvpPax, rsvpAtt); if (r.ok) setShowAttending(false); return r; })} className={btn}>Confirm attending</button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-blush-2 bg-white px-4 py-4">
        <p className={lbl}>People ({group.members.length})</p>
        <div className="mt-2 space-y-1.5">
          {group.members.map((m) => editId === m.id ? (
            <MemberEditor key={m.id} member={m} pending={pending}
              onCancel={() => setEditId(null)}
              onSave={(f) => run(async () => { const r = await editMember(m.id, f); if (r.ok) setEditId(null); return r; })}
              onDelete={() => run(async () => { const r = await delMember(m.id); if (r.ok) setEditId(null); return r; })}
            />
          ) : (
            <div key={m.id} className="flex items-center justify-between gap-2 rounded-md border border-blush-2/70 px-3 py-2 text-sm">
              <span className="min-w-0 truncate text-ink">{m.displayName}
                {m.godparentRole && <span className="ml-2 rounded-full bg-blush px-2 py-0.5 text-[0.6rem] font-semibold text-rose-deep">{m.godparentRole}</span>}
              </span>
              <div className="flex flex-none items-center gap-2">
                <span className="text-[0.62rem] uppercase tracking-wide text-ink-soft">Online</span>
                <button type="button" role="switch" aria-checked={m.isOnline} disabled={pending}
                  onClick={() => run(() => toggleOnline(m.id, !m.isOnline))} title="Online (from abroad)"
                  className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition ${m.isOnline ? "bg-sky" : "bg-blush-2"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${m.isOnline ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
                <button onClick={() => setEditId(m.id)} className="text-xs font-semibold text-rose-deep">Edit</button>
              </div>
            </div>
          ))}
          {group.members.length === 0 && <p className="text-sm text-ink-soft">No people yet.</p>}
        </div>
        <div className="mt-3 flex gap-2">
          <input value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="Add a person"
            onKeyDown={(e) => { if (e.key === "Enter" && memberName.trim()) run(async () => { const r = await newMember(group.id, memberName); if (r.ok) setMemberName(""); return r; }); }}
            className={inp} />
          <button disabled={pending || !memberName.trim()} onClick={() => run(async () => { const r = await newMember(group.id, memberName); if (r.ok) setMemberName(""); return r; })} className={btnGhost}>Add</button>
        </div>
      </div>
      {msg && <p className="mt-2 text-sm text-rose-deep">{msg}</p>}
    </div>
  );
}

function MemberEditor({ member, pending, onSave, onCancel, onDelete }: {
  member: Member; pending: boolean;
  onSave: (f: { displayName: string; altNames: string[]; godparentRole: "Ninong" | "Ninang" | null; isOnline: boolean }) => void;
  onCancel: () => void; onDelete: () => void;
}) {
  const [displayName, setDisplayName] = useState(member.displayName);
  const [alt, setAlt] = useState(member.altNames.join(", "));
  const [role, setRole] = useState<string>(member.godparentRole ?? "");
  const online = member.isOnline; // toggled from the row; preserved on save
  return (
    <div className="rounded-md border-2 border-rose/40 bg-white px-3 py-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <div><span className={lbl}>Name</span><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inp} /></div>
        <div><span className={lbl}>Nicknames (comma-sep)</span><input value={alt} onChange={(e) => setAlt(e.target.value)} className={inp} /></div>
        <div><span className={lbl}>Godparent</span>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inp}>
            <option value="">None</option><option value="Ninong">Ninong</option><option value="Ninang">Ninang</option>
          </select>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button disabled={pending} onClick={() => onSave({ displayName, altNames: alt.split(",").map((s) => s.trim()).filter(Boolean), godparentRole: (role || null) as "Ninong" | "Ninang" | null, isOnline: online })} className={btn}>Save</button>
        <button onClick={onCancel} className={btnGhost}>Cancel</button>
        <button onClick={onDelete} disabled={pending} className="ml-auto rounded-md border border-rose/40 px-3 py-1.5 text-sm font-semibold text-rose-deep">Remove</button>
      </div>
    </div>
  );
}
