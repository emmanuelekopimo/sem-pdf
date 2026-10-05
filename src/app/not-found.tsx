import Link from "next/link";

export default function NotFound() {
  return (
    <main className="empty" style={{ minHeight: "70vh", alignContent: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/illustrations/no-results.svg" alt="" width={240} height={160} />
      <h1>Page not found</h1>
      <p className="muted">This page does not exist, or it belongs to another account.</p>
      <Link href="/search" className="btn btn-primary">
        Back to search
      </Link>
    </main>
  );
}
