"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { fromKobo, toKobo } from "@/lib/money";
import { stageLabel } from "@/lib/ops/vehicle-stage";
import { USE_CATEGORY_LABELS } from "@/types";
import type { DamageLevel, LifecycleStage, VehicleCondition, SourceRegion, VehicleUseCategory, VehicleHistoryReport, AccidentStatus, RepairStatus } from "@/types";

const DAMAGE_LEVELS: DamageLevel[] = ["none", "light", "moderate", "heavy"];
const ACCIDENT_STATUS_OPTIONS: AccidentStatus[] = ["none", "minor", "major", "unknown"];
const REPAIR_STATUS_OPTIONS: RepairStatus[] = ["not_repaired", "repaired", "repaired_and_inspected"];

function normalizeHistoryReport(value: VehicleHistoryReport | null | undefined): VehicleHistoryReport {
  return {
    has_accident_history: Boolean(value?.has_accident_history),
    accident_status: value?.accident_status ?? "none",
    accident_summary: value?.accident_summary ?? null,
    repair_status: value?.repair_status ?? "not_repaired",
    front_damage_level: value?.front_damage_level ?? "none",
    rear_damage_level: value?.rear_damage_level ?? "none",
    left_side_damage_level: value?.left_side_damage_level ?? "none",
    right_side_damage_level: value?.right_side_damage_level ?? "none",
    before_after_photo_urls: Array.isArray(value?.before_after_photo_urls) ? value.before_after_photo_urls : [],
    inspection_notes: value?.inspection_notes ?? null,
    verified_by: value?.verified_by ?? null,
    verified_at: value?.verified_at ?? null,
  };
}

const USE_CATEGORY_OPTIONS = Object.entries(USE_CATEGORY_LABELS) as [VehicleUseCategory, string][];

interface Props {
  vehicleId: string;
  stages: LifecycleStage[];
  lifecycleStage: LifecycleStage;
  salePriceKobo: number | null;
  condition: VehicleCondition | null;
  sourceRegion: SourceRegion | null;
  colour: string | null;
  videoUrl: string | null;
  isPublished: boolean;
  lotNumber: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  useCategories: VehicleUseCategory[];
  historyReport?: VehicleHistoryReport | null;
}

type Status = "idle" | "saving" | "saved" | "error";

