"use client";

import { useState } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/money";
import {
  isCertified,
  displayStatus,
  publicPhotos,
  conditionCategory,
  type PublicVehicle,
  type PublicDisplayStatus,
} from "@/lib/vehicle-display";
import { Zap, CheckCircle2, Car, X, Scale, type LucideIcon } from "lucide-react";
import { VehicleDetailModal } from "@/components/marketing/VehicleDetailModal";
import { VehicleCompareModal } from "@/components/marketing/VehicleCompareModal";
import { VehicleStampOverlay } from "@/components/marketing/VehicleStampOverlay";
import { Reveal } from "@/components/marketing/Reveal";
import { USE_CATEGORY_LABELS, type VehicleUseCategory } from "@/types";
import type { FinancingConfig } from "@/lib/financing-config";

const MAX_COMPARE = 3;

type Filter =
  | "all"
  | "available"
  | "in-transit"
  | "sourced"
  | "reserved"
  | "at-port"
  | "foreign-used"
  | "nigerian-used"
  | "ev"
  | "certified"
  | VehicleUseCategory;

// Filter state is keyed on the plain lowercase `key` (also used for the
// ?filter= deep link, e.g. from the Home page's EV teaser or the Shop By Use
// section) — the icon and label are display-only, kept separate from the key.
// Use-case categories (Corporate/Family/...) are deliberately NOT rendered as
// buttons here — they already have a dedicated, better-designed entry point
// (the Shop By Use cards on Home). A category arriving via ?filter= still
// works; it's surfaced as a single "Showing: X" indicator below instead of
// five more permanent pills competing with these for space.
const FILTERS: { key: Filter; label: string; icon?: LucideIcon }[] = [
  { key: "all", label: "All" },
  { key: "available", label: "Available" },
  { key: "in-transit", label: "In Transit" },
  { key: "sourced", label: "Sourced" },
  { key: "reserved", label: "Reserved" },
  { key: "at-port", label: "At Port" },
  { key: "foreign-used", label: "Foreign Used" },
  { key: "nigerian-used", label: "Nigerian Used" },
  { key: "ev", label: "EVs", icon: Zap },
  { key: "certified", label: "Certified Nigerian-Used", icon: CheckCircle2 },
];

const FILTER_DESCRIPTIONS: Record<Filter, string> = {
  all: "Browse the full DMECH stock and imported inventory.",
  available: "Available here in Nigeria and ready to buy now.",
  "in-transit": "On its way from importation and not yet in Nigeria.",
  sourced: "Available overseas in the USA, Europe, or China, but not yet paid for by DMECH.",
  reserved: "Already paid for by DMECH and now reserved for the next customer to complete purchase.",
  "at-port": "Already here in Nigeria at port/customs and ready for clearance.",
  "foreign-used": "Foreign used vehicles, also called Tokunbo, imported from overseas.",
  "nigerian-used": "Nigerian used vehicles that have already been in the local market.",
  ev: "Electric vehicles with lower-duty and EV-specific sourcing advantages.",
  certified: "Nigerian used vehicles that are fully certified and backed by a DMECH inspection and warranty.",
  corporate: "Executive vehicles and business-use cars for corporate buyers.",
  family: "Family-friendly cars, SUVs, and people carriers for everyday life.",
  construction: "Rugged work vehicles built for job sites and heavy use.",
  catering: "Practical vans and vehicles for food services and hospitality operations.",
  logistics: "Vehicles built for haulage and commercial delivery operations.",
  fleet: "Fleet and multi-vehicle sourcing for managed operations and company transport.",
  luxury: "Premium and prestige vehicles for discerning buyers.",
};

// Superset used only for validating a ?filter= deep link — includes the use
// categories even though they don't get their own button (see above).
const ALL_FILTER_KEYS = new Set<Filter>([...FILTERS.map((f) => f.key), ...(Object.keys(USE_CATEGORY_LABELS) as VehicleUseCategory[])]);

const STATUS_CLASS: Record<PublicDisplayStatus, string> = {
  Available: "status-available",
  Sourced: "status-available",
  Reserved: "status-available",
  "In Transit": "status-transit",
  "At Port": "status-port",
  Sold: "status-sold",
};

interface Props {
  vehicles: PublicVehicle[];
  financingConfig: FinancingConfig;
  initialFilterKey?: string;
}

