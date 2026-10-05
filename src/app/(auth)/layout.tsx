import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth">
      <section className="auth-art" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/illustrations/signin.svg" alt="" width={420} height={300} />
        <h2>Search PDFs by what they mean</h2>
        <p className="muted" style={{ maxWidth: 380 }}>
          Ask a question in your own words. SemPDF finds the page that answers it, even when the words are different.
        </p>
      </section>
      <main className="auth-form">
        <div className="auth-card">
          <Link href="/signin" className="logo" aria-label="SemPDF home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" width={40} height={28} />
            SemPDF
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
