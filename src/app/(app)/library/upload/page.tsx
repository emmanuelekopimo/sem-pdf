import type { Metadata } from "next";
import { MAX_FILES_PER_UPLOAD } from "@/lib/validation";
import { requireUser } from "@/server/auth";
import { UploadForm } from "./UploadForm";

export const metadata: Metadata = { title: "Upload" };

export default async function UploadPage() {
  await requireUser();
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Upload PDFs</h1>
          <p className="muted">Up to {MAX_FILES_PER_UPLOAD} files at a time, 10 MB each. Text is extracted, split into passages and embedded on this server.</p>
        </div>
      </div>
      <UploadForm />
    </>
  );
}
