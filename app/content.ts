// app/content.ts — the ONLY place to edit event copy.
export type Godparent = { name: string; role: "Ninong" | "Ninang" };
export type RegistryLink = { label: string; href: string };

export const content = {
  celebrant: "Amari Wong",
  celebrantFirst: "Amari",
  eventType: "Baptism",
  intro: "Join us for a special day of faith and love.",
  dateLong: "Sunday, July 26, 2026",
  dateISO: "2026-07-26",
  hero: {
    kicker: "Celebrating the Baptism of",
    message:
      "Celebrate this meaningful milestone with us as we gather with family and friends to witness this special occasion. Your presence will make this day even more memorable.",
  },
  ceremony: {
    title: "The Ceremony",
    venue: "St. Benedict Parish",
    address: "Ayala Westgrove, Santa Rosa, Laguna",
    time: "2:00 PM",
  },
  reception: {
    title: "The Reception",
    venue: "Okairi",
    address: "B2 L10 Phase 1, La Joya Subd., Brgy. Dila, Santa Rosa, Laguna",
    time: "4:00 PM",
  },
  godparents: {
    // TODO(host): replace with the real list.
    callTime: "Kindly arrive by 1:30 PM at St. Benedict Parish.",
    dressCode: "Dress code: soft pastels (blush, sage, cream).",
    note: "Please proceed to the reserved front pews before the rite begins.",
    list: [
      { role: "Ninong", name: "Tito Gelo" },
    ] as Godparent[],
  },
  directions: {
    origin: "WalterMart Santa Rosa",
    destination: "Okairi",
    distance: "~7.8 km",
    steps: [
      "From WalterMart Santa Rosa, head east on Santa Rosa–Tagaytay Rd (Balibago Rd).",
      "Pass Mima The Baker's Partner — stay on the main road.",
      "Turn right toward Turquoise Rd → Diamond Rd, south past Balibago Market.",
      "Continue via Zircon Rd → Pearl Rd onto La Joya de Sta. Rosa Road.",
      "Do NOT take the straight AH26 center road (that forces the far U-turn) — keep right and follow the curve.",
      "Pass the Shell + McDonald's at the Amethyst Rd light, then J&T Express, then the LA JOYA / Kasa Joya gate (Alfamart on the corner).",
      "Turn into La Joya Subdivision → Blue Palm Street → arrive at Okairi.",
    ],
    // Fallback handoff links, pre-aimed at the correct pins:
    okairiPin: "https://maps.app.goo.gl/EFdo9ihkCGqpvcCH8",
    fromWalterMart: "https://maps.app.goo.gl/5SyjT2iouahqDf9E9",
    fromParish:
      "https://www.google.com/maps/dir/?api=1&origin=St%20Benedict%20Parish%2C%20Ayala%20Westgrove%2C%20City%20of%20Santa%20Rosa%2C%20Laguna&destination=Okairi%2C%20B2%20L10%20Ph1%20La%20Joya%20Subd.%2C%20Brgy%20Dila%2C%20Santa%20Rosa%2C%20Laguna&travelmode=driving",
  },
  gift: {
    note: "Your presence is the greatest gift. Should you wish to give more, monetary gifts are warmly welcome.",
    // TODO(host): set the real item + goal.
    fund: {
      item: "a special gift for baby Amari",
      goalPhp: 20000,
      blurb: "Chip in any amount — every peso brings us closer. 🎀",
    },
    items: [
      // TODO(host): curate. Defaults keep the section from looking empty.
      "Books & keepsakes for Amari",
      "Baby essentials",
    ],
    links: [] as RegistryLink[], // e.g. [{ label: "GCash", href: "..." }]
  },
} as const;

export default content;
