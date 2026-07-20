import Section from "./Section";
import content from "../content";

export default function Godparents() {
  const { list, callTime, dressCode, note } = content.godparents;
  const ninong = list.filter((g) => g.role === "Ninong");
  const ninang = list.filter((g) => g.role === "Ninang");
  return (
    <Section id="godparents" eyebrow="With Gratitude" title="Ninong & Ninang">
      {list.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 text-sm">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-rose-deep">
              Ninong
            </p>
            <ul className="mt-2 space-y-1 text-ink">
              {ninong.map((g) => (
                <li key={g.name}>{g.name}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-rose-deep">
              Ninang
            </p>
            <ul className="mt-2 space-y-1 text-ink">
              {ninang.map((g) => (
                <li key={g.name}>{g.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="mt-6 space-y-2 rounded-2xl bg-white/60 px-5 py-5 text-sm text-ink-soft">
        <p>{callTime}</p>
        <p>{dressCode}</p>
        <p>{note}</p>
      </div>
    </Section>
  );
}
