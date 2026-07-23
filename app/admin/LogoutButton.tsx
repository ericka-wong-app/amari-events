"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminLogout } from "./actions";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(async () => { await adminLogout(); router.replace("/admin/login"); })}
      disabled={pending}
      className="rounded-full border border-blush-2 bg-white px-4 py-1.5 text-sm font-semibold text-rose-deep"
    >
      {pending ? "…" : "Log out"}
    </button>
  );
}
