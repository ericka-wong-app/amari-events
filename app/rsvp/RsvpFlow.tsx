"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import * as api from "./actions";
import type { Pass } from "./actions";
import type { SearchHit } from "@/lib/guests";
import Confetti from "../components/Confetti";
import { FloralDivider } from "../components/Decor";

const QUESTIONS = [
  "What city were you born in?",
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What is your favorite food?",
  "What is your favorite color?",
];

type Selected = {
  id: string;
  displayName: string;
  groupName: string | null;
  hasPin: boolean;
  securityQuestion: string | null;
};

const field = "mt-1 w-full rounded-2xl border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const labelCls = "mt-3 block text-left text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-ink-soft";

export default function RsvpFlow({ initialPass }: { initialPass: Pass | null }) {
  const [pass, setPass] = useState<Pass | null>(initialPass);
  const [editing, setEditing] = useState(false);
  const [sel, setSel] = useState<Selected | null>(null);
  const [burst, setBurst] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [pin, setPin] = useState("");
  const [q, setQ] = useState(QUESTIONS[0]);
  const [answer, setAnswer] = useState("");
  const [forgot, setForgot] = useState(false);

  function run(fn: () => Promise<void>) {
    setError(null);
    start(async () => {
      try { await fn(); } catch { setError("Oops, something went wrong. Please try again."); }
    });
  }

  function onAuthed(r: Awaited<ReturnType<typeof api.login>>) {
    if (!r.ok) return setError(r.error);
    setSel(null); setPin(""); setAnswer(""); setForgot(false);
    setPass(r.pass);
    setEditing(r.pass.pass.group.rsvpStatus === "pending");
  }

  function fullReset() {
    setPass(null); setEditing(false); setSel(null); setHits(null); setQuery(""); setPin(""); setForgot(false); setError(null);
  }

  return (
    <>
      <Confetti key={burst} fire={burst > 0} />

      {pass && editing ? (
        <RsvpForm pass={pass} pending={pending} error={error}
          onCancel={pass.pass.group.rsvpStatus === "pending" ? undefined : () => setEditing(false)}
          onSubmit={(status, pax, attendance) => run(async () => {
            const r = await api.submitRsvp(status, pax, attendance);
            if (r.ok) { setPass(r.pass); setEditing(false); if (r.pass.pass.group.rsvpStatus === "attending") setBurst((b) => b + 1); }
            else setError(r.error);
          })}
        />
      ) : pass ? (
        <PassCard pass={pass} onEdit={() => { setError(null); setEditing(true); }}
          onLogout={() => run(async () => { await api.logout(); fullReset(); })} />
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
          <p className="mt-6 text-center text-xs text-ink-soft"><Link href="/" className="underline">← Back to the invitation</Link></p>
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
  onSubmit: (status: "attending" | "declined", pax: number, attendance: "both" | "reception") => void; onCancel?: () => void;
}) {
  const g = pass.pass.group;
  const online = pass.pass.memberIsOnline;
  const others = g.members.filter((m) => m !== pass.pass.memberName);
  const [pax, setPax] = useState(g.confirmedPax && g.confirmedPax > 0 ? g.confirmedPax : g.maxPax);
  const [attendance, setAttendance] = useState<"both" | "reception">(g.attendance === "reception" ? "reception" : "both");

  return (
    <Card>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">RSVP</p>
      <h2 className="mt-1 font-script text-4xl text-rose-deep">{pass.pass.memberName}</h2>
      <p className="mt-1 text-xs text-ink-soft">
        {g.name} invite{others.length > 0 ? ` · with ${others.join(", ")}` : ""}
      </p>
      <p className="mt-3 rounded-2xl bg-blush/40 px-4 py-2 text-sm text-ink">
        {online
          ? "Your invite is joining online from abroad 🌏"
          : <>Your group has <strong className="text-rose-deep">{g.maxPax}</strong> {g.maxPax === 1 ? "seat" : "seats"} in total.</>}
      </p>

      {!online && (
        <>
          <label className={labelCls}>Which will your group attend?</label>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {([["both", "Ceremony + Reception"], ["reception", "Reception only"]] as const).map(([v, t]) => (
              <button key={v} type="button" onClick={() => setAttendance(v)}
                className={`rounded-2xl border px-3 py-2 text-sm font-semibold ${attendance === v ? "border-rose bg-rose text-white" : "border-blush-2 bg-white text-rose-deep"}`}>{t}</button>
            ))}
          </div>
        </>
      )}

      <label className={labelCls}>{online ? "How many are joining online?" : "How many of your group are coming?"}</label>
      <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={field}>
        {Array.from({ length: g.maxPax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => onSubmit("attending", pax, attendance)} disabled={pending} className="hover-lift w-full rounded-full bg-rose px-6 py-3.5 font-semibold text-white shadow-[0_16px_32px_-16px_rgba(183,110,125,0.95)] disabled:opacity-60">
          {pending ? "Saving…" : "We'll be there"}
        </button>
        <button onClick={() => onSubmit("declined", 0, attendance)} disabled={pending} className="w-full rounded-full border border-rose bg-white px-6 py-3 font-semibold text-rose-deep disabled:opacity-60">
          Sorry, we can&apos;t make it
        </button>
        {onCancel && <button onClick={onCancel} className="text-xs text-ink-soft underline">Cancel</button>}
      </div>
      {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
    </Card>
  );
}

function PassCard({ pass, onEdit, onLogout }: { pass: Pass; onEdit: () => void; onLogout: () => void }) {
  const g = pass.pass.group;
  const online = pass.pass.memberIsOnline;
  const others = g.members.filter((m) => m !== pass.pass.memberName);
  const attending = g.rsvpStatus === "attending";
  const declined = g.rsvpStatus === "declined";
  const attLabel = g.attendance === "both" ? "Ceremony + Reception" : g.attendance === "reception" ? "Reception only" : g.attendance === "ceremony" ? "Ceremony only" : null;
  return (
    <Card>
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-rose-deep/75">Your Pass</p>
      <h2 className="mt-1 font-script text-5xl text-rose-deep">{pass.pass.memberName}</h2>
      <p className="text-xs text-ink-soft">{g.name} invite{others.length > 0 ? ` · with ${others.join(", ")}` : ""}</p>
      <FloralDivider className="mt-3" />

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        <Badge>{attending ? `Attending · ${g.confirmedPax} ${online ? "joining" : "coming"}` : declined ? "Not attending" : "RSVP pending"}</Badge>
        {online ? <Badge>Joining online</Badge> : (<>{attending && attLabel && <Badge>{attLabel}</Badge>}{g.tableNumber && <Badge>Table {g.tableNumber}</Badge>}</>)}
      </div>

      {attending && online && (
        <p className="mt-5 rounded-2xl bg-blush/40 px-4 py-3 text-sm text-ink">
          You&apos;re joining online from abroad 🌏 — no check-in needed. We&apos;ll share the livestream details with you.
        </p>
      )}

      {attending && !online && (
        <>
          <div className="mx-auto mt-5 inline-block rounded-3xl border border-dashed border-blush-2 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={pass.qrDataUrl} alt="Your group check-in QR code" className="h-52 w-52" />
          </div>
          <p className="mt-2 text-xs text-ink-soft">One pass for your group — show this QR at the entrance.</p>
        </>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <button onClick={onEdit} className="text-sm text-rose-deep underline">Change our response</button>
        <button onClick={onLogout} className="text-xs text-ink-soft underline">Not you? Log out</button>
        <Link href="/" className="text-xs text-rose-deep underline">← Back to the invitation</Link>
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-blush-2 bg-blush/60 px-3 py-1 font-semibold text-rose-deep">{children}</span>;
}
