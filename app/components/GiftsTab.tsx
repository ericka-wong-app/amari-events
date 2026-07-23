import FundCard from "./FundCard";
import RegistryList from "../gift/RegistryList";
import type { Fund, GiftItem } from "@/lib/gift-admin";

export default function GiftsTab({ fund, raised, items }: { fund: Fund; raised: number; items: GiftItem[] }) {
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-10">
      <FundCard raisedPhp={raised} goalPhp={fund.goalPhp} item={fund.item} blurb={fund.blurb} imageUrl={fund.imageUrl} />
      <RegistryList items={items} />
    </div>
  );
}
