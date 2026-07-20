# Amari's Baptism — Invitation Web App · Design Spec

**Date:** 2026-07-20
**Owner:** Ericka (info@millionaireessentials.com)
**Event:** Baptism of **Amari Wong** · **Sunday, July 26, 2026**

---

## 1. Goal

A one-of-a-kind **invitation website** with a built-in **RSVP + guest login (no email/SMS)**,
**QR passes with table numbers**, an **interactive landmark map** that solves the "far U-turn"
problem, and a **private admin + check-in** area for the host. After launch it runs entirely on
the host's own GitHub + Vercel + Supabase accounts — **no dependency on Claude**.

## 2. Event details

| | |
|---|---|
| Celebrant | Amari Wong |
| Date | Sunday, July 26, 2026 |
| Ceremony | **St. Benedict Parish**, Ayala Westgrove, Santa Rosa, Laguna — **2:00 PM** |
| Reception | **Okairi Stays**, B2 L10 Phase 1, La Joya Subd., Brgy. Dila, Santa Rosa, Laguna — **4:00 PM** |

## 3. Aesthetic

Match the provided peg: soft **pink gingham**, hand-drawn **bows & ribbons**, delicate **florals**
with **sage-green** leaves, a flowing **script** for "Amari," on a warm **cream** ground.

- **Palette:** blush `#f7dde1`, rose `#d17b83`, deep rose `#c96a72`, sage `#9db89a`,
  cream `#fdf6f2`, warm plum-grey ink `#5b4a4d`, soft yellow accent `#f7dd86`.
- **Type:** an elegant script display face for the name + a clean humanist sans for body,
  self-hosted via `next/font` (no CDN dependency).
- Committed light/romantic single-theme world (an invitation, not a dashboard).
- Respect `prefers-reduced-motion` on all animation.

## 4. Public site — guest experience

A single scrolling page, with the RSVP / pass gated behind a lightweight guest login.

1. **Animated intro reveal** — a ribbon/bow unties and "Amari" flows in (skippable; reduced-motion safe).
2. **Hero** — *Celebrating the Baptism of Amari Wong · Sunday, July 26, 2026.*
3. **Ceremony** — St. Benedict Parish · 2:00 PM.
4. **Reception** — Okairi · 4:00 PM.
5. **Ninong & Ninang (Godparents)** — **named list** of godparents + shared **church call time**
   and **dress code** instructions. (Names/details supplied by host.)
6. **Interactive Directions** — the centerpiece (§5).
7. **RSVP** — name search → PIN → attending + headcount → QR pass + table (§6, §7).
8. **Your Pass** — return login to view QR, headcount, table.
9. **Gift note** — a gentle message about gifts; **monetary gifts are warmly welcome**.
10. **Gift Registry** — **curated item list + registry/cash links** (Shopee/Lazada/Amazon, plus
    **monetary gift** options: GCash/bank).

## 5. Interactive map (no Google redirect)

**Why custom:** Google picks its own route and drops the pin on the wrong side, forcing a far
U-turn; the subdivision is also flagged "restricted/private roads." We bake in the **host-known
correct route** instead.

- **Leaflet** map with **free tiles** — OSM streets + **Esri World Imagery** satellite toggle.
  Full pan/zoom, embedded in the page, no redirect.
- **Hand-drawn correct route polylines** for two origins: **WalterMart Santa Rosa** and
  **St. Benedict Parish** → **Okairi** (correct gate pin).
- **Landmark markers with photos + labels**, in order:
  Mima The Baker's Partner → Balibago Market → **Shell + McDonald's @ Amethyst Rd light** →
  J&T Express / Bahay ni Pogi → **LA JOYA / Kasa Joya gate (Alfamart on the corner)** →
  **Blue Palm Street** → **Okairi**.
- **"Avoid" cue:** the straight AH26 center segment is marked do-not-enter with a clear
  "keep right, follow the curve" instruction where the U-turn trap is.
