import type { Metadata } from "next";
import Link from "next/link";
import { getContributionByReference, markContributionPaid, getPaidTotal } from "@/lib/fund";
import { getFund } from "@/lib/gift-admin";
import { isCheckoutPaid } from "@/lib/paymongo";
import FloatingHearts from "../../components/FloatingHearts";
import FundBar from "../../components/FundBar";
import { RibbonBow, FloralDivider } from "../../components/Decor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you · Amari's Baptism" };

export default async function ThankYou({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  let paid = false;
  let amount: number | null = null;
  let name: string | null = null;

  if (ref) {
    const c = await getContributionByReference(ref);
    if (c) {
      amount = c.amountPhp;
      name = c.name;
      if (c.status === "paid") {
        paid = true;
      } else if (c.checkoutId) {
        try {
          if (await isCheckoutPaid(c.checkoutId)) {
            await markContributionPaid(c.id);
            paid = true;
          }
        } catch {
          /* verification will settle shortly */
        }
      }
    }
  }

  let raised = 0;
  try {
    raised = await getPaidTotal();
  } catch {
    raised = 0;
  }
  const f = await getFund();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-5 px-6 py-14 text-center">
      <FloatingHearts />
      <div className="anim-fade-up mx-auto max-w-md rounded-[26px] border border-blush-2 bg-white/70 px-6 py-10 shadow-[0_20px_50px_-30px_rgba(183,110,125,0.65)]">
        <div className="mx-auto h-20 w-28 anim-sway">
          <RibbonBow className="h-full w-full" />
        </div>
        {paid ? (
          <>
            <h1 className="mt-4 font-script text-5xl text-rose-deep">Thank you{name ? `, ${name}` : ""}!</h1>
            <FloralDivider className="mt-3" />
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              Your gift{amount ? ` of ₱${amount.toLocaleString()}` : ""} was received with so much love.
              It means the world to Amari&apos;s family. 🎀
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-4 font-script text-4xl text-rose-deep">Almost there…</h1>
            <FloralDivider className="mt-3" />
            <p className="mt-3 text-sm leading-relaxed text-ink-soft">
              We&apos;re confirming your payment. If you completed it, please refresh this page in a
              few seconds — it will update once PayMongo confirms.
            </p>
          </>
        )}
        <Link href="/" className="mt-7 inline-block rounded-full bg-rose px-7 py-3 font-semibold text-white shadow-[0_14px_30px_-16px_rgba(183,110,125,0.9)]">
          Back to the invitation
        </Link>
      </div>

      <FundBar raisedPhp={raised} goalPhp={f.goalPhp} item={f.item} blurb={f.blurb} />
    </main>
  );
}
