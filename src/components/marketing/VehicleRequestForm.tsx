"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { VEHICLE_REQUEST_TIMELINE_LABELS } from "@/types";
import type { VehicleRequestSource, VehicleRequestTimeline } from "@/types";

const REGIONS = [
  { value: "", label: "No preference" },
  { value: "usa", label: "USA" },
  { value: "europe", label: "Europe" },
  { value: "china", label: "China" },
  { value: "nigeria", label: "Nigerian-used" },
];

const CONDITIONS = [
  { value: "", label: "No preference" },
  { value: "used", label: "Used" },
  { value: "new", label: "Brand New" },
];

const FUEL_TYPES = [
  { value: "", label: "No preference" },
  { value: "petrol", label: "Petrol" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
];

export function VehicleRequestForm({ source }: { source: VehicleRequestSource }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [yearMin, setYearMin] = useState("");
  const [yearMax, setYearMax] = useState("");
  const [budgetMaxNaira, setBudgetMaxNaira] = useState("");
  const [fuelType, setFuelType] = useState("");
  const [regionPreference, setRegionPreference] = useState("");
  const [conditionPreference, setConditionPreference] = useState("");
  const [timeline, setTimeline] = useState<VehicleRequestTimeline>("within_1_month");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");

  async function submit() {
    if (!fullName.trim() || phone.trim().length < 10) {
      alert("Please enter your name and a valid phone number");
      return;
    }
    setStatus("submitting");
    try {
      const res = await fetch("/api/vehicle-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          email: email || null,
          make: make || null,
          model: model || null,
          year_min: yearMin ? parseInt(yearMin, 10) : null,
          year_max: yearMax ? parseInt(yearMax, 10) : null,
          budget_max_naira: budgetMaxNaira ? parseFloat(budgetMaxNaira) : null,
          fuel_type: fuelType || null,
          source_region_preference: regionPreference || null,
          condition_preference: conditionPreference || null,
          timeline,
          notes: notes || null,
          source,
        }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="booking-card" style={{ textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", color: "var(--green)", marginBottom: 12 }}>
          <CheckCircle2 size={40} strokeWidth={1.5} />
        </div>
        <div style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
          Request Received
        </div>
        <p style={{ color: "var(--muted)" }}>
          Thank you, {fullName}. A DMECH team member will reach out on WhatsApp or by phone once
          we&apos;ve found something matching what you&apos;re after.
        </p>
      </div>
    );
  }

  return (
    <div className="booking-card">
      <div style={{ fontWeight: 700, marginBottom: 16 }}>What Are You Looking For?</div>

      <label className="field-label" htmlFor="vr-make">Make (optional)</label>
      <input id="vr-make" className="field-input" placeholder="e.g. Toyota" value={make} onChange={(e) => setMake(e.target.value)} />

      <label className="field-label" htmlFor="vr-model">Model (optional)</label>
      <input id="vr-model" className="field-input" placeholder="e.g. Highlander" value={model} onChange={(e) => setModel(e.target.value)} />

      <div className="svc-datetime-row">
        <div>
          <label className="field-label" htmlFor="vr-year-min">Year From (optional)</label>
          <input id="vr-year-min" className="field-input" type="number" placeholder="e.g. 2018" value={yearMin} onChange={(e) => setYearMin(e.target.value)} />
        </div>
        <div>
          <label className="field-label" htmlFor="vr-year-max">Year To (optional)</label>
          <input id="vr-year-max" className="field-input" type="number" placeholder="e.g. 2023" value={yearMax} onChange={(e) => setYearMax(e.target.value)} />
        </div>
      </div>

      <label className="field-label" htmlFor="vr-budget">Maximum Budget in Naira (optional)</label>
      <input id="vr-budget" className="field-input" type="number" placeholder="e.g. 15000000" value={budgetMaxNaira} onChange={(e) => setBudgetMaxNaira(e.target.value)} />

      <label className="field-label" htmlFor="vr-fuel">Fuel Type</label>
      <select id="vr-fuel" className="field-input" value={fuelType} onChange={(e) => setFuelType(e.target.value)}>
        {FUEL_TYPES.map((f) => (
          <option key={f.value} value={f.value}>{f.label}</option>
        ))}
      </select>

      <label className="field-label" htmlFor="vr-region">Source Preference</label>
      <select id="vr-region" className="field-input" value={regionPreference} onChange={(e) => setRegionPreference(e.target.value)}>
        {REGIONS.map((r) => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <label className="field-label" htmlFor="vr-condition">Condition</label>
      <select id="vr-condition" className="field-input" value={conditionPreference} onChange={(e) => setConditionPreference(e.target.value)}>
        {CONDITIONS.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <label className="field-label">How Soon Do You Need It?</label>
      <div className="chip-row" style={{ marginBottom: 16 }}>
        {(Object.keys(VEHICLE_REQUEST_TIMELINE_LABELS) as VehicleRequestTimeline[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`chip ${timeline === t ? "active" : ""}`}
            onClick={() => setTimeline(t)}
          >
            {VEHICLE_REQUEST_TIMELINE_LABELS[t]}
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="vr-notes">Anything Else? (optional)</label>
      <textarea
        id="vr-notes"
        className="field-input"
        rows={3}
        style={{ resize: "none" }}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Trim, colour, must-haves, anything that helps us find the right one..."
      />

      <div style={{ fontWeight: 700, margin: "20px 0 16px" }}>Your Contact Details</div>
      <label className="field-label" htmlFor="vr-name">Your Name</label>
      <input id="vr-name" className="field-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <label className="field-label" htmlFor="vr-phone">WhatsApp Phone Number</label>
      <input id="vr-phone" className="field-input" type="tel" placeholder="e.g. 0803 456 7890" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <label className="field-label" htmlFor="vr-email">Email (optional)</label>
      <input id="vr-email" className="field-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <button className="v-card-btn btn-primary" style={{ width: "100%", marginTop: 8 }} onClick={submit} disabled={status === "submitting"}>
        {status === "submitting" ? "Submitting..." : "Send My Request"}
      </button>
      {status === "error" && (
        <p style={{ color: "var(--red)", fontSize: 12, marginTop: 8 }}>
          Something went wrong — please try again or WhatsApp us directly.
        </p>
      )}
    </div>
  );
}
