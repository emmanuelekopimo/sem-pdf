"use server";

import { redirect } from "next/navigation";
import { getDb } from "@/db";
import { fieldErrors, signInSchema, signUpSchema, type FieldErrors } from "@/lib/validation";
import { EmailTakenError, checkCredentials, createUser, endSession, startSession } from "@/server/auth";

export type AuthState = { errors?: FieldErrors; values?: Record<string, string> };

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: { email: values.email } };
  const user = await checkCredentials(getDb(), parsed.data.email, parsed.data.password);
  if (!user) return { errors: { form: ["Email or password is incorrect"] }, values: { email: values.email } };
  await startSession(user);
  redirect("/search");
}

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? ""),
  };
  const parsed = signUpSchema.safeParse(values);
  const keep = { name: values.name, email: values.email };
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: keep };
  try {
    const user = await createUser(getDb(), parsed.data);
    await startSession(user);
  } catch (err) {
    if (err instanceof EmailTakenError) return { errors: { email: [err.message] }, values: keep };
    throw err;
  }
  redirect("/library/upload");
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/signin");
}
