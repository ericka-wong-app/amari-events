export default function PhotoStrip({ photos, alt }: { photos: string[]; alt: string }) {
  if (photos.length === 0) return null;
  return (
    <div className={`mt-3 grid gap-2 ${photos.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={src}
          alt={`${alt} photo ${i + 1}`}
          className={`w-full rounded-2xl border border-blush-2 object-cover shadow-[0_10px_28px_-20px_rgba(183,110,125,0.7)] ${
            photos.length === 1 ? "h-44" : "h-28"
          }`}
        />
      ))}
    </div>
  );
}
