import IntroReveal from "./components/IntroReveal";
import FloatingHearts from "./components/FloatingHearts";
import GuestShell from "./components/GuestShell";
import Hero from "./components/Hero";
import Details from "./components/Details";
import Godparents from "./components/Godparents";
import Directions from "./components/Directions";
import GiftsTab from "./components/GiftsTab";
import { myPass, type Pass } from "./rsvp/actions";
import { getPaidTotal } from "@/lib/fund";
import { getFund, listGiftItems, type GiftItem } from "@/lib/gift-admin";

export const dynamic = "force-dynamic";

export default async function Home() {
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
  let items: GiftItem[] = [];
  try {
    items = await listGiftItems();
  } catch {
    items = [];
  }

  return (
    <>
      <FloatingHearts />
      <IntroReveal />
      <GuestShell
        initialPass={initialPass}
        hero={<Hero />}
        details={
          <>
            <Details />
            <Godparents />
            <Directions />
          </>
        }
        gifts={<GiftsTab fund={fund} raised={raised} items={items} />}
      />
    </>
  );
}
