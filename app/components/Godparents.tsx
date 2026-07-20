import Section from "./Section";
import content from "../content";

export default function Godparents() {
  const { list, callTime, dressCode, note } = content.godparents;
  const ninong = list.filter((g) => g.role === "Ninong");
  const ninang = list.filter((g) => g.role === "Ninang");
  return (
    <Section id="godparents" eyebrow="With Gratitude" title="Ninong & Ninang">
      {list.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-blush-2 bg-white/60 px-5 py-6">
            <p className="font-display text-xl italic text-rose-deep">Ninong</p>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {ninong.map((g) => <li key={g.name}>{g.name}</li>)}
            </ul>
          </div>
          <div className="rounded-3xl border border-blush-2 bg-white/60 px-5 py-6">
            <p className="font-display text-xl italic text-rose-deep">Ninang</p>
            <ul className="mt-2 space-y-1 text-sm text-ink">
              {ninang.map((g) => <li key={g.name}>{g.name}</li>)}
            </ul>
          </div>
        </div>
      )}
      <div className="mt-6 space-y-2 rounded-3xl border border-blush-2 bg-white/50 px-6 py-6 text-sm leading-relaxed text-ink-soft">
        <p>{callTime}</p>
        <p>{dressCode}</p>
        <p>{note}</p>
      </div>
    </Section>
  );
}
