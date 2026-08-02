import Link from "next/link";
import { BarChart3, Clapperboard, LayoutDashboard, Settings, Tv } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/channels", label: "Channels", icon: Tv },
  { href: "/content", label: "Content", icon: Clapperboard },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="border-b border-zinc-800 bg-zinc-950 p-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6 flex items-center gap-2 text-lg font-semibold">
        <BarChart3 className="h-5 w-5" /> Shorts Studio
      </div>
      <nav className="flex gap-2 overflow-x-auto md:flex-col">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex min-w-max items-center gap-2 rounded-lg px-3 py-2 text-zinc-300 hover:bg-zinc-900 hover:text-white">
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