export function VehicleMarketplace({
  vehicles,
  financingConfig,
  initialFilterKey,
}: Props) {
  const isValidFilter = (k: string): k is Filter => ALL_FILTER_KEYS.has(k as Filter);
  const [filter, setFilter] = useState<Filter>(
    (initialFilterKey && isValidFilter(initialFilterKey) && initialFilterKey) || "all",
  );
  const [selected, setSelected] = useState<PublicVehicle | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const activeUseCategory = filter in USE_CATEGORY_LABELS ? (filter as VehicleUseCategory) : null;

  function toggleCompare(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARE) return prev;
      const next = [...prev, id];
      if (next.length >= 2) setCompareOpen(true);
      return next;
    });
  }

  const compareVehicles = vehicles.filter((v) => compareIds.includes(v.id));

  const filtered = vehicles.filter((v) => {
    if (filter === "all") return true;
    if (filter === "ev") return v.fuel_type === "electric";
    if (filter === "certified") return isCertified(v);
    if (filter === "foreign-used") return conditionCategory(v) === "foreign_used";
    if (filter === "nigerian-used") return conditionCategory(v) === "nigerian_used";
    if (filter === "sourced") return v.lifecycle_stage === "sourced" || v.lifecycle_stage === "purchased";
    if (filter === "reserved") return v.lifecycle_stage === "reserved";
    if (filter in USE_CATEGORY_LABELS) return v.use_categories.includes(filter as VehicleUseCategory);
    const statusKey = displayStatus(v).toLowerCase().replace(" ", "-");
    return statusKey === filter;
  });

  const activeFilterLabel =
    (filter in USE_CATEGORY_LABELS ? USE_CATEGORY_LABELS[filter as VehicleUseCategory] : FILTERS.find((item) => item.key === filter)?.label) ?? "Vehicles";

  const activeFilterDescription = FILTER_DESCRIPTIONS[filter as Filter] ?? "Browse the full DMECH stock and imported inventory.";

  return (
    <section className="section" id="vehicles" style={{ background: "#fff" }}>
      <div className="section-inner">
        <div className="section-eyebrow">Vehicle Marketplace</div>
        <div className="section-title">Available Now &amp; In Transit</div>
        <div className="section-subtitle">
          Verified vehicles with full history reports. Every car comes with DMECH documentation
          and inspection guarantee.
        </div>

        {activeUseCategory && (
          <button
            type="button"
            onClick={() => setFilter("all")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--blue)",
              color: "#fff",
              border: "none",
              borderRadius: 20,
              padding: "8px 14px",
              marginBottom: 14,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Showing: {USE_CATEGORY_LABELS[activeUseCategory]} vehicles
            <X size={14} strokeWidth={2.5} />
          </button>
        )}

        <div className="vehicle-filters">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`vf-btn ${filter === f.key ? "active" : ""}`}
              onClick={() => setFilter(f.key)}
              style={f.icon ? { display: "inline-flex", alignItems: "center", gap: 6 } : undefined}
            >
              {f.icon && <f.icon size={14} strokeWidth={2} />}
              {f.label}
            </button>
          ))}
        </div>

        {filter !== "all" && (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 14px",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 10,
              color: "var(--muted)",
              fontSize: 13,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: "var(--dark)" }}>{activeFilterLabel}:</strong> {activeFilterDescription}
          </div>
        )}

        {vehicles.length === 0 ? (
          <div className="vehicle-empty">
            <div style={{ display: "flex", justifyContent: "center", color: "var(--subtle)", marginBottom: 12 }}>
              <Car size={32} strokeWidth={1.5} />
            </div>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>New inventory added regularly</div>
            <div style={{ fontSize: 14, marginBottom: 16 }}>
              We&apos;re currently onboarding our first verified vehicles, including our DMECH
              Certified Nigerian-used program. WhatsApp us for current stock and to be notified
              the moment new vehicles go live.
            </div>
            <Link href="/vehicles/request?from=vehicles_empty" className="v-card-btn btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
              Tell Us What You&apos;re Looking For →
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="vehicle-empty">
            <div style={{ marginBottom: 16 }}>No vehicles match this filter right now — check back soon.</div>
            <Link href="/vehicles/request?from=vehicles_empty" className="v-card-btn btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
              Tell Us What You&apos;re Looking For →
            </Link>
          </div>
        ) : (
          <div className="vehicle-grid">
            {filtered.map((v, i) => {
              const status = displayStatus(v);
              const certified = isCertified(v);
              const heroPhoto = publicPhotos(v)[0]?.url;
              return (
                <Reveal key={v.id} delayMs={Math.min(i * 40, 400)}>
                <div className={`v-card${status === "Sold" ? " is-sold" : ""}`} onClick={() => setSelected(v)}>
                  <div
                    className="v-card-img"
                    style={
                      heroPhoto
                        ? { backgroundImage: `url(${heroPhoto})`, backgroundSize: "cover", backgroundPosition: "center" }
                        : undefined
                    }
                  >
                    {!heroPhoto &&
                      (v.fuel_type === "electric" ? (
                        <Zap size={56} strokeWidth={1.25} />
                      ) : (
                        <Car size={56} strokeWidth={1.25} />
                      ))}
                    <VehicleStampOverlay vehicle={v} />
                    <div className={`v-card-status ${STATUS_CLASS[status]}`}>{status}</div>
                    {certified && (
                      <div className="v-card-cert" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <CheckCircle2 size={13} strokeWidth={2} /> Certified
                      </div>
                    )}
                    {status !== "Sold" && (
                      <button
                        onClick={(e) => toggleCompare(e, v.id)}
                        aria-pressed={compareIds.includes(v.id)}
                        title={compareIds.includes(v.id) ? "Remove from comparison" : "Add to comparison"}
                        style={{
                          position: "absolute",
                          bottom: 10,
                          right: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "5px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          border: "1px solid rgba(255,255,255,.5)",
                          cursor: "pointer",
                          background: compareIds.includes(v.id) ? "var(--blue)" : "rgba(15,25,35,.55)",
                          color: "#fff",
                        }}
                      >
                        <Scale size={12} strokeWidth={2} />
                          {compareIds.includes(v.id) ? "Selected" : "Compare"}
                      </button>
                    )}
                  </div>
                  <div className="v-card-body">
                    <div className="v-card-name">
                      {v.make} {v.model} {v.year}
                    </div>
                    <div className="v-card-meta">
                      {v.colour} · {v.fuel_type === "electric" ? `${v.battery_range_km ?? "—"} km range` : `${v.engine_cc ?? "—"}cc`} ·{" "}
                      {v.source_region === "nigeria" ? "Nigerian-used" : v.source_detail ?? v.source_region}
                    </div>
                    <div className="v-card-price-row">
                      <div className="v-card-price">
                        {v.sale_price_kobo ? formatNaira(v.sale_price_kobo) : "Price on request"}
                      </div>
                      <div className="v-card-source">
                        {status === "Available" ? "Ready to drive" : status}
                      </div>
                    </div>
                    {v.sale_price_kobo && status !== "Sold" && (
                      <div className="v-card-install">
                        From{" "}
                        <strong>
                          {formatNaira((v.sale_price_kobo * 0.6) / 6)}/month
                        </strong>{" "}
                        with {formatNaira(v.sale_price_kobo * 0.4)} deposit (6 months)
                      </div>
                    )}
                    <div className="v-card-actions">
                      {status === "Sold" ? (
                        <button className="v-card-btn btn-outline" disabled style={{ cursor: "default", opacity: 0.7 }}>
                          Sold
                        </button>
                      ) : (
                        <button className="v-card-btn btn-primary">
                          {status === "Available" ? "Reserve Now" : "Notify on Arrival"}
                        </button>
                      )}
                      <button className="v-card-btn btn-outline">Details</button>
                    </div>
                  </div>
                </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <VehicleDetailModal
          vehicle={selected}
          onClose={() => setSelected(null)}
          financingConfig={financingConfig}
        />
      )}

      {compareIds.length >= 1 && !compareOpen && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 150,
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--dark)",
            color: "#fff",
            borderRadius: 40,
            padding: "10px 10px 10px 20px",
            boxShadow: "0 12px 32px rgba(0,0,0,.25)",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {compareIds.length} vehicle{compareIds.length > 1 ? "s" : ""} selected
          </span>
          <button
            onClick={() => setCompareIds([])}
            style={{ background: "none", border: "none", color: "#8BADC0", fontSize: 12, cursor: "pointer" }}
          >
            Clear
          </button>
          <button
            onClick={() => setCompareOpen(true)}
            className="v-card-btn btn-primary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, borderRadius: 30, padding: "8px 16px", opacity: compareIds.length < 2 ? 0.6 : 1 }}
            disabled={compareIds.length < 2}
            aria-disabled={compareIds.length < 2}
          >
            {compareIds.length < 2 ? `Select ${2 - compareIds.length} more to compare` : "Compare"} <Scale size={14} strokeWidth={2} />
          </button>
        </div>
      )}

      {compareOpen && compareVehicles.length >= 2 && (
        <VehicleCompareModal
          vehicles={compareVehicles}
          onClose={() => setCompareOpen(false)}
          onRemove={(id) =>
            setCompareIds((prev) => {
              const next = prev.filter((x) => x !== id);
              if (next.length < 2) setCompareOpen(false);
              return next;
            })
          }
        />
      )}
    </section>
  );
}
