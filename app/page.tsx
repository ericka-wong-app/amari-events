import IntroReveal from "./components/IntroReveal";
import FloatingHearts from "./components/FloatingHearts";
import GuestShell from "./components/GuestShell";
import Hero from "./components/Hero";
import Details from "./components/Details";
import Directions from "./components/Directions";
import GiftsTab from "./components/GiftsTab";
import { myPass, type Pass } from "./rsvp/actions";
import { loadFeed } from "./community/actions";
import { getPaidTotal } from "@/lib/fund";
import { getFund, listGiftItems, type GiftItem } from "@/lib/gift-admin";
import { getEventDetails } from "@/lib/event-details";
import type { Post } from "@/lib/community";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ i?: string | string[] }> }) {
  const sp = await searchParams;
  const inviteToken = Array.isArray(sp.i) ? sp.i[0] : sp.i ?? null;

  let initialPass: Pass | null = null;
  try {
    initialPass = await myPass();
  } catch {
    initialPass = null;
  }
  let raised = 0;
  try {
    raised = await getPaidTotal();
  } catch {
    raised = 0;
  }
  const fund = await getFund();
  const details = await getEventDetails();
  let items: GiftItem[] = [];
  try {
    items = await listGiftItems();
  } catch {
    items = [];
  }
  let posts: Post[] = [];
  try {
    posts = await loadFeed();
  } catch {
    posts = [];
  }

  return (
    <>
      <FloatingHearts />
      <IntroReveal />
      <GuestShell
        initialPass={initialPass}
        inviteToken={inviteToken}
        initialPosts={posts}
        hero={<Hero />}
        details={
          <>
            <Details details={details} />
            <Directions />
          </>
        }
        gifts={<GiftsTab fund={fund} raised={raised} items={items} />}
      />
    </>
  );
}
