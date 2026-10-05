import { LogOut, Upload } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { signOutAction } from "@/app/actions/auth";
import { Avatar } from "@/components/Avatar";
import { HeaderSearch } from "@/components/HeaderSearch";
import { TabBar, TopNav } from "@/components/NavLinks";
import { SearchBar } from "@/components/SearchBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { requireUser } from "@/server/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <>
      <header className="header">
        <Link href="/search" className="logo" aria-label="SemPDF home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={40} height={28} />
          SemPDF
        </Link>
        <div className="header-search">
          <Suspense fallback={<SearchBar />}>
            <HeaderSearch />
          </Suspense>
        </div>
        <div className="header-actions">
          <Link href="/library/upload" className="btn hide-mobile" data-testid="header-upload">
            <Upload size={18} />
            Upload
          </Link>
          <ThemeToggle />
          <span title={`${user.name} (${user.email})`} data-testid="user-avatar">
            <Avatar name={user.name} size={32} />
          </span>
          <form action={signOutAction}>
            <button type="submit" className="icon-btn" aria-label="Sign out" title="Sign out">
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </header>
      <TopNav />
      <main className="main">{children}</main>
      <TabBar />
    </>
  );
}
