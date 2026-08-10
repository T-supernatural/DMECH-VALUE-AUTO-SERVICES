"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dollarsToUsdCents, usdCentsToDollars } from "@/lib/money";
import { SOURCING_PLATFORM_LABELS, TITLE_STATUS_LABELS } from "@/types";
import type { SourcingListing, SourcingPlatform, TitleStatus, FuelType } from "@/types";

type Status = "idle" | "saving" | "saved" | "error";

export function SourcingListingForm({ listing }: { listing?: SourcingListing }) {
  const router = useRouter();
  const isEdit = Boolean(listing);

  const [sourcePlatform, setSourcePlatform] = useState<SourcingPlatform>(listing?.source_platform ?? "copart");
  const [make, setMake] = useState(listing?.make ?? "");
  const [model, setModel] = useState(listing?.model ?? "");
  const [year, setYear] = useState(String(listing?.year ?? ""));
  const [trim, setTrim] = useState(listing?.trim ?? "");
  const [vin, setVin] = useState(listing?.vin ?? "");
  const [lotNumber, setLotNumber] = useState(listing?.lot_number ?? "");
  const [titleStatus, setTitleStatus] = useState<TitleStatus | "">(listing?.title_status ?? "");
  const [primaryDamage, setPrimaryDamage] = useState(listing?.primary_damage ?? "");
  const [secondaryDamage, setSecondaryDamage] = useState(listing?.secondary_damage ?? "");
  const [odometerKm, setOdometerKm] = useState(listing?.odometer_km ? String(listing.odometer_km) : "");
  const [runAndDrive, setRunAndDrive] = useState(listing?.run_and_drive ?? true);
  const [fuelType, setFuelType] = useState<FuelType | "">(listing?.fuel_type ?? "petrol");
  const [conditionNotes, setConditionNotes] = useState(listing?.condition_notes ?? "");
  const [locationCountry, setLocationCountry] = useState(listing?.location_country ?? "");
  const [locationCity, setLocationCity] = useState(listing?.location_city ?? "");
  const [auctionDate, setAuctionDate] = useState(listing?.auction_date ?? "");
  const [estimatedPriceUsd, setEstimatedPriceUsd] = useState(
    listing ? String(usdCentsToDollars(listing.estimated_price_usd_cents)) : "",
  );
  const [estimatedShippingUsd, setEstimatedShippingUsd] = useState(
    listing?.estimated_shipping_usd_cents ? String(usdCentsToDollars(listing.estimated_shipping_usd_cents)) : "",
  );
  const [photoUrls, setPhotoUrls] = useState(
    listing?.photos.map((p) => p.url).join("\n") ?? "",
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setStatus("saving");
    setError(null);
    const payload = {
      source_platform: sourcePlatform,
      make,
      model,
      year: parseInt(year, 10),
      trim: trim || null,
      vin: vin || null,
      lot_number: lotNumber || null,
      title_status: titleStatus || null,
      primary_damage: primaryDamage || null,
      secondary_damage: secondaryDamage || null,
      odometer_km: odometerKm ? parseInt(odometerKm, 10) : null,
      run_and_drive: runAndDrive,
      fuel_type: fuelType || null,
      condition_notes: conditionNotes || null,
      location_country: locationCountry,
      location_city: locationCity || null,
      auction_date: auctionDate || null,
      estimated_price_usd_cents: dollarsToUsdCents(parseFloat(estimatedPriceUsd) || 0),
      estimated_shipping_usd_cents: estimatedShippingUsd ? dollarsToUsdCents(parseFloat(estimatedShippingUsd)) : null,
      photos: photoUrls.split("\n").map((u) => u.trim()).filter(Boolean),
    };

    try {
      const res = await fetch(isEdit ? `/api/sourcing-listings/${listing!.id}` : "/api/sourcing-listings", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setStatus("saved");
      if (!isEdit) {
        router.push(`/ops/sourcing/${json.listing.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="ops-panel">
        <div className="ops-panel-title">Vehicle</div>
        <div className="ops-form-grid">
          <div>
            <label className="ops-field-label" htmlFor="sl-source">Source</label>
            <select id="sl-source" className="ops-input" value={sourcePlatform} onChange={(e) => setSourcePlatform(e.target.value as SourcingPlatform)}>
              {Object.entries(SOURCING_PLATFORM_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-lot">Lot Number</label>
            <input id="sl-lot" className="ops-input" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-make">Make</label>
            <input id="sl-make" className="ops-input" value={make} onChange={(e) => setMake(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-model">Model</label>
            <input id="sl-model" className="ops-input" value={model} onChange={(e) => setModel(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-year">Year</label>
            <input id="sl-year" className="ops-input" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-trim">Trim (optional)</label>
            <input id="sl-trim" className="ops-input" value={trim} onChange={(e) => setTrim(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-vin">VIN (optional)</label>
            <input id="sl-vin" className="ops-input" value={vin} onChange={(e) => setVin(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-fuel">Fuel Type</label>
            <select id="sl-fuel" className="ops-input" value={fuelType} onChange={(e) => setFuelType(e.target.value as FuelType)}>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
        </div>
      </div>

      <div className="ops-panel">
        <div className="ops-panel-title">Auction Condition</div>
        <div className="ops-form-grid">
          <div>
            <label className="ops-field-label" htmlFor="sl-title-status">Title Status</label>
            <select id="sl-title-status" className="ops-input" value={titleStatus} onChange={(e) => setTitleStatus(e.target.value as TitleStatus)}>
              <option value="">— Not specified —</option>
              {Object.entries(TITLE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-odometer">Odometer (km)</label>
            <input id="sl-odometer" className="ops-input" type="number" value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-primary-damage">Primary Damage</label>
            <input id="sl-primary-damage" className="ops-input" value={primaryDamage} onChange={(e) => setPrimaryDamage(e.target.value)} placeholder="e.g. Front End" />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-secondary-damage">Secondary Damage (optional)</label>
            <input id="sl-secondary-damage" className="ops-input" value={secondaryDamage} onChange={(e) => setSecondaryDamage(e.target.value)} />
          </div>
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, fontSize: 13, color: "var(--text)" }}>
          <input type="checkbox" checked={runAndDrive} onChange={(e) => setRunAndDrive(e.target.checked)} />
          Run &amp; Drive
        </label>
        <label className="ops-field-label" htmlFor="sl-condition-notes">Condition Notes</label>
        <textarea id="sl-condition-notes" className="ops-input" rows={2} value={conditionNotes} onChange={(e) => setConditionNotes(e.target.value)} />
      </div>

      <div className="ops-panel">
        <div className="ops-panel-title">Location &amp; Pricing</div>
        <div className="ops-form-grid">
          <div>
            <label className="ops-field-label" htmlFor="sl-country">Country</label>
            <input id="sl-country" className="ops-input" value={locationCountry} onChange={(e) => setLocationCountry(e.target.value)} placeholder="USA" />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-city">City / Yard (optional)</label>
            <input id="sl-city" className="ops-input" value={locationCity} onChange={(e) => setLocationCity(e.target.value)} placeholder="Newark, NJ" />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-auction-date">Auction Date (optional)</label>
            <input id="sl-auction-date" className="ops-input" type="date" value={auctionDate} onChange={(e) => setAuctionDate(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-price">Estimated Price (USD)</label>
            <input id="sl-price" className="ops-input" type="number" value={estimatedPriceUsd} onChange={(e) => setEstimatedPriceUsd(e.target.value)} />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="sl-shipping">Estimated Shipping (USD, optional)</label>
            <input id="sl-shipping" className="ops-input" type="number" value={estimatedShippingUsd} onChange={(e) => setEstimatedShippingUsd(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="ops-panel">
        <div className="ops-panel-title">Photos</div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}>
          One image URL per line — paste links to photos saved from the auction listing.
        </p>
        <textarea
          className="ops-input"
          rows={4}
          value={photoUrls}
          onChange={(e) => setPhotoUrls(e.target.value)}
          placeholder={"https://...\nhttps://..."}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="ops-btn" onClick={save} disabled={status === "saving" || !make || !model || !year || !locationCountry || !estimatedPriceUsd}>
          {status === "saving" ? "Saving..." : isEdit ? "Save Changes" : "Add Listing"}
        </button>
        {status === "saved" && <span style={{ color: "var(--green)", fontSize: 12 }}>Saved</span>}
        {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
      </div>
    </div>
  );
}
