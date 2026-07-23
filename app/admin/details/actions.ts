"use server";

import { requireAdmin } from "@/lib/admin";
import {
  updateEventDetails,
  addVenuePhoto,
  removeVenuePhoto,
  updateSiteMeta,
  type EventDetailsInput,
  type VenueKey,
  type SiteMeta,
} from "@/lib/event-details";

type Res = { ok: true } | { ok: false; error: string };

export async function saveSeo(m: SiteMeta): Promise<Res> {
  await requireAdmin();
  try {
    await updateSiteMeta(m);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function saveDetails(f: EventDetailsInput): Promise<Res> {
  await requireAdmin();
  try {
    await updateEventDetails(f);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function addPhoto(venue: VenueKey, url: string): Promise<Res> {
  await requireAdmin();
  try {
    await addVenuePhoto(venue, url);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function removePhoto(venue: VenueKey, url: string): Promise<Res> {
  await requireAdmin();
  try {
    await removeVenuePhoto(venue, url);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
