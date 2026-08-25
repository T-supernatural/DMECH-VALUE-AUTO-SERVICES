"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X, CheckCircle2, TriangleAlert, MessageCircle } from "lucide-react";
import { formatNaira } from "@/lib/money";
import {
  isCertified,
  activeWarranty,
  displayStatus,
  publicPhotos,
  conditionLabel,
  type PublicVehicle,
} from "@/lib/vehicle-display";
import { whatsappHref, AUTOCHEK_URL } from "@/lib/contact";
import { ImageLightbox } from "@/components/marketing/ImageLightbox";
import { VehicleStampOverlay } from "@/components/marketing/VehicleStampOverlay";

type Tab = "condition" | "specs" | "history" | "financing" | "certification";

const TABS: { id: Tab; label: string }[] = [
  { id: "condition", label: "Condition Report" },
  { id: "specs", label: "Specs" },
  { id: "history", label: "History" },
  { id: "certification", label: "Certification & Warranty" },
  { id: "financing", label: "Financing" },
];

const SCORE_COLORS: Record<string, string> = {
  Excellent: "#16A34A",
  Good: "#1899E7",
  Fair: "#D97706",
};

interface Props {
  vehicle: PublicVehicle;
  onClose: () => void;
  defaultDepositPct: number;
  defaultTenorMonths: number;
}

