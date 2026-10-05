"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { History, Library, Search, Upload } from "lucide-react";

const LINKS = [
  { href: "/search", label: "Search", icon: Search, match: ["/search"] },
  { href: "/library", label: "Library", icon: Library, match: ["/library", "/documents"] },
  { href: "/history", label: "History", icon: History, match: ["/history"] },
];

function isActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(`${m}/`));
}

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="topnav" aria-label="Main">
      {LINKS.map(({ href, label, icon: Icon, match }) => (
        <Link key={href} href={href} aria-current={isActive(pathname, match) && pathname !== "/library/upload" ? "page" : undefined}>
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const tabs = [...LINKS.slice(0, 2), { href: "/library/upload", label: "Upload", icon: Upload, match: ["/library/upload"] }, LINKS[2]!];
  return (
    <nav className="tabbar" aria-label="Main mobile">
      {tabs.map(({ href, label, icon: Icon, match }) => {
        const active = href === "/library" ? isActive(pathname, match) && pathname !== "/library/upload" : isActive(pathname, match);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon size={22} strokeWidth={active ? 2.2 : 1.7} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
