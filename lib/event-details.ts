import { supabaseAdmin } from "./supabase";
import content from "@/app/content";

export type VenueKey = "church" | "reception";
export type VenueDetail = { title: string; venue: string; address: string; time: string; photos: string[] };
export type EventDetails = { ceremony: VenueDetail; reception: VenueDetail };

const DEFAULTS: EventDetails = {
  ceremony: { ...content.ceremony, photos: [] },
  reception: { ...content.reception, photos: [] },
};

const PHOTO_COL: Record<VenueKey, "church_photos" | "reception_photos"> = {
  church: "church_photos",
  reception: "reception_photos",
};

type DetailsRow = {
  ceremony_venue: string | null;
  ceremony_address: string | null;
  ceremony_time: string | null;
  reception_venue: string | null;
  reception_address: string | null;
  reception_time: string | null;
  church_photos: string[] | null;
  reception_photos: string[] | null;
};

export async function getEventDetails(): Promise<EventDetails> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("event_details")
      .select(
        "ceremony_venue, ceremony_address, ceremony_time, reception_venue, reception_address, reception_time, church_photos, reception_photos"
      )
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return DEFAULTS;
    const r = data as DetailsRow;
    return {
      ceremony: {
        title: DEFAULTS.ceremony.title,
        venue: r.ceremony_venue ?? DEFAULTS.ceremony.venue,
        address: r.ceremony_address ?? DEFAULTS.ceremony.address,
        time: r.ceremony_time ?? DEFAULTS.ceremony.time,
        photos: (r.church_photos ?? []).slice(0, 4),
      },
      reception: {
        title: DEFAULTS.reception.title,
        venue: r.reception_venue ?? DEFAULTS.reception.venue,
        address: r.reception_address ?? DEFAULTS.reception.address,
        time: r.reception_time ?? DEFAULTS.reception.time,
        photos: (r.reception_photos ?? []).slice(0, 4),
      },
    };
  } catch {
    return DEFAULTS;
  }
}

export type EventDetailsInput = {
  ceremonyVenue: string;
  ceremonyAddress: string;
  ceremonyTime: string;
  receptionVenue: string;
  receptionAddress: string;
  receptionTime: string;
};

export async function updateEventDetails(f: EventDetailsInput): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("event_details").upsert(
    {
      id: 1,
      ceremony_venue: f.ceremonyVenue.trim(),
      ceremony_address: f.ceremonyAddress.trim(),
      ceremony_time: f.ceremonyTime.trim(),
      reception_venue: f.receptionVenue.trim(),
      reception_address: f.receptionAddress.trim(),
      reception_time: f.receptionTime.trim(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
}

async function currentPhotos(venue: VenueKey): Promise<string[]> {
  const sb = supabaseAdmin();
  const col = PHOTO_COL[venue];
  const { data } = await sb.from("event_details").select(col).eq("id", 1).maybeSingle();
  const arr = (data as Record<string, string[] | null> | null)?.[col];
  return arr ?? [];
}

export async function addVenuePhoto(venue: VenueKey, url: string): Promise<void> {
  const cur = await currentPhotos(venue);
  if (cur.length >= 4) throw new Error("Up to 4 photos only. Remove one first.");
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("event_details")
    .upsert({ id: 1, [PHOTO_COL[venue]]: [...cur, url], updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw new Error(error.message);
}

export async function removeVenuePhoto(venue: VenueKey, url: string): Promise<void> {
  const cur = await currentPhotos(venue);
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("event_details")
    .upsert(
      { id: 1, [PHOTO_COL[venue]]: cur.filter((u) => u !== url), updated_at: new Date().toISOString() },
      { onConflict: "id" }
    );
  if (error) throw new Error(error.message);
}

// --- Link preview / SEO (title, description, share image) ---
export type SiteMeta = { title: string; description: string; ogImageUrl: string | null };

const META_DEFAULT: SiteMeta = {
  title: `${content.celebrant}'s Baptism · ${content.dateLong}`,
  description: content.intro,
  ogImageUrl: null,
};

export async function getSiteMeta(): Promise<SiteMeta> {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb
      .from("event_details")
      .select("seo_title, seo_description, og_image_url")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return META_DEFAULT;
    const r = data as { seo_title: string | null; seo_description: string | null; og_image_url: string | null };
    return {
      title: r.seo_title?.trim() || META_DEFAULT.title,
      description: r.seo_description?.trim() || META_DEFAULT.description,
      ogImageUrl: r.og_image_url ?? null,
    };
  } catch {
    return META_DEFAULT;
  }
}

export async function updateSiteMeta(m: SiteMeta): Promise<void> {
  const sb = supabaseAdmin();
  const { error } = await sb.from("event_details").upsert(
    {
      id: 1,
      seo_title: m.title.trim() || null,
      seo_description: m.description.trim() || null,
      og_image_url: m.ogImageUrl?.trim() || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) throw new Error(error.message);
}
