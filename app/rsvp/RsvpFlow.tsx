"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import * as api from "./actions";
import type { Pass } from "./actions";
import type { SearchHit } from "@/lib/guests";
import Confetti from "../components/Confetti";
import { FloralDivider } from "../components/Decor";
import content from "../content";

const QUESTIONS = [
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is your favorite food?",
  "What is your favorite color?",
];

type Selected = { id: string; displayName: string; groupName: string | null; isOnline: boolean; hasPin: boolean; securityQuestion: string | null };

const field = "mt-1 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const labelCls = "mt-3 block text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";

export default function RsvpFlow({ initialPass, onPassChange, initialInviteToken }: { initialPass: Pass | null; onPassChange?: (p: Pass | null) => void; initialInviteToken?: string | null }) {
  const [pass, setPass] = useState<Pass | null>(initialPass);
  useEffect(() => { onPassChange?.(pass); }, [pass, onPassChange]);
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState<Selected | null>(null);
  const inviteHandled = useRef(false);
  const [burst, setBurst] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Opened via a shared invite link: jump straight to this person's PIN setup.
  useEffect(() => {
    if (inviteHandled.current || !initialInviteToken || initialPass) return;
    inviteHandled.current = true;
    start(async () => {
      const g = await api.getInvite(initialInviteToken);
      if (g) setSel({ id: g.id, displayName: g.displayName, groupName: g.groupName, isOnline: g.isOnline, hasPin: g.hasPin, securityQuestion: g.securityQuestion });
    });
  }, [initialInviteToken, initialPass]);

  const refreshPass = () => start(async () => { const p = await api.myPass(); if (p) setPass(p); });

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [pin, setPin] = useState("");
  const [q, setQ] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [forgot, setForgot] = useState(false);

  function run(fn: () => Promise<void>) {
    setError(null);
    start(async () => { try { await fn(); } catch { setError("Oops, something went wrong. Please try again."); } });
  }

  function onAuthed(r: Awaited<ReturnType<typeof api.login>>) {
    if (!r.ok) return setError(r.error);
    setSel(null); setPin(""); setAnswer(""); setForgot(false);
    setPass(r.pass);
    setEditing(r.pass.pass.rsvpStatus === "pending");
  }
  function fullReset() {
    setPass(null); setEditing(false); setSel(null); setHits(null); setQuery(""); setPin(""); setForgot(false); setError(null);
  }

  return (
    <>
      <Confetti key={burst} fire={burst > 0} />

      {pass && editing ? (
        <RsvpForm pass={pass} pending={pending} error={error}
          onCancel={pass.pass.rsvpStatus === "pending" ? undefined : () => setEditing(false)}
          onSubmit={(status, attendance) => run(async () => {
            const r = await api.submitRsvp(status, attendance);
            if (r.ok) { setPass(r.pass); setEditing(false); if (r.pass.pass.rsvpStatus === "attending") setBurst((b) => b + 1); }
            else setError(r.error);
          })}
        />
      ) : pass ? (
        <>
          <PassCard pass={pass} onEdit={() => { setError(null); setEditing(true); }}
            onLogout={() => run(async () => { await api.logout(); fullReset(); })} />
          <GroupPanel meId={pass.pass.memberId} onChanged={refreshPass} />
        </>
      ) : sel && sel.isOnline ? (
        <Card>
          <BackButton onClick={() => { setSel(null); setError(null); }} />
          <div className="text-4xl">🌏</div>
          <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/70">Celebrating from afar</p>
          <h2 className="mt-1 font-script text-4xl text-rose-deep">{sel.displayName}</h2>
          <FloralDivider className="mt-3" />
          <p className="mt-4 text-sm leading-relaxed text-ink">
            We know you&apos;re far away, but you&apos;re right here in our hearts. 💕 On <strong className="text-rose-deep">{content.dateLong}</strong>, as
            we gather for {content.celebrantFirst}&apos;s baptism, we&apos;ll be thinking of you and wishing you were beside us.
          </p>
          <div className="mt-4 rounded-2xl bg-blush/40 px-4 py-3 text-left text-sm">
            <p className="font-semibold text-rose-deep">You&apos;re part of the day 🕊️</p>
            <p className="mt-1 leading-relaxed text-ink-soft">
              We&apos;ll send you the livestream link so you can watch the ceremony live and celebrate with us in real time.
              No RSVP needed — we&apos;ve already saved you a place in spirit.
            </p>
          </div>
          <p className="mt-4 text-sm text-ink-soft">Sending all our love across the miles. 🎀</p>
          <p className="mt-6 text-center text-xs text-ink-soft"><Link href="/" className="underline">← Back to the invitation</Link></p>
        </Card>
      ) : sel ? (
        <Card>
          <BackButton onClick={() => { setSel(null); setError(null); setPin(""); setForgot(false); }} />
          <h2 className="font-script text-4xl text-rose-deep">{sel.displayName}</h2>
          {sel.groupName && <p className="mt-1 text-xs text-ink-soft">Part of the {sel.groupName} invite</p>}

          {!sel.hasPin && (
            <Form label="Set a private 4-digit PIN" help="Use your name + this PIN to view your pass anytime."
              pin={pin} setPin={setPin} pending={pending} cta="Save & continue"
              extra={<>
                <label className={labelCls}>Security question</label>
                <select value={q} onChange={(e) => setQ(e.target.value)} className={field}>{QUESTIONS.map((x) => <option key={x}>{x}</option>)}</select>
                <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" className={`${field} mt-2`} />
              </>}
              onSubmit={() => run(async () => onAuthed(await api.setPin(sel.id, pin, q, answer)))} />
          )}
          {sel.hasPin && !forgot && (
            <Form label="Enter your PIN" pin={pin} setPin={setPin} pending={pending} cta="Log in"
              onSubmit={() => run(async () => onAuthed(await api.login(sel.id, pin)))}
              footer={<button className="mt-3 text-xs text-rose-deep underline" onClick={() => { setForgot(true); setError(null); setPin(""); }}>Forgot PIN?</button>} />
          )}
          {sel.hasPin && forgot && (
            <Form label="Reset your PIN" help={sel.securityQuestion ?? "Answer your security question"}
              pin={pin} setPin={setPin} pinLabel="New 4-digit PIN" pending={pending} cta="Reset PIN"
              extra={<input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer to your security question" className={`${field} mt-2`} />}
              onSubmit={() => run(async () => onAuthed(await api.resetPin(sel.id, answer, pin)))}
              footer={<button className="mt-3 text-xs text-ink-soft underline" onClick={() => { setForgot(false); setError(null); setPin(""); }}>Back to log in</button>} />
          )}
          {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
        </Card>
      ) : (
        <Card>
          <h2 className="font-display text-3xl italic text-rose-deep">Find your invite</h2>
          <p className="mt-1 text-sm text-ink-soft">Type your name (or nickname) to RSVP.</p>
          <input autoFocus value={query}
            onChange={(e) => { const v = e.target.value; setQuery(v); run(async () => setHits(await api.search(v))); }}
            placeholder="Your name…" className="mt-4 w-full rounded-2xl border border-blush-2 bg-white px-4 py-3 text-center text-lg outline-none focus:border-rose" />
          <div className="mt-3 space-y-2">
            {hits?.map((h) => (
              <button key={h.id} onClick={() => run(async () => { const g = await api.getGuest(h.id); if (g) setSel({ id: h.id, ...g }); })}
                className="hover-lift flex w-full items-center justify-between rounded-2xl border border-blush-2 bg-white/70 px-4 py-3 text-left">
                <span className="font-semibold text-ink">{h.displayName}</span>
                {h.groupName && <span className="text-xs text-ink-soft">{h.groupName}</span>}
              </button>
            ))}
            {hits && hits.length === 0 && query.trim().length >= 2 && !pending && (
              <p className="text-sm text-ink-soft">No match found — check the spelling or ask the host.</p>
            )}
          </div>
        </Card>
      )}
    </>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="anim-fade-up mx-auto max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-6 py-8 text-center shadow-[0_20px_50px_-30px_rgba(183,110,125,0.65)]">{children}</div>;
}
function BackButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="mb-2 text-xs text-ink-soft underline">← Back</button>;
}

function Form({ label, help, pin, setPin, pinLabel = "4-digit PIN", extra, footer, cta, pending, onSubmit }: {
  label: string; help?: string; pin: string; setPin: (v: string) => void; pinLabel?: string;
  extra?: React.ReactNode; footer?: React.ReactNode; cta: string; pending: boolean; onSubmit: () => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {help && <p className="mt-1 text-xs text-ink-soft">{help}</p>}
      <label className={labelCls}>{pinLabel}</label>
      <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="••••"
        className="mt-1 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2 text-center text-2xl tracking-[0.5em] outline-none focus:border-rose" />
      {extra}
      <button onClick={onSubmit} disabled={pending} className="hover-lift mt-5 w-full rounded-full bg-rose px-6 py-3 font-semibold text-white shadow-[0_14px_30px_-16px_rgba(183,110,125,0.9)] disabled:opacity-60">
        {pending ? "Please wait…" : cta}
      </button>
      {footer}
    </div>
  );
}

function RsvpForm({ pass, pending, error, onSubmit, onCancel }: {
  pass: Pass; pending: boolean; error: string | null;
  onSubmit: (status: "attending" | "declined", attendance: "both" | "reception") => void; onCancel?: () => void;
}) {
  const p = pass.pass;
  const others = p.group.members.filter((m) => m !== p.memberName);
  const [attendance, setAttendance] = useState<"both" | "reception">(p.attendance === "reception" ? "reception" : "both");

  return (
    <Card>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">RSVP</p>
      <h2 className="mt-1 font-script text-4xl text-rose-deep">{p.memberName}</h2>
      {p.group.name && <p className="mt-1 text-xs text-ink-soft">{p.group.name} invite{others.length > 0 ? ` · with ${others.join(", ")}` : ""}</p>}

      {p.godparentRole && (
        <div className="mt-3 rounded-2xl border border-rose/40 bg-gradient-to-r from-blush/70 to-white px-4 py-3">
          <p className="text-[0.58rem] font-semibold uppercase tracking-[0.26em] text-rose-deep/70">A special role</p>
          <p className="mt-0.5 font-script text-2xl text-rose-deep">You&apos;re Amari&apos;s {p.godparentRole} 🕊️</p>
        </div>
      )}

      <p className="mt-3 rounded-2xl bg-blush/40 px-4 py-2 text-sm text-ink">
        {p.isOnline ? "You're joining online from abroad 🌏" : "This is your own RSVP — everyone in your group answers for themselves."}
      </p>

      {!p.isOnline && (
        <>
          <label className={labelCls}>Which will you attend?</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {([["both", "Ceremony + Reception"], ["reception", "Reception only"]] as const).map(([v, t]) => (
              <button key={v} type="button" onClick={() => setAttendance(v)}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${attendance === v ? "border-rose bg-rose text-white" : "border-blush-2 bg-white text-rose-deep"}`}>{t}</button>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => onSubmit("attending", attendance)} disabled={pending} className="hover-lift w-full rounded-full bg-rose px-6 py-3.5 font-semibold text-white shadow-[0_16px_32px_-16px_rgba(183,110,125,0.95)] disabled:opacity-60">
          {pending ? "Saving…" : p.isOnline ? "I'll join online" : "I'll be there"}
        </button>
        <button onClick={() => onSubmit("declined", attendance)} disabled={pending} className="w-full rounded-full border border-rose bg-white px-6 py-3 font-semibold text-rose-deep disabled:opacity-60">
          Sorry, I can&apos;t make it
        </button>
        {onCancel && <button onClick={onCancel} className="text-xs text-ink-soft underline">Cancel</button>}
      </div>
      {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
    </Card>
  );
}

function PassCard({ pass, onEdit, onLogout }: { pass: Pass; onEdit: () => void; onLogout: () => void }) {
  const p = pass.pass;
  const others = p.group.members.filter((m) => m !== p.memberName);
  const attending = p.rsvpStatus === "attending";
  const declined = p.rsvpStatus === "declined";
  const attLabel = p.attendance === "both" ? "Ceremony + Reception" : p.attendance === "reception" ? "Reception only" : p.attendance === "ceremony" ? "Ceremony only" : null;
  return (
    <Card>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">Your Pass</p>
      <h2 className="mt-1 font-script text-5xl text-rose-deep">{p.memberName}</h2>
      {p.group.name && <p className="text-xs text-ink-soft">{p.group.name} invite{others.length > 0 ? ` · with ${others.join(", ")}` : ""}</p>}
      <FloralDivider className="mt-3" />

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        {p.godparentRole && <Badge>🕊️ {p.godparentRole}</Badge>}
        <Badge>{attending ? "Attending" : declined ? "Not attending" : "RSVP pending"}</Badge>
        {p.isOnline ? <Badge>Joining online</Badge> : (<>{attending && attLabel && <Badge>{attLabel}</Badge>}{p.group.tableNumber && <Badge>Table {p.group.tableNumber}</Badge>}</>)}
      </div>

      {attending && p.isOnline && (
        <p className="mt-5 rounded-2xl bg-blush/40 px-4 py-3 text-sm text-ink">
          You&apos;re joining online from abroad 🌏 — no check-in needed. We&apos;ll share the livestream details with you.
        </p>
      )}
      {attending && !p.isOnline && (
        <>
          <div className="mx-auto mt-5 inline-block rounded-3xl border border-dashed border-blush-2 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pass.qrDataUrl} alt="Your check-in QR code" className="h-52 w-52" />
          </div>
          <p className="mt-2 text-xs text-ink-soft">Your personal pass — show this QR at the entrance.</p>
        </>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <button onClick={onEdit} className="text-sm text-rose-deep underline">Change my response</button>
        <button onClick={onLogout} className="text-xs text-ink-soft underline">Not you? Log out</button>
        <Link href="/" className="text-xs text-rose-deep underline">← Back to the invitation</Link>
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-blush-2 bg-blush/60 px-3 py-1 font-semibold text-rose-deep">{children}</span>;
}

function memberStatusLabel(m: api.GroupMemberRsvp): string {
  if (m.isOnline) return "Abroad — celebrating online 🌏";
  if (m.rsvpStatus === "attending") return m.attendance === "reception" ? "Coming · Reception only" : "Coming · Ceremony + Reception";
  if (m.rsvpStatus === "declined") return "Not coming";
  return "No response yet";
}

function GroupPanel({ meId, onChanged }: { meId: string; onChanged?: () => void }) {
  const [group, setGroup] = useState<api.MyGroup | null>(null);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { start(async () => setGroup(await api.myGroup())); }, []);

  function apply(fn: () => Promise<{ ok: true; group: api.MyGroup } | { ok: false; error: string }>) {
    setMsg(null);
    start(async () => {
      try {
        const r = await fn();
        if (r.ok) { setGroup(r.group); onChanged?.(); }
        else setMsg(r.error);
      } catch { setMsg("Something went wrong. Please try again."); }
    });
  }
  const setFor = (id: string, status: "attending" | "declined", attendance: "both" | "reception") =>
    apply(() => api.submitRsvpFor(id, status, attendance));
  const rsvpAll = () => apply(() => api.submitRsvpAll("attending", "both"));

  function copyLink(token: string, id: string) {
    const url = `${window.location.origin}/?i=${encodeURIComponent(token)}`;
    navigator.clipboard?.writeText(url)
      .then(() => { setCopied(id); setTimeout(() => setCopied(null), 1600); })
      .catch(() => setMsg("Couldn't copy — long-press the link to copy it manually."));
  }

  if (!group || group.members.length <= 1) return null;

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-semibold transition ${active ? "border-rose bg-rose text-white" : "border-blush-2 bg-white text-rose-deep"}`;

  return (
    <div className="anim-fade-up mx-auto mt-5 max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-6 py-6 text-left shadow-[0_20px_50px_-30px_rgba(183,110,125,0.6)]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-display text-xl italic text-rose-deep">Your group</h3>
        {group.groupName && <span className="text-xs text-ink-soft">{group.groupName}</span>}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">
        RSVP for yourself, for anyone here, or for everyone at once. Send each person their private link so they can set
        their own PIN — no name search needed.
      </p>

      <button onClick={rsvpAll} disabled={pending}
        className="hover-lift mt-3 w-full rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_26px_-16px_rgba(183,110,125,0.9)] disabled:opacity-60">
        Everyone&apos;s coming · Ceremony + Reception
      </button>

      <div className="mt-4 space-y-2">
        {group.members.map((m) => (
          <div key={m.id} className="rounded-2xl border border-blush-2 bg-white px-3.5 py-3">
            <p className="text-sm font-semibold text-ink">
              {m.name}{m.id === meId ? " (you)" : ""}
              {m.godparentRole && <span className="ml-1 text-rose-deep">· {m.godparentRole} 🕊️</span>}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">{memberStatusLabel(m)}</p>
            {!m.isOnline && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <button onClick={() => setFor(m.id, "attending", "both")} disabled={pending}
                  className={chip(m.rsvpStatus === "attending" && m.attendance !== "reception")}>Coming</button>
                <button onClick={() => setFor(m.id, "attending", "reception")} disabled={pending}
                  className={chip(m.rsvpStatus === "attending" && m.attendance === "reception")}>Reception only</button>
                <button onClick={() => setFor(m.id, "declined", "both")} disabled={pending}
                  className={chip(m.rsvpStatus === "declined")}>Can&apos;t</button>
                <button onClick={() => copyLink(m.inviteToken, m.id)}
                  className="ml-auto rounded-full border border-blush-2 bg-white px-3 py-1 text-xs font-semibold text-rose-deep">
                  {copied === m.id ? "Copied ✓" : "Copy link"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {msg && <p className="mt-3 text-sm text-rose-deep">{msg}</p>}
    </div>
  );
}
