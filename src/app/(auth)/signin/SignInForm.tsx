"use client";

import { Info } from "lucide-react";
import { useActionState } from "react";
import { signInAction, type AuthState } from "@/app/actions/auth";
import { FieldError } from "@/components/FieldError";
import { SubmitButton } from "@/components/SubmitButton";

export function SignInForm({ demoEmail, demoPassword }: { demoEmail: string; demoPassword: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signInAction, {});
  const e = state.errors ?? {};
  return (
    <form action={action} className="form" noValidate>
      <div className="demo-note" data-testid="demo-note">
        <Info size={18} />
        <span>
          Demo account is filled in. Email <strong>{demoEmail}</strong>, password <strong>{demoPassword}</strong>.
        </span>
      </div>
      {e.form && (
        <p className="form-error" role="alert">
          {e.form[0]}
        </p>
      )}
      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="input"
          autoComplete="email"
          defaultValue={state.values?.email ?? demoEmail}
          aria-invalid={!!e.email}
          aria-describedby={e.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" messages={e.email} />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className="input"
          autoComplete="current-password"
          defaultValue={demoPassword}
          aria-invalid={!!e.password}
          aria-describedby={e.password ? "password-error" : undefined}
        />
        <FieldError id="password-error" messages={e.password} />
      </div>
      <SubmitButton pendingText="Signing in...">Sign in</SubmitButton>
    </form>
  );
}
