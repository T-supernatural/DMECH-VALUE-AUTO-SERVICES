"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatNaira } from "@/lib/money";
import { stageBadgeClass, stageLabel } from "@/lib/ops/vehicle-stage";
import type { Vehicle } from "@/types";

type Props = {
  vehicles: Vehicle[];
  channelLabelMap: Record<string, string>;
};

export function VehicleTableActions({ vehicles, channelLabelMap }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((item) => item !== id)));
  };

  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? vehicles.map((vehicle) => vehicle.id) : []);
  };

  const deleteOne = async (id: string) => {
    if (!window.confirm("Delete this vehicle? This will hide it from the list.")) {
      return;
    }

    setBusyId(id);
    const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      alert(payload.error ?? "Could not delete vehicle.");
      setBusyId(null);
      return;
    }

    setSelectedIds((prev) => prev.filter((item) => item !== id));
    router.refresh();
    setBusyId(null);
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected vehicle(s)?`)) {
      return;
    }

    setBulkBusy(true);

    const results = await Promise.all(
      selectedIds.map(async (id) => {
        const response = await fetch(`/api/vehicles/${id}`, { method: "DELETE" });
        return response.ok ? id : null;
      }),
    );

    const deletedCount = results.filter(Boolean).length;
    if (deletedCount !== selectedIds.length) {
      alert("Some vehicles could not be deleted.");
    }

    setSelectedIds([]);
    setBulkBusy(false);
    router.refresh();
  };

  const allSelected = vehicles.length > 0 && selectedIds.length === vehicles.length;

  return (
    <div className="ops-table-wrap">
      {selectedIds.length > 0 && (
        <div className="ops-table-actions-bar">
          <div className="ops-table-actions-left">
            <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600 }}>
              {selectedIds.length} selected
            </span>
          </div>
          <div className="ops-table-actions-right">
            <button
              type="button"
              className="ops-btn-danger"
              onClick={(event) => {
                event.stopPropagation();
                void deleteSelected();
              }}
              disabled={bulkBusy}
            >
              {bulkBusy ? "Deleting..." : `Delete Selected`}
            </button>
            <button
              type="button"
              className="ops-btn-ghost"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedIds([]);
              }}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <table className="ops-table">
        <thead>
          <tr>
            <th className="ops-select-cell">
              <input
                type="checkbox"
                className="ops-select-box"
                checked={allSelected}
                onChange={(event) => toggleAll(event.target.checked)}
                onClick={(event) => event.stopPropagation()}
                aria-label="Select all vehicles"
              />
            </th>
            <th>Vehicle</th>
            <th>Stage</th>
            <th>Channel</th>
            <th>Price</th>
            <th>Certification</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
            <tr
              key={vehicle.id}
              className="ops-row-link"
              onClick={() => router.push(`/ops/vehicles/${vehicle.id}`)}
            >
              <td className="ops-select-cell">
                <input
                  type="checkbox"
                  className="ops-select-box"
                  checked={selectedIds.includes(vehicle.id)}
                  onChange={(event) => toggleOne(vehicle.id, event.target.checked)}
                  onClick={(event) => event.stopPropagation()}
                  aria-label={`Select ${vehicle.make} ${vehicle.model}`}
                />
              </td>
              <td>
                {vehicle.make} {vehicle.model} {vehicle.year}
              </td>
              <td>
                <span className={`ops-badge ${stageBadgeClass(vehicle.lifecycle_stage)}`}>
                  {stageLabel(vehicle.lifecycle_stage)}
                </span>
              </td>
              <td>{channelLabelMap[vehicle.acquisition_channel] ?? vehicle.acquisition_channel}</td>
              <td>{vehicle.sale_price_kobo ? formatNaira(vehicle.sale_price_kobo) : "—"}</td>
              <td>
                {vehicle.certification_status === "certified" ? (
                  <span className="ops-badge ops-badge-green">Certified</span>
                ) : (
                  <span style={{ color: "var(--subtle)", fontSize: 12 }}>
                    {vehicle.certification_status === "pending_inspection" ? "Pending" : "Uncertified"}
                  </span>
                )}
              </td>
              <td>
                <div className="ops-row-actions" onClick={(event) => event.stopPropagation()}>
                  <Link
                    href={`/ops/vehicles/${vehicle.id}`}
                    className="ops-btn-ghost"
                    style={{ textDecoration: "none" }}
                    onClick={(event) => event.stopPropagation()}
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="ops-btn-danger"
                    disabled={busyId === vehicle.id || bulkBusy}
                    onClick={(event) => {
                      event.stopPropagation();
                      void deleteOne(vehicle.id);
                    }}
                  >
                    {busyId === vehicle.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
