"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import * as api from "./actions";
import type { Pass } from "./actions";
import type { SearchHit } from "@/lib/guests";
import Confetti from "../components/Confetti";

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
  maxPax: number;
  hasPin: boolean;
  securityQuestion: string | null;
};

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
      try {
        await fn();
      } catch {
        setError("Oops, something went wrong. Please try again.");
      }
    });
  }

  function onAuthed(r: Awaited<ReturnType<typeof api.login>>) {
    if (!r.ok) return setError(r.error);
    setSel(null);
    setPin("");
    setAnswer("");
    setForgot(false);
    setPass(r.pass);
    setEditing(r.pass.card.rsvp.status === "pending");
  }

  function fullReset() {
    setPass(null);
    setEditing(false);
    setSel(null);
    setHits(null);
    setQuery("");
    setPin("");
    setForgot(false);
    setError(null);
  }

  return (
    <>
      <Confetti key={burst} fire={burst > 0} />

      {pass && editing ? (
        <RsvpForm
          name={pass.card.displayName}
          maxPax={pass.card.maxPax}
          pending={pending}
          error={error}
          onCancel={pass.card.rsvp.status === "pending" ? undefined : () => setEditing(false)}
          onSubmit={(status, pax) =>
            run(async () => {
              const r = await api.submitRsvp(status, pax);
              if (r.ok) {
                setPass(r.pass);
                setEditing(false);
                if (r.pass.card.rsvp.status === "attending") setBurst((b) => b + 1);
              } else setError(r.error);
            })
          }
        />
      ) : pass ? (
        <PassCard
          pass={pass}
          onEdit={() => { setError(null); setEditing(true); }}
          onLogout={() => run(async () => { await api.logout(); fullReset(); })}
        />
      ) : sel ? (
        <Card>
          <BackButton onClick={() => { setSel(null); setError(null); setPin(""); setForgot(false); }} />
          <h2 className="font-script text-4xl text-rose-deep">{sel.displayName}</h2>
          {sel.groupName && <p className="text-xs font-semibold text-ink-soft">Part of the {sel.groupName} invite 💕</p>}

          {!sel.hasPin && (
            <Form
              label="Set a secret 4-digit PIN" help="Use your name + this PIN to peek at your pass anytime."
              pin={pin} setPin={setPin} pending={pending} cta="Save & continue"
              extra={
                <>
                  <label className="mt-3 block text-left text-xs font-extrabold uppercase tracking-wide text-ink-soft">Security question</label>
                  <select value={q} onChange={(e) => setQ(e.target.value)} className={field}>
                    {QUESTIONS.map((question) => <option key={question}>{question}</option>)}
                  </select>
                  <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" className={`${field} mt-2`} />
                </>
              }
              onSubmit={() => run(async () => onAuthed(await api.setPin(sel.id, pin, q, answer)))}
            />
          )}

          {sel.hasPin && !forgot && (
            <Form
              label="Enter your PIN" pin={pin} setPin={setPin} pending={pending} cta="Log in 🎀"
              onSubmit={() => run(async () => onAuthed(await api.login(sel.id, pin)))}
              footer={<button className="mt-3 text-xs font-bold text-rose-deep underline" onClick={() => { setForgot(true); setError(null); setPin(""); }}>Forgot PIN?</button>}
            />
          )}

          {sel.hasPin && forgot && (
            <Form
              label="Reset your PIN" help={sel.securityQuestion ?? "Answer your security question"}
              pin={pin} setPin={setPin} pinLabel="New 4-digit PIN" pending={pending} cta="Reset PIN"
              extra={<input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer to your security question" className={`${field} mt-2`} />}
              onSubmit={() => run(async () => onAuthed(await api.resetPin(sel.id, answer, pin)))}
              footer={<button className="mt-3 text-xs font-bold text-ink-soft underline" onClick={() => { setForgot(false); setError(null); setPin(""); }}>Back to log in</button>}
            />
          )}

          {error && <p className="mt-3 text-sm font-bold text-rose-deep">{error}</p>}
        </Card>
      ) : (
        <Card>
          <div className="text-4xl">🔎</div>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-rose-deep">Find your invite</h2>
          <p className="mt-1 text-sm font-semibold text-ink-soft">Type your name (or nickname) to RSVP.</p>
          <input
            autoFocus value={query}
            onChange={(e) => { const v = e.target.value; setQuery(v); run(async () => setHits(await api.search(v))); }}
            placeholder="Your name…"
            className="mt-4 w-full rounded-2xl border-4 border-blush-2 bg-white px-4 py-3 text-center text-lg font-bold outline-none"
          />
          <div className="mt-3 space-y-2">
            {hits?.map((h) => (
              <button
                key={h.id}
                onClick={() => run(async () => { const g = await api.getGuest(h.id); if (g) setSel({ id: h.id, ...g }); })}
                className="hover-boop flex w-full items-center justify-between rounded-2xl border-4 border-white bg-white/85 px-4 py-3 text-left shadow-sm"
              >
                <span className="font-extrabold text-ink">{h.displayName}</span>
                {h.groupName && <span className="text-xs font-semibold text-ink-soft">{h.groupName}</span>}
              </button>
            ))}
            {hits && hits.length === 0 && query.trim().length >= 2 && !pending && (
              <p className="text-sm font-semibold text-ink-soft">No match found — check the spelling or ask the host. 💌</p>
            )}
          </div>
          <p className="mt-6 text-center text-xs font-bold text-ink-soft">
            <Link href="/" className="underline">← Back to the invitation</Link>
          </p>
        </Card>
      )}
    </>
  );
}

