import { NextResponse } from "next/server";
import { getConfigValue } from "@/lib/platform-config";

const FALLBACK = [
  { text: "New: Certified Nigerian-used vehicles now available", orange: false },
  { text: "3 Vehicles Cleared Customs This Week", orange: true },
  { text: "🇨🇳 Now Importing from China — New Cars & EVs", orange: false },
  { text: "Import Duties Reduced — Save More in 2026", orange: true },
  { text: "EVs: 10% Duty, Zero Green Tax — Ask Us How", orange: false },
  { text: "Chery Tiggo 7 Pro 2024 — Brand New In Stock", orange: true },
  { text: "Financing Available — Pay While Shipping", orange: false },
  { text: "DMECH Certified — Verified History, Real Warranty", orange: true },
];

export async function GET() {
  try {
    const data = await getConfigValue("ticker_items", FALLBACK);
    // Expect an array of { text: string, orange?: boolean }
    if (!Array.isArray(data)) return NextResponse.json(FALLBACK);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(FALLBACK);
  }
}
