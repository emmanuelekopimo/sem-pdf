import type { Metadata } from "next";
import Link from "next/link";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/server/auth-core";
import { SignInForm } from "./SignInForm";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <>
      <div>
        <h1>Sign in</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          to continue to your PDF library
        </p>
      </div>
      <SignInForm demoEmail={DEMO_EMAIL} demoPassword={DEMO_PASSWORD} />
      <p className="muted">
        New here?{" "}
        <Link href="/signup" className="link">
          Create an account
        </Link>
      </p>
    </>
  );
}