const field = "mt-1 w-full rounded-2xl border-4 border-blush-2 bg-white px-3 py-2 text-sm font-semibold outline-none";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="anim-rise mx-auto max-w-md rounded-[28px] border-4 border-white bg-white/75 px-6 py-8 text-center shadow-[0_20px_48px_-22px_rgba(225,95,129,0.6)]">
      {children}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="mb-2 text-xs font-bold text-ink-soft underline">← Back</button>;
}

function Form({
  label, help, pin, setPin, pinLabel = "4-digit PIN", extra, footer, cta, pending, onSubmit,
}: {
  label: string; help?: string; pin: string; setPin: (v: string) => void; pinLabel?: string;
  extra?: React.ReactNode; footer?: React.ReactNode; cta: string; pending: boolean; onSubmit: () => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-extrabold text-ink">{label}</p>
      {help && <p className="mt-1 text-xs font-semibold text-ink-soft">{help}</p>}
      <label className="mt-3 block text-left text-xs font-extrabold uppercase tracking-wide text-ink-soft">{pinLabel}</label>
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        inputMode="numeric" placeholder="••••"
        className="mt-1 w-full rounded-2xl border-4 border-blush-2 bg-white px-3 py-2 text-center text-2xl tracking-[0.5em] outline-none"
      />
      {extra}
      <button onClick={onSubmit} disabled={pending} className="hover-boop mt-5 w-full rounded-full bg-rose px-6 py-3 font-extrabold text-white shadow-[0_12px_28px_-12px_rgba(225,95,129,0.9)] disabled:opacity-60">
        {pending ? "Please wait…" : cta}
      </button>
      {footer}
    </div>
  );
}

function RsvpForm({
  name, maxPax, pending, error, onSubmit, onCancel,
}: {
  name: string; maxPax: number; pending: boolean; error: string | null;
  onSubmit: (status: "attending" | "declined", pax: number) => void; onCancel?: () => void;
}) {
  const [pax, setPax] = useState(maxPax);
  return (
    <Card>
      <div className="text-4xl">💌</div>
      <h2 className="mt-1 font-script text-4xl text-rose-deep">{name}</h2>
      <p className="mt-2 text-sm font-semibold text-ink-soft">You&apos;re welcome to bring up to <strong className="text-rose-deep">{maxPax}</strong> {maxPax === 1 ? "guest" : "guests"} (including yourself).</p>

      <label className="mt-5 block text-left text-xs font-extrabold uppercase tracking-wide text-ink-soft">How many are coming?</label>
      <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className={field}>
        {Array.from({ length: maxPax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => onSubmit("attending", pax)} disabled={pending} className="hover-boop w-full rounded-full bg-rose px-6 py-3.5 text-lg font-extrabold text-white shadow-[0_14px_30px_-12px_rgba(225,95,129,0.95)] disabled:opacity-60">
          {pending ? "Saving…" : "We'll be there! 🎉"}
        </button>
        <button onClick={() => onSubmit("declined", 0)} disabled={pending} className="w-full rounded-full border-2 border-rose bg-white px-6 py-3 font-extrabold text-rose-deep disabled:opacity-60">
          Sorry, we can&apos;t make it
        </button>
        {onCancel && <button onClick={onCancel} className="text-xs font-bold text-ink-soft underline">Cancel</button>}
      </div>
      {error && <p className="mt-3 text-sm font-bold text-rose-deep">{error}</p>}
    </Card>
  );
}

function PassCard({ pass, onEdit, onLogout }: { pass: Pass; onEdit: () => void; onLogout: () => void }) {
  const { card, qrDataUrl } = pass;
  const attending = card.rsvp.status === "attending";
  const declined = card.rsvp.status === "declined";
  return (
    <Card>
      <div className="text-4xl">{attending ? "🎟️" : declined ? "💗" : "💌"}</div>
      <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.2em] text-rose-deep/80">Your Pass</p>
      <h2 className="mt-1 font-script text-5xl text-rose-deep">{card.displayName}</h2>
      {card.groupName && <p className="text-xs font-semibold text-ink-soft">Part of the {card.groupName} invite 💕</p>}

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        <Badge>{attending ? `Attending · ${card.rsvp.confirmedPax} coming` : declined ? "Not attending" : "RSVP pending"}</Badge>
        {card.tableNumber && <Badge>Table {card.tableNumber}</Badge>}
      </div>

      {attending && (
        <>
          <div className="mx-auto mt-5 inline-block rounded-3xl border-4 border-dashed border-blush-2 bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="Your check-in QR code" className="h-52 w-52" />
          </div>
          <p className="mt-2 text-xs font-semibold text-ink-soft">Show this QR at the entrance for check-in. 🎀</p>
        </>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <button onClick={onEdit} className="text-sm font-bold text-rose-deep underline">Change my response</button>
        <button onClick={onLogout} className="text-xs font-bold text-ink-soft underline">Not you? Log out</button>
        <Link href="/" className="text-xs font-bold text-rose-deep underline">← Back to the invitation</Link>
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-blush px-3 py-1 font-extrabold text-rose-deep">{children}</span>;
}
