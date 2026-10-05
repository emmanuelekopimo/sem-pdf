"use client";

import { useActionState } from "react";
import { signUpAction, type AuthState } from "@/app/actions/auth";
import { FieldError } from "@/components/FieldError";
import { SubmitButton } from "@/components/SubmitButton";

export function SignUpForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUpAction, {});
  const e = state.errors ?? {};
  const field = (name: "name" | "email" | "password", label: string, type: string, autoComplete: string) => (
    <div className="field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        className="input"
        autoComplete={autoComplete}
        defaultValue={name === "password" ? undefined : state.values?.[name]}
        aria-invalid={!!e[name]}
        aria-describedby={e[name] ? `${name}-error` : undefined}
      />
      <FieldError id={`${name}-error`} messages={e[name]} />
    </div>
  );
  return (
    <form action={action} className="form" noValidate>
      {field("name", "Full name", "text", "name")}
      {field("email", "Email", "email", "email")}
      {field("password", "Password", "password", "new-password")}
      <SubmitButton pendingText="Creating account...">Create account</SubmitButton>
    </form>
  );
}
