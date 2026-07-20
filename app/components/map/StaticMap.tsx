import wm from "./data/wm-route.json";
import parish from "./data/parish-route.json";
import { PLACES } from "./places";

type LL = [number, number];

const W = 720;
const H = 540;
const PAD = 56;

const routes = [
  { pts: parish as LL[], color: "var(--sage-deep)", width: 4 },
  { pts: wm as LL[], color: "var(--rose)", width: 4 },
];

const allPts: LL[] = [...routes.flatMap((r) => r.pts), ...PLACES.map((p) => p.pos)];
const lats = allPts.map((p) => p[0]);
const lngs = allPts.map((p) => p[1]);
const minLat = Math.min(...lats);
const maxLat = Math.max(...lats);
const minLng = Math.min(...lngs);
const maxLng = Math.max(...lngs);
const cos = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));

const spanLng = (maxLng - minLng) * cos || 1e-6;
const spanLat = maxLat - minLat || 1e-6;
const scale = Math.min((W - 2 * PAD) / spanLng, (H - 2 * PAD) / spanLat);
const offX = (W - spanLng * scale) / 2;
const offY = (H - spanLat * scale) / 2;

function proj([lat, lng]: LL): [number, number] {
  return [offX + (lng - minLng) * cos * scale, offY + (maxLat - lat) * scale];
}
function toPath(pts: LL[]): string {
  return pts
    .map((p, i) => {
      const [x, y] = proj(p);
      return `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
}

const LABEL: Record<string, string> = {
  ceremony: "var(--rose-deep)",
  destination: "var(--rose-deep)",
  start: "var(--ink-soft)",
  landmark: "var(--sage-deep)",
};

export default function StaticMap() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img"
      aria-label="Map of St. Benedict Parish and WalterMart routes to Okairi">
      <defs>
        <linearGradient id="mapsky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fdf0f2" />
          <stop offset="1" stopColor="#eef3ec" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="26" fill="url(#mapsky)" />

      {/* soft decorative blobs */}
      <circle cx="90" cy="120" r="70" fill="#a9bfa6" opacity="0.10" />
      <circle cx="620" cy="430" r="90" fill="#cf8a97" opacity="0.08" />

      {/* routes: white halo under a soft colored line */}
      {routes.map((r, i) => (
        <path key={`h${i}`} d={toPath(r.pts)} fill="none" stroke="#ffffff" strokeWidth={r.width + 5}
          strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      ))}
      {routes.map((r, i) => (
        <path key={`r${i}`} d={toPath(r.pts)} fill="none" stroke={r.color} strokeWidth={r.width}
          strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 9" opacity="0.95" />
      ))}

      {/* markers + labels */}
      {PLACES.map((p) => {
        const [x, y] = proj(p.pos);
        const big = p.kind === "ceremony" || p.kind === "destination";
        const anchorLeft = x > W * 0.62;
        return (
          <g key={p.key}>
            <circle cx={x} cy={y} r={big ? 8 : 5.5} fill="#fff" stroke={LABEL[p.kind]} strokeWidth="3" />
            {p.kind === "destination" && (
              <path d={`M${x} ${y + 2}c-3-3-8-2-8 2 0 3 5 5 8 8 3-3 8-5 8-8 0-4-5-5-8-2Z`} fill="var(--rose)" />
            )}
            <text
              x={anchorLeft ? x - 12 : x + 12}
              y={y + 4}
              textAnchor={anchorLeft ? "end" : "start"}
              fontSize="18"
              fontWeight="600"
              fill={LABEL[p.kind]}
              stroke="#fff"
              strokeWidth="3.4"
              paintOrder="stroke"
              style={{ fontFamily: "var(--font-body), sans-serif" }}
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
