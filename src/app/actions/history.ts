"use server";

import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { requireUser } from "@/server/auth";
import { deleteSearches } from "@/server/search";

export async function deleteSearchAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = Number(formData.get("id"));
  if (Number.isInteger(id)) await deleteSearches(getDb(), user.id, [id]);
  revalidatePath("/history");
}

export async function clearHistoryAction(): Promise<void> {
  const user = await requireUser();
  await deleteSearches(getDb(), user.id);
  revalidatePath("/history");
}
