"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { FinancingConfig, FinancingTenor } from "@/lib/financing-config";

type Status = "idle" | "saving" | "saved" | "error";

export function FinancingSettingsForm({ initialConfig }: { initialConfig: FinancingConfig }) {
  const router = useRouter();
  const [depositPct, setDepositPct] = useState(String(initialConfig.defaultDepositPct));
  const [defaultTenor, setDefaultTenor] = useState(String(initialConfig.defaultTenorMonths));
  const [tenors, setTenors] = useState<FinancingTenor[]>(initialConfig.tenors);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  function updateTenor(index: number, field: keyof FinancingTenor, value: string) {
    setTenors((current) => current.map((tenor, i) => i === index ? { ...tenor, [field]: Number(value) } : tenor));
  }

  function addTenor() {
    const nextMonths = Math.max(...tenors.map((tenor) => tenor.months), 0) + 3;
    setTenors((current) => [...current, { months: nextMonths, interestPct: 0 }]);
  }

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/settings/financing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultDepositPct: Number(depositPct), defaultTenorMonths: Number(defaultTenor), tenors }),
      });
      const json = await res.json().catch(() => null) as { error?: string } | null;
      if (!res.ok) {
        setError(json?.error ?? "Could not save financing settings.");
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Could not save financing settings.");
      setStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="ops-panel">
        <div className="ops-panel-title">Financing Defaults</div>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
          These settings control the financing figures shown for every vehicle on the marketing site.
        </p>
        <label className="ops-field-label" htmlFor="finance-deposit">Default Deposit (%)</label>
        <input id="finance-deposit" className="ops-input" type="number" min="1" max="99" step="0.01" value={depositPct} onChange={(e) => setDepositPct(e.target.value)} />
        <label className="ops-field-label" htmlFor="finance-default-tenor">Default Tenor</label>
        <select id="finance-default-tenor" className="ops-input" value={defaultTenor} onChange={(e) => setDefaultTenor(e.target.value)}>
          {tenors.map((tenor) => <option key={tenor.months} value={tenor.months}>{tenor.months} months</option>)}
        </select>
      </div>

      <div className="ops-panel">
        <div className="ops-panel-title">Available Tenors &amp; Interest</div>
        <div style={{ display: "grid", gap: 10 }}>
          {tenors.map((tenor, index) => (
            <div key={`${tenor.months}-${index}`} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 10, alignItems: "end" }}>
              <div>
                <label className="ops-field-label" htmlFor={`finance-months-${index}`}>Tenor (months)</label>
                <input id={`finance-months-${index}`} className="ops-input" type="number" min="1" step="1" value={tenor.months} onChange={(e) => updateTenor(index, "months", e.target.value)} />
              </div>
              <div>
                <label className="ops-field-label" htmlFor={`finance-interest-${index}`}>Interest (%)</label>
                <input id={`finance-interest-${index}`} className="ops-input" type="number" min="0" max="100" step="0.01" value={tenor.interestPct} onChange={(e) => updateTenor(index, "interestPct", e.target.value)} />
              </div>
              <button type="button" className="ops-btn ops-btn-ghost" onClick={() => setTenors((current) => current.filter((_, i) => i !== index))} disabled={tenors.length === 1} aria-label={`Remove ${tenor.months}-month tenor`}>Remove</button>
            </div>
          ))}
        </div>
        <button type="button" className="ops-btn ops-btn-ghost" style={{ marginTop: 14 }} onClick={addTenor}>Add Tenor</button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="ops-btn" onClick={save} disabled={status === "saving"}>{status === "saving" ? "Saving..." : "Save Financing Settings"}</button>
        {status === "saved" && <span style={{ color: "var(--green)", fontSize: 12 }}>Saved</span>}
        {status === "error" && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
      </div>
    </div>
  );
}
