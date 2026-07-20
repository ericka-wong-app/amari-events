import Section from "./Section";
import content from "../content";

export default function Godparents() {
  const { list, callTime, dressCode, note } = content.godparents;
  const ninong = list.filter((g) => g.role === "Ninong");
  const ninang = list.filter((g) => g.role === "Ninang");
  return (
    <Section id="godparents" eyebrow="With Gratitude" title="Ninong & Ninang" sticker="🤍">
      {list.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="tilt-l rounded-3xl border-4 border-white bg-sky/40 px-5 py-5 shadow-[0_14px_36px_-20px_rgba(225,95,129,0.5)]">
            <p className="font-display text-lg font-extrabold text-rose-deep">👨 Ninong</p>
            <ul className="mt-2 space-y-1 text-sm font-semibold text-ink">
              {ninong.map((g) => <li key={g.name}>{g.name}</li>)}
            </ul>
          </div>
          <div className="tilt-r rounded-3xl border-4 border-white bg-blush px-5 py-5 shadow-[0_14px_36px_-20px_rgba(225,95,129,0.5)]">
            <p className="font-display text-lg font-extrabold text-rose-deep">👩 Ninang</p>
            <ul className="mt-2 space-y-1 text-sm font-semibold text-ink">
              {ninang.map((g) => <li key={g.name}>{g.name}</li>)}
            </ul>
          </div>
        </div>
      )}
      <div className="mt-6 space-y-2 rounded-3xl border-4 border-dashed border-blush-2 bg-white/70 px-5 py-5 text-sm font-semibold text-ink-soft">
        <p>⏰ {callTime}</p>
        <p>👗 {dressCode}</p>
        <p>💒 {note}</p>
      </div>
    </Section>
  );
}
