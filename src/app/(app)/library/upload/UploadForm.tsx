"use client";

import { CircleCheck, CircleX, FileUp, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { uploadAction, type UploadState } from "@/app/actions/library";
import { FieldError } from "@/components/FieldError";
import { SubmitButton } from "@/components/SubmitButton";
import { COLLECTION_NAMES } from "@/lib/collections";

export function UploadForm() {
  const [state, action] = useActionState<UploadState, FormData>(uploadAction, {});
  const e = state.errors ?? {};
  return (
    <div className="upload-layout">
      <form action={action} className="form panel" noValidate data-testid="upload-form">
        <label className="dropzone" htmlFor="files" aria-invalid={!!e.files}>
          <FileUp size={36} strokeWidth={1.5} />
          <strong>Choose PDF files</strong>
          <span className="muted">Select one or more .pdf files</span>
          <input id="files" name="files" type="file" accept="application/pdf,.pdf" multiple aria-describedby={e.files ? "files-error" : undefined} />
        </label>
        <FieldError id="files-error" messages={e.files} />
        <div className="field">
          <label htmlFor="collection">Collection</label>
          {/* Uncontrolled with defaultValue so React 19 form reset after the action keeps a valid value. */}
          <select id="collection" name="collection" className="select" defaultValue="General" aria-invalid={!!e.collection}>
            {COLLECTION_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <FieldError id="collection-error" messages={e.collection} />
        </div>
        <SubmitButton className="btn btn-red" pendingText="Reading and indexing...">
          Upload and index
        </SubmitButton>
      </form>

      <section className="panel" aria-live="polite">
        <h2 style={{ marginBottom: 12 }}>What happens next</h2>
        {state.items?.length ? (
          <div className="upload-results" data-testid="upload-results">
            {state.items.map((item, i) => (
              <div className="upload-result" key={`${item.filename}-${i}`}>
                {!item.ok ? (
                  <CircleX size={20} color="var(--red-dark)" />
                ) : item.status === "no_text" ? (
                  <TriangleAlert size={20} color="var(--amber)" />
                ) : (
                  <CircleCheck size={20} color="var(--green)" />
                )}
                <div>
                  <strong>{item.ok ? item.title : item.filename}</strong>
                  <p className="muted">
                    {!item.ok
                      ? item.error
                      : item.status === "no_text"
                        ? `No text found in ${item.pageCount} pages. It may be a scan or photo, so it cannot be searched.`
                        : `${item.pageCount} pages, ${item.chunkCount} passages indexed`}
                  </p>
                  {item.ok && item.documentId && (
                    <Link href={`/documents/${item.documentId}`} className="link">
                      Open document
                    </Link>
                  )}
                </div>
              </div>
            ))}
            {state.durationMs !== undefined && <p className="muted">Finished in {(state.durationMs / 1000).toFixed(1)} s.</p>}
            <Link href="/search" className="btn btn-primary" style={{ justifySelf: "start" }}>
              Search your library
            </Link>
          </div>
        ) : (
          <ol className="muted" style={{ paddingLeft: 18, margin: 0, display: "grid", gap: 8 }}>
            <li>Text is read from every page of each PDF.</li>
            <li>Pages are split into short passages of about 70 words.</li>
            <li>Each passage becomes a 384 number embedding using all-MiniLM-L6-v2, running locally.</li>
            <li>Searches compare your question with every passage by meaning.</li>
          </ol>
        )}
      </section>
    </div>
  );
}
