"use client";

import { useEffect, useRef } from "react";
import { X, Car, CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/lib/money";
import { isCertified, displayStatus, publicPhotos, conditionLabel, type PublicVehicle } from "@/lib/vehicle-display";

interface Props {
  vehicles: PublicVehicle[];
  onClose: () => void;
  onRemove: (id: string) => void;
}

const ROWS: { label: string; render: (v: PublicVehicle) => React.ReactNode }[] = [
  { label: "Price", render: (v) => (v.sale_price_kobo ? formatNaira(v.sale_price_kobo) : "Price on request") },
  { label: "Status", render: (v) => displayStatus(v) },
  { label: "Colour", render: (v) => v.colour ?? "—" },
  {
    label: "Fuel / Range",
    render: (v) => (v.fuel_type === "electric" ? `${v.battery_range_km ?? "—"} km range` : `${v.engine_cc ?? "—"}cc — ${v.fuel_type ?? "—"}`),
  },
  { label: "Source", render: (v) => (v.source_region === "nigeria" ? "Nigerian-used" : (v.source_detail ?? v.source_region ?? "—")) },
  { label: "Condition", render: (v) => conditionLabel(v) },
  {
    label: "Certified",
    render: (v) =>
      isCertified(v) ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "var(--green)" }}>
          <CheckCircle2 size={14} strokeWidth={2} /> Yes
        </span>
      ) : (
        "No"
      ),
  },
];

// Genuinely new interactive feature (not just polish): pick 2-3 vehicles
// from VehicleMarketplace's existing in-memory list and compare them side
// by side. No new data fetching -- everything here already exists in the
// `vehicles` prop passed down from the server component.
export function VehicleCompareModal({ vehicles, onClose, onRemove }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 920 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close" ref={closeRef}>
          <X size={16} strokeWidth={2} />
        </button>
        <div style={{ padding: 24, overflowX: "auto" }}>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, marginBottom: 18 }}>
            Compare Vehicles
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `140px repeat(${vehicles.length}, minmax(180px, 1fr))`,
              minWidth: 140 + vehicles.length * 180,
            }}
          >
            <div />
            {vehicles.map((v) => {
              const photo = publicPhotos(v)[0]?.url;
              return (
                <div key={v.id} style={{ padding: "0 8px 12px", textAlign: "center" }}>
                  <div
                    style={{
                      height: 90,
                      borderRadius: 10,
                      background: photo ? `url(${photo}) center/cover` : "linear-gradient(135deg,#F1F5F9,#E8EEF4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--subtle)",
                      marginBottom: 8,
                      position: "relative",
                    }}
                  >
                    {!photo && <Car size={28} strokeWidth={1.5} />}
                    <button
                      onClick={() => onRemove(v.id)}
                      aria-label={`Remove ${v.make} ${v.model} from comparison`}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "rgba(0,0,0,.5)",
                        color: "#fff",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                      }}
                    >
                      <X size={12} strokeWidth={2.5} />
                    </button>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {v.make} {v.model}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{v.year}</div>
                </div>
              );
            })}

            {ROWS.map((row) => (
              <div key={row.label} style={{ display: "contents" }}>
                <div
                  style={{
                    padding: "10px 8px",
                    borderTop: "1px solid var(--border)",
                    fontSize: 12,
                    color: "var(--muted)",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {row.label}
                </div>
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    style={{
                      padding: "10px 8px",
                      borderTop: "1px solid var(--border)",
                      fontSize: 13,
                      textAlign: "center",
                    }}
                  >
                    {row.render(v)}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
