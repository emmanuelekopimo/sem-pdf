import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "./SignUpForm";

export const metadata: Metadata = { title: "Create account" };

export default function SignUpPage() {
  return (
    <>
      <div>
        <h1>Create your account</h1>
        <p className="muted" style={{ marginTop: 6 }}>
          Your library and search history are private to you.
        </p>
      </div>
      <SignUpForm />
      <p className="muted">
        Already have an account?{" "}
        <Link href="/signin" className="link">
          Sign in
        </Link>
      </p>
    </>
  );
}
