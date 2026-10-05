"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SearchBar } from "./SearchBar";

export function HeaderSearch() {
  const params = useSearchParams();
  const pathname = usePathname();
  const q = pathname === "/search" ? (params.get("q") ?? "") : "";
  return <SearchBar key={q} defaultValue={q} />;
}
