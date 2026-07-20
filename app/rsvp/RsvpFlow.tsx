"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import * as api from "./actions";
import type { Pass } from "./actions";
import type { SearchHit } from "@/lib/guests";

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
        setError("Something went wrong. Please try again.");
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

  function reset() {
    setPass(null);
    setEditing(false);
    setSel(null);
    setHits(null);
    setQuery("");
    setPin("");
    setForgot(false);
    setError(null);
  }

  // ---- Editing / first RSVP ----
  if (pass && editing) {
    return (
      <RsvpForm
        name={pass.card.displayName}
        maxPax={pass.card.maxPax}
        pending={pending}
        error={error}
        onCancel={pass.card.rsvp.status === "pending" ? undefined : () => setEditing(false)}
        onSubmit={(status, pax) =>
          run(async () => {
            const r = await api.submitRsvp(status, pax);
            if (r.ok) { setPass(r.pass); setEditing(false); }
            else setError(r.error);
          })
        }
      />
    );
  }

  // ---- Pass ----
  if (pass) {
    return (
      <PassCard
        pass={pass}
        onEdit={() => { setError(null); setEditing(true); }}
        onLogout={() => run(async () => { await api.logout(); reset(); })}
      />
    );
  }

  // ---- Auth ----
  if (sel) {
    return (
      <Card>
        <BackButton onClick={() => { setSel(null); setError(null); setPin(""); setForgot(false); }} />
        <h2 className="font-script text-3xl text-rose-deep">{sel.displayName}</h2>
        {sel.groupName && <p className="text-xs text-ink-soft">Part of the {sel.groupName} invite</p>}

        {!sel.hasPin && (
          <Form
            label="Set a 4-digit PIN"
            help="Use your name + this PIN to view your pass anytime."
            pin={pin} setPin={setPin} pending={pending} cta="Save & continue"
            extra={
              <>
                <label className="mt-3 block text-left text-xs font-semibold text-ink-soft">Security question (to reset your PIN)</label>
                <select value={q} onChange={(e) => setQ(e.target.value)} className="mt-1 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 text-sm">
                  {QUESTIONS.map((question) => <option key={question}>{question}</option>)}
                </select>
                <input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Your answer" className="mt-2 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 text-sm" />
              </>
            }
            onSubmit={() => run(async () => onAuthed(await api.setPin(sel.id, pin, q, answer)))}
          />
        )}

        {sel.hasPin && !forgot && (
          <Form
            label="Enter your PIN" pin={pin} setPin={setPin} pending={pending} cta="Log in"
            onSubmit={() => run(async () => onAuthed(await api.login(sel.id, pin)))}
            footer={<button className="mt-3 text-xs text-rose-deep underline" onClick={() => { setForgot(true); setError(null); setPin(""); }}>Forgot PIN?</button>}
          />
        )}

        {sel.hasPin && forgot && (
          <Form
            label="Reset your PIN" help={sel.securityQuestion ?? "Answer your security question"}
            pin={pin} setPin={setPin} pinLabel="New 4-digit PIN" pending={pending} cta="Reset PIN"
            extra={<input value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer to your security question" className="mt-2 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 text-sm" />}
            onSubmit={() => run(async () => onAuthed(await api.resetPin(sel.id, answer, pin)))}
            footer={<button className="mt-3 text-xs text-ink-soft underline" onClick={() => { setForgot(false); setError(null); setPin(""); }}>Back to log in</button>}
          />
        )}

        {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
      </Card>
    );
  }

  // ---- Search ----
  return (
    <Card>
      <h2 className="font-script text-3xl text-rose-deep">Find your invite</h2>
      <p className="mt-1 text-sm text-ink-soft">Type your name (or nickname) to RSVP.</p>
      <input
        autoFocus value={query}
        onChange={(e) => { const v = e.target.value; setQuery(v); run(async () => setHits(await api.search(v))); }}
        placeholder="Your name…"
        className="mt-4 w-full rounded-xl border border-blush-2 bg-white px-4 py-3 text-center text-lg"
      />
      <div className="mt-3 space-y-2">
        {hits?.map((h) => (
          <button
            key={h.id}
            onClick={() => run(async () => { const g = await api.getGuest(h.id); if (g) setSel({ id: h.id, ...g }); })}
            className="flex w-full items-center justify-between rounded-xl bg-white/70 px-4 py-3 text-left hover:bg-white"
          >
            <span className="font-semibold text-ink">{h.displayName}</span>
            {h.groupName && <span className="text-xs text-ink-soft">{h.groupName}</span>}
          </button>
        ))}
        {hits && hits.length === 0 && query.trim().length >= 2 && !pending && (
          <p className="text-sm text-ink-soft">No match found. Please check the spelling or ask the host.</p>
        )}
      </div>
      <p className="mt-6 text-center text-xs text-ink-soft">
        <Link href="/" className="underline">← Back to the invitation</Link>
      </p>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md rounded-3xl border border-blush-2 bg-white/60 px-6 py-8 text-center shadow-[0_12px_40px_-24px_rgba(201,106,114,0.5)]">
      {children}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="mb-2 text-xs text-ink-soft underline">← Back</button>;
}

function Form({
  label, help, pin, setPin, pinLabel = "4-digit PIN", extra, footer, cta, pending, onSubmit,
}: {
  label: string; help?: string; pin: string; setPin: (v: string) => void; pinLabel?: string;
  extra?: React.ReactNode; footer?: React.ReactNode; cta: string; pending: boolean; onSubmit: () => void;
}) {
  return (
    <div className="mt-5">
      <p className="text-sm font-semibold text-ink">{label}</p>
      {help && <p className="mt-1 text-xs text-ink-soft">{help}</p>}
      <label className="mt-3 block text-left text-xs font-semibold text-ink-soft">{pinLabel}</label>
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        inputMode="numeric" placeholder="••••"
        className="mt-1 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 text-center text-2xl tracking-[0.5em]"
      />
      {extra}
      <button onClick={onSubmit} disabled={pending} className="mt-5 w-full rounded-full bg-rose px-6 py-3 font-semibold text-white disabled:opacity-60">
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
      <p className="text-xs uppercase tracking-[0.24em] text-rose-deep/80">RSVP</p>
      <h2 className="mt-1 font-script text-3xl text-rose-deep">{name}</h2>
      <p className="mt-2 text-sm text-ink-soft">You&apos;re welcome to bring up to <strong>{maxPax}</strong> {maxPax === 1 ? "guest" : "guests"} (including yourself).</p>

      <label className="mt-5 block text-left text-xs font-semibold text-ink-soft">How many are coming?</label>
      <select value={pax} onChange={(e) => setPax(Number(e.target.value))} className="mt-1 w-full rounded-xl border border-blush-2 bg-white px-3 py-2 text-sm">
        {Array.from({ length: maxPax }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
      </select>

      <div className="mt-6 flex flex-col gap-3">
        <button onClick={() => onSubmit("attending", pax)} disabled={pending} className="w-full rounded-full bg-rose px-6 py-3 font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "We'll be there 🎀"}
        </button>
        <button onClick={() => onSubmit("declined", 0)} disabled={pending} className="w-full rounded-full border border-rose px-6 py-3 font-semibold text-rose-deep disabled:opacity-60">
          Sorry, we can&apos;t make it
        </button>
        {onCancel && <button onClick={onCancel} className="text-xs text-ink-soft underline">Cancel</button>}
      </div>
      {error && <p className="mt-3 text-sm text-rose-deep">{error}</p>}
    </Card>
  );
}

function PassCard({ pass, onEdit, onLogout }: { pass: Pass; onEdit: () => void; onLogout: () => void }) {
  const { card, qrDataUrl } = pass;
  const attending = card.rsvp.status === "attending";
  const declined = card.rsvp.status === "declined";
  return (
    <Card>
      <p className="text-xs uppercase tracking-[0.24em] text-rose-deep/80">Your Pass</p>
      <h2 className="mt-1 font-script text-4xl text-rose-deep">{card.displayName}</h2>
      {card.groupName && <p className="text-xs text-ink-soft">Part of the {card.groupName} invite</p>}

      <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
        <Badge>{attending ? `Attending · ${card.rsvp.confirmedPax} coming` : declined ? "Not attending" : "RSVP pending"}</Badge>
        {card.tableNumber && <Badge>Table {card.tableNumber}</Badge>}
      </div>

      {attending && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Your check-in QR code" className="mx-auto mt-5 h-56 w-56 rounded-2xl bg-white p-2" />
          <p className="mt-2 text-xs text-ink-soft">Show this QR at the entrance for check-in.</p>
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
  return <span className="rounded-full bg-blush px-3 py-1 font-semibold text-rose-deep">{children}</span>;
}
