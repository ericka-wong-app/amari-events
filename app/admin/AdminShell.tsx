import Link from "next/link";
import LogoutButton from "./LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/guests", label: "Invites" },
  { href: "/admin/details", label: "Details" },
  { href: "/admin/godparents", label: "Ninong & Ninang" },
  { href: "/admin/checkin", label: "Check-in" },
  { href: "/admin/community", label: "Album" },
  { href: "/admin/gifts", label: "Gifts" },
  { href: "/admin/team", label: "Admins" },
];

export default function AdminShell({
  title,
  active,
  children,
}: {
  title: string;
  active?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-rose-deep/75">
            Amari&apos;s Baptism · Admin
          </p>
          <h1 className="font-display text-3xl italic text-rose-deep">{title}</h1>
        </div>
        <LogoutButton />
      </header>

      <nav className="mt-4 flex flex-wrap gap-2">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              active === n.href
                ? "bg-rose text-white"
                : "border border-blush-2 bg-white text-rose-deep"
            }`}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
