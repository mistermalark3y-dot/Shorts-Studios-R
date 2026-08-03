"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarDays,
  Clapperboard,
  FileText,
  Lightbulb,
  Settings,
  Tv,
  Video,
} from "lucide-react";

const links = [
  {
    href: "/",
    label: "Overview",
    icon: BarChart3,
  },
  {
    href: "/channels",
    label: "Channels",
    icon: Tv,
  },
  {
    href: "/content",
    label: "Ideas",
    icon: Lightbulb,
  },
  {
    href: "/scripts",
    label: "Scripts",
    icon: FileText,
  },
  {
    href: "/videos",
    label: "Videos",
    icon: Video,
  },
  {
    href: "/schedule",
    label: "Schedule",
    icon: CalendarDays,
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: Clapperboard,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-zinc-800 bg-zinc-950 p-4 md:sticky md:top-0 md:min-h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black">
          <Clapperboard className="h-5 w-5" />
        </div>

        <div>
          <p className="font-semibold">Shorts Studio</p>
          <p className="text-xs text-zinc-500">Content command center</p>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto md:flex-col">
        {links.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-w-max items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? "bg-white font-medium text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 hidden rounded-xl border border-zinc-800 bg-zinc-900 p-4 md:block">
        <p className="text-sm font-medium">Production workflow</p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Ideas → Scripts → Videos → Approval → Publishing
        </p>
      </div>
    </aside>
  );
}