// Real coordinates [lat, lng]. Verified from Google Maps pins / Nominatim.
// St. Benedict is pending an exact pin from the host (private village = weak map data).
export type LatLng = [number, number];
export type Place = {
  key: string;
  name: string;
  sub?: string;
  pos: LatLng;
  kind: "start" | "destination" | "landmark" | "ceremony";
};

export const OKAIRI: LatLng = [14.292292, 121.109198];
export const WALTERMART: LatLng = [14.288192, 121.094504];
export const ST_BENEDICT: LatLng = [14.2395967, 121.0408546];

export const PLACES: Place[] = [
  { key: "parish", name: "St. Benedict Parish", sub: "Ceremony · 2:00 PM", pos: ST_BENEDICT, kind: "ceremony" },
  { key: "wm", name: "WalterMart Santa Rosa", sub: "Starting point", pos: WALTERMART, kind: "start" },
  { key: "mcdo", name: "Shell + McDonald's", sub: "Amethyst Rd traffic light", pos: [14.293639, 121.104947], kind: "landmark" },
  { key: "okairi", name: "Okairi", sub: "Reception · B2 L10 Ph 1, La Joya Subd.", pos: OKAIRI, kind: "destination" },
];