// certification_status is deliberately not editable here — it only ever
// changes through the InspectionPanel's "Certify & Issue Warranty" action,
// which creates the matching warranty_policies row in the same step. A
// plain dropdown here previously let staff mark a vehicle "Certified" with
// no warranty behind it, which the marketing site's isCertified() check
// would silently disagree with.
export function VehicleEditForm({
  vehicleId,
  stages,
  lifecycleStage,
  salePriceKobo,
  condition,
  sourceRegion,
  colour,
  videoUrl,
  isPublished,
  lotNumber,
  seoTitle,
  seoDescription,
  useCategories: initialUseCategories,
  historyReport,
}: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<LifecycleStage>(lifecycleStage);
  const [priceNaira, setPriceNaira] = useState(
    salePriceKobo ? String(Math.round(fromKobo(salePriceKobo))) : "",
  );
  const [cond, setCond] = useState<VehicleCondition | "">(condition ?? "");
  const [colourValue, setColourValue] = useState(colour ?? "");
  const [video, setVideo] = useState(videoUrl ?? "");
  const [published, setPublished] = useState(isPublished);
  const [lotNumberValue, setLotNumberValue] = useState(lotNumber ?? "");
  const [seoTitleValue, setSeoTitleValue] = useState(seoTitle ?? "");
  const [seoDescriptionValue, setSeoDescriptionValue] = useState(seoDescription ?? "");
  const [useCategories, setUseCategories] = useState<VehicleUseCategory[]>(initialUseCategories);
  const [history, setHistory] = useState<VehicleHistoryReport>(normalizeHistoryReport(historyReport));
  const [status, setStatus] = useState<Status>("idle");
  const [historyUploadBusy, setHistoryUploadBusy] = useState(false);
  const historyInputRef = useRef<HTMLInputElement>(null);

  function toggleUseCategory(cat: VehicleUseCategory) {
    setUseCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  }

  async function uploadHistoryEvidence(files: File[]) {
    if (files.length === 0) return;
    setHistoryUploadBusy(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      const res = await fetch(`/api/vehicles/${vehicleId}/photos`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        setStatus("error");
        return;
      }
      const uploadedUrls = (json.photos ?? []).map((photo: { url: string }) => photo.url);
      setHistory((prev) => ({
        ...prev,
        before_after_photo_urls: [...prev.before_after_photo_urls, ...uploadedUrls],
      }));
    } catch {
      setStatus("error");
    } finally {
      setHistoryUploadBusy(false);
      if (historyInputRef.current) historyInputRef.current.value = "";
    }
  }

  async function save() {
    setStatus("saving");
    try {
      const res = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lifecycle_stage: stage,
          sale_price_kobo: priceNaira ? toKobo(parseFloat(priceNaira)) : null,
          condition: cond || null,
          colour: colourValue || null,
          video_url: video || null,
          is_published: published,
          use_categories: useCategories,
          lot_number: lotNumberValue || null,
          seo_title: seoTitleValue || null,
          seo_description: seoDescriptionValue || null,
          history_report: {
            ...history,
            before_after_photo_urls: history.before_after_photo_urls ?? [],
          },
        }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="ops-panel">
      <div className="ops-panel-title">Edit Vehicle</div>

      <label className="ops-field-label" htmlFor="veh-stage">
        Lifecycle Stage
      </label>
      <select
        id="veh-stage"
        className="ops-input"
        value={stage}
        onChange={(e) => setStage(e.target.value as LifecycleStage)}
      >
        {stages.map((s) => (
          <option key={s} value={s}>
            {stageLabel(s)}
          </option>
        ))}
      </select>

      <label className="ops-field-label" htmlFor="veh-price">
        Sale Price (₦)
      </label>
      <input
        id="veh-price"
        className="ops-input"
        type="number"
        value={priceNaira}
        onChange={(e) => setPriceNaira(e.target.value)}
      />

      <label className="ops-field-label" htmlFor="veh-condition">
        Condition
      </label>
      <select
        id="veh-condition"
        className="ops-input"
        value={cond}
        onChange={(e) => setCond(e.target.value as VehicleCondition)}
      >
        {/* "Tokunbo" specifically means foreign-used — wrong label for a
            Nigerian-sourced vehicle, so it's derived from sourceRegion
            rather than a fixed string (see lib/vehicle-display.ts). */}
        <option value="used">{sourceRegion === "nigeria" ? "Used (Nigerian Used)" : "Used (Tokunbo)"}</option>
        <option value="new">Brand New</option>
      </select>

      <label className="ops-field-label" htmlFor="veh-colour">
        Colour
      </label>
      <input
        id="veh-colour"
        className="ops-input"
        value={colourValue}
        onChange={(e) => setColourValue(e.target.value)}
      />

      <label className="ops-field-label">Use Categories (select all that apply)</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 16px", marginBottom: 16 }}>
        {USE_CATEGORY_OPTIONS.map(([value, label]) => (
          <label key={value} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--text)" }}>
            <input type="checkbox" checked={useCategories.includes(value)} onChange={() => toggleUseCategory(value)} />
            {label}
          </label>
        ))}
      </div>

      <label className="ops-field-label" htmlFor="veh-video">
        Video URL (optional)
      </label>
      <input
        id="veh-video"
        className="ops-input"
        placeholder="https://youtube.com/..."
        value={video}
        onChange={(e) => setVideo(e.target.value)}
      />

      <label className="ops-field-label" htmlFor="veh-lot">
        Lot Number (optional — auction reference)
      </label>
      <input
        id="veh-lot"
        className="ops-input"
        value={lotNumberValue}
        onChange={(e) => setLotNumberValue(e.target.value)}
      />

      <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13.5, color: "var(--text)" }}>
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Published — visible on the marketing site
      </label>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginBottom: 4 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 10 }}>
          SEO (not yet live)
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
          There is no public per-vehicle page yet (vehicle detail is a modal on /vehicles), so
          these fields don&apos;t show up anywhere for a customer or search engine yet — saved
          here so the data exists once that page is built.
        </div>
      </div>

      <label className="ops-field-label" htmlFor="veh-seo-title">
        SEO Title
      </label>
      <input
        id="veh-seo-title"
        className="ops-input"
        value={seoTitleValue}
        onChange={(e) => setSeoTitleValue(e.target.value)}
      />

      <label className="ops-field-label" htmlFor="veh-seo-desc">
        SEO Description
      </label>
      <textarea
        id="veh-seo-desc"
        className="ops-input"
        rows={2}
        value={seoDescriptionValue}
        onChange={(e) => setSeoDescriptionValue(e.target.value)}
      />

      <div style={{ borderTop: "1px solid var(--border)", marginTop: 18, paddingTop: 18 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--subtle)", letterSpacing: ".5px", textTransform: "uppercase", marginBottom: 12 }}>
          Vehicle History &amp; Accident Record
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13.5, color: "var(--text)" }}>
          <input
            type="checkbox"
            checked={history.has_accident_history}
            onChange={(e) => setHistory((prev) => ({ ...prev, has_accident_history: e.target.checked }))}
          />
          This vehicle has accident history
        </label>

        <label className="ops-field-label" htmlFor="veh-accident-status">
          Accident Status
        </label>
        <select
          id="veh-accident-status"
          className="ops-input"
          value={history.accident_status}
          onChange={(e) => setHistory((prev) => ({ ...prev, accident_status: e.target.value as AccidentStatus }))}
        >
          {ACCIDENT_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value === "none" ? "No history" : value === "minor" ? "Minor" : value === "major" ? "Major" : "Unknown"}
            </option>
          ))}
        </select>

        <label className="ops-field-label" htmlFor="veh-accident-summary">
          Accident Summary
        </label>
        <textarea
          id="veh-accident-summary"
          className="ops-input"
          rows={3}
          value={history.accident_summary ?? ""}
          onChange={(e) => setHistory((prev) => ({ ...prev, accident_summary: e.target.value || null }))}
        />

        <label className="ops-field-label" htmlFor="veh-repair-status">
          Repair Status
        </label>
        <select
          id="veh-repair-status"
          className="ops-input"
          value={history.repair_status}
          onChange={(e) => setHistory((prev) => ({ ...prev, repair_status: e.target.value as RepairStatus }))}
        >
          {REPAIR_STATUS_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value === "not_repaired" ? "Not repaired" : value === "repaired" ? "Repaired" : "Repaired and inspected"}
            </option>
          ))}
        </select>

        <div className="ops-form-grid" style={{ marginTop: 16 }}>
          {(["front", "rear", "left_side", "right_side"] as const).map((side) => (
            <div key={side}>
              <label className="ops-field-label" htmlFor={`veh-${side}`}>
                {side.replace("_", " ").replace(/(^\w|_\w)/g, (m) => m.replace("_", " ").toUpperCase())} damage
              </label>
              <select
                id={`veh-${side}`}
                className="ops-input"
                value={history[`${side}_damage_level` as keyof VehicleHistoryReport] as DamageLevel}
                onChange={(e) => setHistory((prev) => ({ ...prev, [`${side}_damage_level`]: e.target.value as DamageLevel }))}
              >
                {DAMAGE_LEVELS.map((value) => (
                  <option key={value} value={value}>
                    {value === "none" ? "None" : value === "light" ? "Light" : value === "moderate" ? "Moderate" : "Heavy"}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <label className="ops-field-label" htmlFor="veh-history-notes">
          Inspection Notes
        </label>
        <textarea
          id="veh-history-notes"
          className="ops-input"
          rows={3}
          value={history.inspection_notes ?? ""}
          onChange={(e) => setHistory((prev) => ({ ...prev, inspection_notes: e.target.value || null }))}
        />

        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
            Before / After evidence photos
          </div>
          <button
            type="button"
            className="ops-btn"
            style={{ marginBottom: 8 }}
            onClick={() => historyInputRef.current?.click()}
            disabled={historyUploadBusy}
          >
            {historyUploadBusy ? "Uploading..." : "Upload evidence photos"}
          </button>
          <input
            ref={historyInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
            onChange={(e) => uploadHistoryEvidence(Array.from(e.target.files ?? []))}
            style={{ display: "none" }}
          />
        </div>

        {history.before_after_photo_urls.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 12 }}>
            {history.before_after_photo_urls.map((photoUrl, index) => (
              <div key={`${photoUrl}-${index}`} style={{ position: "relative" }}>
                <img
                  src={photoUrl}
                  alt="Vehicle history evidence"
                  style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setHistory((prev) => ({
                      ...prev,
                      before_after_photo_urls: prev.before_after_photo_urls.filter((_, idx) => idx !== index),
                    }))
                  }
                  aria-label="Remove evidence photo"
                  style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    border: "none",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(12,16,23,.7)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="ops-field-label" htmlFor="veh-history-photos">
          Before / After photo URLs
        </label>
        <textarea
          id="veh-history-photos"
          className="ops-input"
          rows={2}
          value={history.before_after_photo_urls.join("\n")}
          onChange={(e) =>
            setHistory((prev) => ({
              ...prev,
              before_after_photo_urls: e.target.value
                .split(/\n|,/)
                .map((url) => url.trim())
                .filter(Boolean),
            }))
          }
          placeholder="Paste one URL per line"
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}>
        <button className="ops-btn" onClick={save} disabled={status === "saving"}>
          {status === "saving" ? "Saving..." : "Save Changes"}
        </button>
        {status === "saved" && (
          <span style={{ color: "var(--green)", fontSize: 12 }}>Saved</span>
        )}
        {status === "error" && (
          <span style={{ color: "var(--red)", fontSize: 12 }}>Something went wrong</span>
        )}
      </div>
    </div>
  );
}