- **Landmark-based turn-by-turn** step list beside the map.
- **Final leg inside the subdivision** uses **host-provided photos** (gate → Blue Palm St →
  Okairi's frontage), because Google Street View stops at the gate.
- **Optional** "Open live GPS" buttons (Waze/Google) **pre-aimed at the correct gate pin** as a
  fallback only; the in-site map is primary.

## 6. RSVP logic

- Host allots **max pax** per guest in admin.
- Guest chooses **Attending** or **Not attending**.
- If attending, guest confirms **headcount (1…max pax)**.
- The **QR pass encodes** guest id + confirmed headcount + table (as a signed token).
- Guest can see their pax, QR, and table on **Your Pass**.

## 7. Auth model (no email, no SMS)

- **Guest:** search **name** (matches display name + **nicknames/alt spellings**,
  case-insensitive). First visit → set a **4-digit PIN** + pick a **security question & answer**.
  Return → name + PIN. Forgot PIN → answer security question → reset.
- **Admin:** **username + password**, with the same security-question reset.
- **Storage:** PINs, admin password, and security answers are **hashed** (bcrypt/argon2).
  Sessions are signed cookies. No third-party auth provider needed.

## 8. Admin (private, password-protected)

- **Guest management:** add / edit / **delete**; fields = display name, **nicknames/alt names**,
  **max pax**, **table number**, godparent role (ninong/ninang/none), notes.
  (Host adds guests in-app; optional CSV paste-import as a nice-to-have.)
- **Live RSVP dashboard:** counts of invited / attending / declined / pending, **total confirmed
  headcount**, and a searchable guest list with status.
- **Check-in (event day):** phone-camera **QR scanner** *or* **manual name search**; marks arrived,
  shows table, supports undo. Usable by host or a door helper.

## 9. Data model (Supabase Postgres)

- `guests` — id, display_name, alt_names[], max_pax, table_number, godparent_role, notes, created_at
- `guest_auth` — guest_id, pin_hash, security_question, security_answer_hash
- `rsvps` — guest_id, status(attending|declined|pending), confirmed_pax, responded_at
- `checkins` — guest_id, checked_in_at, checked_in_by, method(scan|manual)
- `admins` — id, username, password_hash, security_question, security_answer_hash

**Access:** all DB access flows through **Next.js server** (route handlers / server actions) using
the Supabase **service-role key server-side only** — never exposed to the browser. QR tokens are
**HMAC-signed** so they can't be forged; the scanner validates against the DB.

## 10. Tech stack

- **Next.js 16.2.10** (App Router) + **React 19** + **Tailwind 4** + **TypeScript** (already scaffolded).
  ⚠️ Per `AGENTS.md`, this Next.js has breaking changes — **read `node_modules/next/dist/docs/`
  before writing any Next.js code.**
- **Supabase** (Postgres, hashed secrets).
- **Leaflet** + OSM/Esri tiles (map). **qrcode** (generate) + camera QR scanner (check-in).
- **Deploy:** GitHub repo → **Vercel** (auto-deploy on push) + **Supabase** project.
- **Env vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`,
  `QR_SIGNING_SECRET`, admin bootstrap creds.

## 11. Build order (phased — a live URL early)

1. **Phase 1 — Static invitation** (deployable immediately): aesthetic system, all content
   sections, intro reveal. → first live Vercel URL.
2. **Phase 2 — Interactive map:** Leaflet, route polylines, landmarks, avoid-cue, turn list.
3. **Phase 3 — RSVP + guest auth + Your Pass + QR:** Supabase, name search, PIN, headcount, QR.
4. **Phase 4 — Admin + check-in:** guest CRUD, RSVP dashboard, QR scanner + manual check-in.

## 12. Assets the host provides

- Guest list (names, nicknames, pax, table) — entered in admin
- Godparent names + roles; church **call time** + **dress code**
- **Inside-subdivision photos** (gate → Blue Palm St → Okairi) + any landmark photos
- Gift registry **links** + **item list**; the gift-note text
- Confirm ceremony 2:00 PM / reception 4:00 PM
- Chosen admin **username + password**
- GitHub repo URL + Vercel + Supabase accounts (one-time setup)

## 13. Out of scope (YAGNI)

Live in-app GPS turn-by-turn; email/SMS; payments; multi-event support; guest messaging/chat.