export function VehicleDetailModal({ vehicle, onClose, defaultDepositPct, defaultTenorMonths }: Props) {
  const [tab, setTab] = useState<Tab>("condition");
  const [plan, setPlan] = useState<"dmech_direct" | "partner_finance">("dmech_direct");
  const [photoIndex, setPhotoIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = "vehicle-modal-title";

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !lightboxOpen) onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, lightboxOpen]);

  const certified = isCertified(vehicle);
  const warranty = activeWarranty(vehicle);
  const photos = publicPhotos(vehicle);
  const price = vehicle.sale_price_kobo ?? 0;
  const sold = displayStatus(vehicle) === "Sold";
  const deposit = plan === "dmech_direct" ? Math.max(defaultDepositPct, 30) : 25;
  const tenor = plan === "dmech_direct" ? defaultTenorMonths : 18;
  const depositAmount = (price * deposit) / 100;
  const monthly = ((price - depositAmount) / tenor) || 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close" ref={closeRef}>
          <X size={16} strokeWidth={2} />
        </button>
        <div className="modal-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`modal-tab ${tab === t.id ? "active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="modal-body">
          {photos.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a local /public asset */}
              <img
                src={photos[photoIndex]?.url}
                alt={`${vehicle.make} ${vehicle.model}`}
                onClick={() => setLightboxOpen(true)}
                style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, display: "block", cursor: "zoom-in" }}
              />
              <VehicleStampOverlay vehicle={vehicle} />
              </div>
              {photos.length > 1 && (
                <div style={{ display: "flex", gap: 6, marginTop: 8, overflowX: "auto" }}>
                  {photos.map((photo, i) => (
                    // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt=""
                      onClick={() => setPhotoIndex(i)}
                      style={{
                        width: 56,
                        height: 42,
                        objectFit: "cover",
                        borderRadius: 6,
                        cursor: "pointer",
                        flexShrink: 0,
                        border: i === photoIndex ? "2px solid var(--blue)" : "2px solid transparent",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <div id={titleId} style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700 }}>
              {vehicle.make} {vehicle.model} {vehicle.year}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {vehicle.colour} · {displayStatus(vehicle)}
              {price ? ` · ${formatNaira(price)}` : ""}
            </div>
            {sold && (
              <div style={{ marginTop: 10, padding: "10px 14px", background: "var(--border)", borderRadius: 8, fontSize: 12.5, color: "var(--muted)" }}>
                This vehicle has already been sold — shown here as a recent example of what DMECH
                delivers. Browse similar available vehicles or ask us to source another like it.
              </div>
            )}
          </div>

          {tab === "condition" && (
            <>
              {vehicle.condition_report.length === 0 ? (
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  A full DMECH 40+ point inspection report is being prepared for this vehicle —
                  ask us on WhatsApp for the current status.
                </p>
              ) : (
                <div className="cond-grid">
                  {vehicle.condition_report.map((item) => (
                    <div className="cond-item" key={item.area}>
                      <div className="cond-item-name">{item.area}</div>
                      <div
                        className="cond-item-score"
                        style={{
                          background: `${SCORE_COLORS[item.score] ?? "#6B7A8D"}1A`,
                          color: SCORE_COLORS[item.score] ?? "#6B7A8D",
                        }}
                      >
                        {item.score}
                      </div>
                      <div className="cond-item-notes">{item.notes}</div>
                    </div>
                  ))}
                </div>
              )}
              {vehicle.inspection_score && (
                <div style={{ marginTop: 16, fontSize: 13, color: "var(--muted)" }}>
                  Overall inspection score: <strong>{vehicle.inspection_score}/10</strong>
                </div>
              )}
            </>
          )}

          {tab === "specs" && (
            <div>
              {[
                ["Make", vehicle.make],
                ["Model", vehicle.model],
                ["Year", vehicle.year],
                [vehicle.fuel_type === "electric" ? "Range" : "Engine", vehicle.fuel_type === "electric" ? `${vehicle.battery_range_km ?? "—"} km` : `${vehicle.engine_cc ?? "—"}cc`],
                ["Colour", vehicle.colour ?? "—"],
                ["Fuel Type", vehicle.fuel_type ?? "—"],
                ["Condition", conditionLabel(vehicle)],
                ["Source", vehicle.source_region === "nigeria" ? "Nigeria (locally sourced)" : `Imported — ${vehicle.source_region ?? "—"}`],
                ["VIN Status", vehicle.vin ? "On file" : "Pending"],
              ].map(([label, value]) => (
                <div className="spec-row" key={String(label)}>
                  <span className="spec-label">{label}</span>
                  <span className="spec-value">{String(value)}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "history" && (
            <div>
              <div className="history-item">
                <div className="history-dot" />
                <div>
                  <div className="history-text">
                    {vehicle.source_region === "nigeria"
                      ? "Acquired from the Nigerian market"
                      : `Sourced from ${vehicle.source_detail ?? vehicle.source_region}`}
                  </div>
                  <div className="history-date">
                    {new Date(vehicle.created_at).toLocaleDateString("en-NG", {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
              <div className="history-item">
                <div className="history-dot" />
                <div>
                  <div className="history-text">Current status: {displayStatus(vehicle)}</div>
                </div>
              </div>

              {vehicle.history_report ? (
                <>
                  <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
                    <div className="spec-row">
                      <span className="spec-label">Accident History</span>
                      <span className="spec-value">
                        {vehicle.history_report.has_accident_history
                          ? vehicle.history_report.accident_status === "none"
                            ? "No accident history"
                            : vehicle.history_report.accident_status
                          : "No accident history reported"}
                      </span>
                    </div>
                    <div className="spec-row">
                      <span className="spec-label">Repair Status</span>
                      <span className="spec-value">
                        {vehicle.history_report.repair_status === "not_repaired"
                          ? "Not repaired"
                          : vehicle.history_report.repair_status === "repaired"
                            ? "Repaired"
                            : "Repaired and inspected"}
                      </span>
                    </div>
                    {(vehicle.history_report.front_damage_level !== "none" ||
                      vehicle.history_report.rear_damage_level !== "none" ||
                      vehicle.history_report.left_side_damage_level !== "none" ||
                      vehicle.history_report.right_side_damage_level !== "none") && (
                      <div className="spec-row">
                        <span className="spec-label">Damage Areas</span>
                        <span className="spec-value">
                          {[
                            vehicle.history_report.front_damage_level !== "none" ? `Front: ${vehicle.history_report.front_damage_level}` : null,
                            vehicle.history_report.rear_damage_level !== "none" ? `Rear: ${vehicle.history_report.rear_damage_level}` : null,
                            vehicle.history_report.left_side_damage_level !== "none" ? `Left: ${vehicle.history_report.left_side_damage_level}` : null,
                            vehicle.history_report.right_side_damage_level !== "none" ? `Right: ${vehicle.history_report.right_side_damage_level}` : null,
                          ]
                            .filter(Boolean)
                            .join(" • ")}
                        </span>
                      </div>
                    )}
                    {vehicle.history_report.accident_summary && (
                      <div className="spec-row" style={{ display: "block" }}>
                        <span className="spec-label">Summary</span>
                        <span className="spec-value" style={{ display: "block", marginTop: 4 }}>
                          {vehicle.history_report.accident_summary}
                        </span>
                      </div>
                    )}
                    {vehicle.history_report.inspection_notes && (
                      <div className="spec-row" style={{ display: "block" }}>
                        <span className="spec-label">Inspection Notes</span>
                        <span className="spec-value" style={{ display: "block", marginTop: 4 }}>
                          {vehicle.history_report.inspection_notes}
                        </span>
                      </div>
                    )}
                    {vehicle.history_report.before_after_photo_urls.length > 0 && (
                      <div>
                        <div className="spec-label" style={{ marginBottom: 8 }}>Before / After Evidence</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
                          {vehicle.history_report.before_after_photo_urls.map((photoUrl, index) => (
                            <img
                              key={`${photoUrl}-${index}`}
                              src={photoUrl}
                              alt="Vehicle history evidence"
                              style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12 }}>
                  Full verified history report (accident records, mileage, prior ownership) is
                  shared once you reserve this vehicle.
                </p>
              )}
            </div>
          )}

          {tab === "certification" &&
            (certified && warranty ? (
              <div>
                <div className="cert-badge-row">
                  <span style={{ display: "flex", color: "#16A34A" }}>
                    <CheckCircle2 size={22} strokeWidth={1.75} />
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, color: "#16A34A" }}>DMECH Certified</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Title-verified and inspected by DMECH
                    </div>
                  </div>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Coverage</span>
                  <span className="spec-value" style={{ textTransform: "capitalize" }}>
                    {warranty.coverage_tier}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Duration</span>
                  <span className="spec-value">{warranty.duration_days} days</span>
                </div>
                {warranty.mileage_limit_km && (
                  <div className="spec-row">
                    <span className="spec-label">Mileage Limit</span>
                    <span className="spec-value">{warranty.mileage_limit_km} km</span>
                  </div>
                )}
                <div className="spec-row">
                  <span className="spec-label">Covered</span>
                  <span className="spec-value">
                    {warranty.covered_components.join(", ") || "Engine, transmission, electrical"}
                  </span>
                </div>
                <div className="spec-row">
                  <span className="spec-label">Price</span>
                  <span className="spec-value">
                    {warranty.price_kobo > 0 ? formatNaira(warranty.price_kobo) : "Included free"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="uncert-notice" style={{ display: "flex", gap: 8 }}>
                <TriangleAlert size={16} strokeWidth={2} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>
                  This vehicle has not yet completed DMECH&apos;s certification program — it is
                  sold as-is, with no warranty attached. Full maintenance/service records are
                  still shared where available. Ask us about the certification timeline for this
                  specific vehicle.
                </span>
              </div>
            ))}

          {tab === "financing" && (
            <div>
              <div className="fin-toggle">
                <button
                  className={plan === "dmech_direct" ? "active" : ""}
                  onClick={() => setPlan("dmech_direct")}
                >
                  DMECH Direct
                </button>
                <button
                  className={plan === "partner_finance" ? "active" : ""}
                  onClick={() => setPlan("partner_finance")}
                >
                  Partner Finance (Autochek)
                </button>
              </div>
              {price ? (
                <>
                  <div className="spec-row">
                    <span className="spec-label">Total Price</span>
                    <span className="spec-value">{formatNaira(price)}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Deposit ({deposit}%)</span>
                    <span className="spec-value">{formatNaira(depositAmount)}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Tenor</span>
                    <span className="spec-value">{tenor} months</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Monthly</span>
                    <span className="spec-value">{formatNaira(monthly)}/mo</span>
                  </div>
                  {sold ? (
                    <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12 }}>
                      This figure is illustrative for a sold vehicle. Ask us on WhatsApp for
                      financing terms on a similar vehicle currently available.
                    </p>
                  ) : plan === "partner_finance" ? (
                    <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12 }}>
                      DMECH is a registered Autochek dealer partner — Autochek handles this
                      financing directly.{" "}
                      <a href={AUTOCHEK_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)" }}>
                        Apply via Autochek →
                      </a>
                    </p>
                  ) : (
                    <>
                      <p style={{ fontSize: 12, color: "var(--subtle)", marginTop: 12 }}>
                        Payments can start while a shipped vehicle is still on the water — by
                        arrival, you&apos;re already ahead.
                      </p>
                      <Link
                        href="/register"
                        className="v-card-btn btn-primary"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12, textDecoration: "none" }}
                      >
                        Apply for Financing →
                      </Link>
                    </>
                  )}
                </>
              ) : (
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  Pricing for this vehicle is being finalised — WhatsApp us for a live quote.
                </p>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
            <a
              className="v-card-btn btn-primary"
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              href={whatsappHref(
                sold
                  ? `Hi DMECH, I saw the ${vehicle.year} ${vehicle.make} ${vehicle.model} that already sold — do you have anything similar?`
                  : `Hi DMECH, I'm interested in the ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle size={16} strokeWidth={2} /> {sold ? "Ask About Similar Vehicles" : "Ask on WhatsApp"}
            </a>
          </div>
        </div>
      </div>

      {lightboxOpen && photos.length > 0 && (
        <ImageLightbox
          urls={photos.map((p) => p.url)}
          index={photoIndex}
          alt={`${vehicle.make} ${vehicle.model}`}
          onClose={() => setLightboxOpen(false)}
          onIndexChange={setPhotoIndex}
        />
      )}
    </div>
  );
}
