"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap } from "leaflet";
import { PLACES, type Place } from "./places";
import wmRoute from "./data/wm-route.json";
import parishRoute from "./data/parish-route.json";

const PIN: Record<Place["kind"], { bg: string; ring: string }> = {
  start: { bg: "#f7dd86", ring: "#d9ad24" },
  destination: { bg: "#8fd08a", ring: "#4f9b52" },
  landmark: { bg: "#f6bd7c", ring: "#e18a2e" },
  ceremony: { bg: "#f3b6bb", ring: "#c96a72" },
};

type Line = [number, number][];

export default function MapView() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !ref.current || mapRef.current) return;

      const routes: { line: Line; color: string }[] = [
        { line: parishRoute as Line, color: "#9db89a" }, // ceremony -> reception (sage)
        { line: wmRoute as Line, color: "#d1466f" }, // WalterMart -> reception (rose)
      ];

      const map = L.map(ref.current, { scrollWheelZoom: false, zoomControl: true });
      mapRef.current = map;

      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        { maxZoom: 19, attribution: "Tiles &copy; Esri" }
      );
      const streets = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      });
      satellite.addTo(map);
      L.control.layers({ Satellite: satellite, Streets: streets }, undefined, {
        position: "topright",
      }).addTo(map);

      const allPoints: Line = [];
      for (const r of routes) {
        L.polyline(r.line, { color: "#ffffff", weight: 8, opacity: 0.65 }).addTo(map);
        L.polyline(r.line, { color: r.color, weight: 5, opacity: 0.95 }).addTo(map);
        allPoints.push(...r.line);
      }

      for (const p of PLACES) {
        const c = PIN[p.kind];
        const big = p.kind === "destination" || p.kind === "ceremony";
        const size = big ? 22 : 16;
        const icon = L.divIcon({
          className: "amari-pin",
          html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${c.bg};border:3px solid ${c.ring};box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });
        L.marker(p.pos, { icon, title: p.name })
          .addTo(map)
          .bindPopup(
            `<strong>${p.name}</strong>${p.sub ? `<br/><span style="color:#8a7478">${p.sub}</span>` : ""}`
          );
        allPoints.push(p.pos);
      }

      map.fitBounds(L.latLngBounds(allPoints), { padding: [36, 36] });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div>
      <div
        ref={ref}
        role="application"
        aria-label="Interactive map: St. Benedict Parish and WalterMart routes to Okairi"
        className="h-[380px] w-full overflow-hidden rounded-3xl border border-blush-2 shadow-[0_12px_40px_-24px_rgba(201,106,114,0.5)]"
      />
      <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-ink-soft">
        <span><span className="mr-1 inline-block h-2 w-4 rounded-full align-middle" style={{ background: "#9db89a" }} />Parish → Okairi</span>
        <span><span className="mr-1 inline-block h-2 w-4 rounded-full align-middle" style={{ background: "#d1466f" }} />WalterMart → Okairi</span>
      </div>
    </div>
  );
}
