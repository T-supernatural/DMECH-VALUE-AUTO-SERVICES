"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, CheckCircle2, Upload } from "lucide-react";
import type { CustomerDocument } from "@/types";

const DOC_TYPES = ["Government ID", "Proof of Income", "Utility Bill", "Bank Statement", "Other"];

interface SignedDocument extends CustomerDocument {
  signedUrl: string | null;
}

// Uploads via XMLHttpRequest, not fetch -- fetch has no upload-progress
// event, and a bare "Uploading..." string with no indication of how far
// along a multi-MB scan/photo is doesn't tell the customer anything.
function uploadWithProgress(url: string, formData: FormData, onProgress: (pct: number) => void): Promise<{ ok: boolean; json: unknown }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        resolve({ ok: xhr.status >= 200 && xhr.status < 300, json: JSON.parse(xhr.responseText) });
      } catch {
        resolve({ ok: false, json: null });
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

// Shared between /register (customer uploading their own documents) and
// /ops/customers/[id] + /portal/documents (viewing/adding later) — the
// private bucket means every read needs a signed URL, fetched fresh here
// rather than trusting a stored public URL (see api/customers/[id]/documents
// GET).
export function DocumentUploadManager({ customerId, canUpload }: { customerId: string; canUpload: boolean }) {
  const [documents, setDocuments] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [docType, setDocType] = useState(DOC_TYPES[0]);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Doesn't set loading=true itself — `loading` already starts true (see
  // useState below) for the initial mount fetch, and a silent refresh after
  // upload doesn't need to flip the loading state at all. Keeps this safe to
  // call directly from the effect body without a synchronous setState there.
  async function loadDocuments() {
    try {
      const res = await fetch(`/api/customers/${customerId}/documents`);
      const json = await res.json();
      if (res.ok) setDocuments(json.documents ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  async function uploadFile(file: File) {
    setStatus("uploading");
    setProgress(0);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", docType);
      const { ok, json } = await uploadWithProgress(`/api/customers/${customerId}/documents`, formData, setProgress);
      if (!ok) {
        setError((json as { error?: string })?.error || "Upload failed.");
        setStatus("error");
        return;
      }
      setStatus("idle");
      await loadDocuments();
    } catch {
      setError("Upload failed.");
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  return (
    <div className="ops-panel">
      <div className="ops-panel-title">Documents</div>

      {loading ? (
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Loading...</div>
      ) : documents.length === 0 ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--muted)", marginBottom: 14 }}>
          <FileText size={16} strokeWidth={1.75} />
          No documents uploaded yet{canUpload ? " — upload your first one below." : "."}
        </div>
      ) : (
        <div style={{ marginBottom: 14 }}>
          {documents.map((doc, i) => (
            <div key={i} className="ops-info-row">
              <span className="ops-info-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <FileText size={14} strokeWidth={2} />
                {doc.type}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {doc.verified && (
                  <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--green)", fontSize: 11 }}>
                    <CheckCircle2 size={13} strokeWidth={2} /> Verified
                  </span>
                )}
                {doc.signedUrl && (
                  <a href={doc.signedUrl} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", fontSize: 12 }}>
                    View →
                  </a>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {canUpload && (
        <>
          <label className="ops-field-label" htmlFor="doc-type">Document Type</label>
          <select id="doc-type" className="ops-input" value={docType} onChange={(e) => setDocType(e.target.value)} disabled={status === "uploading"}>
            {DOC_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <div
            className={`ops-dropzone ${dragOver ? "drag-over" : ""}`}
            onClick={() => status !== "uploading" && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              if (status !== "uploading") setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            style={{ marginTop: 10, cursor: status === "uploading" ? "default" : "pointer" }}
          >
            {status === "uploading" ? (
              <>
                <div style={{ fontSize: 13, marginBottom: 8 }}>Uploading — {progress}%</div>
                <div className="ops-progress-track" style={{ maxWidth: 200, margin: "0 auto" }}>
                  <span className="ops-progress-fill" style={{ width: `${progress}%`, background: "var(--blue)" }} />
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
                  <Upload size={20} strokeWidth={1.75} />
                </div>
                Drag &amp; drop a file here, or click to choose one
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            disabled={status === "uploading"}
            style={{ display: "none" }}
          />
          {error && <div style={{ fontSize: 12, color: "var(--red)", marginTop: 8 }}>{error}</div>}
        </>
      )}
    </div>
  );
}
