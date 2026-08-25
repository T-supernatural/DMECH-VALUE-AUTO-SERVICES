import type { VehicleDisplayStamp } from "@/types";
import { displayStamps, type PublicVehicle } from "@/lib/vehicle-display";

const STAMP_LABELS: Record<VehicleDisplayStamp, string> = {
  verified: "Verified",
  sold: "Sold",
  reserved: "Reserved",
  inspected: "Inspected",
  delivered: "Delivered",
};

export function VehicleStampOverlay({ vehicle }: { vehicle: PublicVehicle }) {
  const stamps = displayStamps(vehicle);

  if (stamps.length === 0) return null;

  return (
    <div className="vehicle-stamps-overlay" aria-label={stamps.map((stamp) => STAMP_LABELS[stamp]).join(", ")}>
      {stamps.map((stamp) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={stamp}
          src={`/vehicle-stamps/${stamp}.png`}
          alt={STAMP_LABELS[stamp]}
          className="vehicle-stamp"
        />
      ))}
    </div>
  );
}
