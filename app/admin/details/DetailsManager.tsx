"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { EventDetails, VenueKey, SiteMeta } from "@/lib/event-details";
import { saveDetails, addPhoto, removePhoto, saveSeo } from "./actions";

const input = "w-full rounded-lg border border-blush-2 bg-white px-3 py-2 text-sm outline-none focus:border-rose";
const label = "block text-[0.62rem] font-semibold uppercase tracking-wide text-ink-soft";

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || "Upload failed");
  return j.url as string;
}

export default function DetailsManager({ details, meta }: { details: EventDetails; meta: SiteMeta }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [cVenue, setCVenue] = useState(details.ceremony.venue);
  const [cAddr, setCAddr] = useState(details.ceremony.address);
  const [cTime, setCTime] = useState(details.ceremony.time);
  const [rVenue, setRVenue] = useState(details.reception.venue);
  const [rAddr, setRAddr] = useState(details.reception.address);
  const [rTime, setRTime] = useState(details.reception.time);

  const [seoTitle, setSeoTitle] = useState(meta.title);
  const [seoDesc, setSeoDesc] = useState(meta.description);
  const [ogImg, setOgImg] = useState<string | null>(meta.ogImageUrl);
  const [ogUploading, setOgUploading] = useState(false);

  const refresh = () => router.refresh();

  async function onOgFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null); setOgUploading(true);
    try { setOgImg(await uploadImage(file)); } catch (ex) { setMsg((ex as Error).message); } finally { setOgUploading(false); }
  }
  function saveSeoData() {
    setMsg(null);
    start(async () => {
      const r = await saveSeo({ title: seoTitle, description: seoDesc, ogImageUrl: ogImg });
      if (r.ok) { setMsg("Link preview saved ✓"); refresh(); } else setMsg(r.error);
    });
  }

  function save() {
    setMsg(null);
    start(async () => {
      const r = await saveDetails({
        ceremonyVenue: cVenue, ceremonyAddress: cAddr, ceremonyTime: cTime,
        receptionVenue: rVenue, receptionAddress: rAddr, receptionTime: rTime,
      });
      if (r.ok) { setMsg("Saved ✓"); refresh(); } else setMsg(r.error);
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Baptism Ceremony (Church)</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><span className={label}>Venue</span><input value={cVenue} onChange={(e) => setCVenue(e.target.value)} className={input} /></div>
          <div className="sm:col-span-2"><span className={label}>Address</span><input value={cAddr} onChange={(e) => setCAddr(e.target.value)} className={input} /></div>
          <div><span className={label}>Time</span><input value={cTime} onChange={(e) => setCTime(e.target.value)} className={input} placeholder="2:00 PM" /></div>
        </div>
        <PhotoManager venue="church" title="Church photos" photos={details.ceremony.photos} onChanged={refresh} setMsg={setMsg} />
      </section>

      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Reception</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><span className={label}>Venue</span><input value={rVenue} onChange={(e) => setRVenue(e.target.value)} className={input} /></div>
          <div className="sm:col-span-2"><span className={label}>Address</span><input value={rAddr} onChange={(e) => setRAddr(e.target.value)} className={input} /></div>
          <div><span className={label}>Time</span><input value={rTime} onChange={(e) => setRTime(e.target.value)} className={input} placeholder="4:00 PM" /></div>
        </div>
        <PhotoManager venue="reception" title="Reception photos" photos={details.reception.photos} onChanged={refresh} setMsg={setMsg} />
      </section>

      <div className="flex items-center gap-3">
        <button disabled={pending} onClick={save} className="rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">
          {pending ? "Saving…" : "Save details"}
        </button>
        {msg && <span className="text-sm text-rose-deep">{msg}</span>}
      </div>

      <section className="rounded-2xl border border-blush-2 bg-white px-5 py-5">
        <h2 className="font-display text-xl italic text-rose-deep">Link preview (when you share the site)</h2>
        <p className="mt-1 text-sm text-ink-soft">This is the title, text, and image people see when the link is shared on Messenger, Viber, iMessage, etc.</p>
        <div className="mt-3 grid gap-3">
          <div><span className={label}>Title</span><input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={input} /></div>
          <div><span className={label}>Description</span><textarea value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} rows={2} className={`${input} resize-none`} /></div>
          <div>
            <span className={label}>Share image (PNG or JPEG — landscape looks best)</span>
            <div className="mt-1 flex items-center gap-3">
              {ogImg ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ogImg} alt="" className="h-16 w-28 rounded-lg object-cover" />
              ) : (
                <div className="grid h-16 w-28 place-items-center rounded-lg bg-blush text-[0.6rem] font-semibold text-ink-soft">1200×630</div>
              )}
              <input type="file" accept="image/png,image/jpeg" onChange={onOgFile} className="text-sm" />
              {ogUploading && <span className="text-xs text-ink-soft">uploading…</span>}
              {ogImg && <button type="button" onClick={() => setOgImg(null)} className="text-xs text-rose-deep underline">remove</button>}
            </div>
          </div>
        </div>
        <button disabled={pending || ogUploading} onClick={saveSeoData} className="mt-3 rounded-lg bg-rose px-5 py-2 text-sm font-semibold text-white disabled:opacity-60">Save link preview</button>
      </section>
    </div>
  );
}

function PhotoManager({
  venue, title, photos, onChanged, setMsg,
}: {
  venue: VenueKey; title: string; photos: string[]; onChanged: () => void; setMsg: (s: string | null) => void;
}) {
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMsg(null);
    setUploading(true);
    try {
      const url = await uploadImage(file);
      start(async () => {
        const r = await addPhoto(venue, url);
        if (r.ok) onChanged(); else setMsg(r.error);
      });
    } catch (ex) {
      setMsg((ex as Error).message);
    } finally {
      setUploading(false);
    }
  }
  function remove(url: string) {
    setMsg(null);
    start(async () => { const r = await removePhoto(venue, url); if (r.ok) onChanged(); else setMsg(r.error); });
  }

  return (
    <div className="mt-4">
      <span className={label}>{title} — up to 4 (PNG or JPEG)</span>
      <div className="mt-2 flex flex-wrap gap-3">
        {photos.map((url) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <button onClick={() => remove(url)} disabled={pending}
              className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-blush-2 bg-white text-xs font-bold text-rose-deep shadow">×</button>
          </div>
        ))}
        {photos.length < 4 && (
          <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-blush-2 bg-blush/30 text-center text-[0.6rem] font-semibold text-ink-soft">
            {uploading ? "…" : "+ Add"}
            <input type="file" accept="image/png,image/jpeg" onChange={onFile} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}
