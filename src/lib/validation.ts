import { z } from "zod";
import { COLLECTION_NAMES } from "./collections";
import { MAX_QUERY_LENGTH } from "./search-rules";

export const MAX_FILE_BYTES = 10 * 1024 * 1024;
export const MAX_FILES_PER_UPLOAD = 10;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(60, "Name is too long"),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password is too long"),
});

export const searchQuerySchema = z
  .string()
  .trim()
  .min(2, "Type at least 2 characters")
  .max(MAX_QUERY_LENGTH, `Keep searches under ${MAX_QUERY_LENGTH} characters`);

export type FileLike = { name: string; size: number; type: string };

export const uploadSchema = z.object({
  collection: z.enum(COLLECTION_NAMES, { message: "Pick a collection" }),
  files: z
    .array(
      z.custom<FileLike>(
        (f) => !!f && typeof f === "object" && "name" in f && "size" in f && (f as FileLike).size > 0,
        "Choose at least one PDF",
      ),
    )
    .min(1, "Choose at least one PDF")
    .max(MAX_FILES_PER_UPLOAD, `Upload at most ${MAX_FILES_PER_UPLOAD} files at a time`)
    .superRefine((files, ctx) => {
      for (const f of files) {
        if (!/\.pdf$/i.test(f.name) || (f.type && f.type !== "application/pdf")) {
          ctx.addIssue({ code: "custom", message: `${f.name} is not a PDF` });
        } else if (f.size > MAX_FILE_BYTES) {
          ctx.addIssue({ code: "custom", message: `${f.name} is larger than 10 MB` });
        }
      }
    }),
});

export type FieldErrors = Record<string, string[] | undefined>;

/** Flattens a Zod error into { field: [messages] } for inline form errors. */
export function fieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    (out[key] ??= []).push(issue.message);
  }
  return out;
}
