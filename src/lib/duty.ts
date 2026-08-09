import { toKobo } from "@/lib/money";

// Single source of truth for the July 2026 customs-duty formula. Ported from
// the marketing mockup's inline calculate() function — review flagged that
// the same math also needs to run for the Ops Customs module (duty_estimated
// / duty_paid on customs_entries), and having two independent copies of a
// customs-duty calculation is exactly the kind of thing that drifts out of
// sync. Both the marketing calculator and the Ops Customs module must import
// this instead of reimplementing the formula.
//
// Corrected against a real NCS worked-example walkthrough (fabric import,
// HS 5407, but the CIF/duty/CISS/VAT mechanics are commodity-agnostic):
// this file previously computed "CIF" as just Cost + Freight with no
// Insurance line at all — which is CF, not CIF — and charged CISS on CIF
// instead of Cost. Both are fixed below. HS 8703 (motor vehicles) is the
// applicable heading; fuel-type sub-headings are the closest publicly
// verifiable breakdown as of this fix, not a guess, but the exact
// Nigeria-specific 8-digit national suffix isn't independently confirmed —
// treat hsCode as "close enough to cite," not a customs-filing-grade code.
const HS_CODE_PETROL = "8703.23";
const HS_CODE_DIESEL = "8703.32";
const HS_CODE_ELECTRIC = "8703.80";

const DEFAULT_INSURANCE_RATE_PCT = 0.5;

// NCS's official July 30, 2026 guidelines (Presidential Gas for Growth
// Initiative): 100% pure EVs and EREVs with 200km+ electric range get full
// import duty AND VAT exemption -- but NOT hybrids, dual-fuel CNG vehicles,
// or any vehicle priced $100,000+ (excluded as "luxury" regardless of fuel
// type). The exemption also isn't automatic -- it requires an Import Duty
// Exemption Certificate (IDEC) from the Federal Ministry of Finance per
// import, which is why the UI caveats this as pending certification rather
// than presenting it as a guaranteed price. Import Levy, NAC, CISS, and
// ETLS are NOT confirmed as exempted anywhere sourced -- only duty and VAT
// -- so those still apply to EVs same as any other vehicle.
const EV_LUXURY_THRESHOLD_USD = 100_000;

export type EngineSize = "small" | "medium" | "large"; // <2000cc | 2000-3999cc | 4000cc+
export type VehicleCondition = "used" | "new";

export interface DutyInput {
  priceUsd: number;
  shippingUsd: number;
  condition: VehicleCondition;
  engineSize: EngineSize;
  isEV: boolean;
  isDiesel?: boolean;
  ngnRate: number; // naira per USD, from platform_config.ngn_usd_rate
  insuranceRatePct?: number; // defaults to 0.5%, the standard NCS worked-example rate
}

export interface DutyBreakdown {
  hsCode: string;
  costUsd: number;
  freightUsd: number;
  cfUsd: number;
  insuranceUsd: number;
  insuranceRatePct: number;
  cifUsd: number;
  cifKobo: number;
  costKobo: number;
  dutyKobo: number;
  dutyRatePct: number;
  levyKobo: number;
  levyRatePct: number;
  surchargeKobo: number;
  nacKobo: number;
  cissKobo: number;
  etlsKobo: number;
  greenTaxKobo: number;
  greenTaxRatePct: number;
  greenTaxExempt: boolean;
  evDutyExempt: boolean;
  vatKobo: number;
  vatRatePct: number;
  clearingKobo: number;
  terminalKobo: number;
  dmechFeeKobo: number;
  totalDutiesKobo: number;
  totalLandedKobo: number;
}

const CLEARING_FEE_NAIRA = 350_000;
const TERMINAL_FEE_NAIRA = 180_000;

export function calculateLandedCost(input: DutyInput): DutyBreakdown {
  const { priceUsd, shippingUsd, condition, engineSize, isEV, isDiesel, ngnRate } = input;
  const insuranceRatePct = input.insuranceRatePct ?? DEFAULT_INSURANCE_RATE_PCT;

  const hsCode = isEV ? HS_CODE_ELECTRIC : isDiesel ? HS_CODE_DIESEL : HS_CODE_PETROL;

  // CIF = Cost + Insurance + Freight. Insurance is billed on Cost + Freight
  // combined (CF), not on Cost alone -- this line was missing entirely
  // before, which made the old "CIF" actually just CF.
  const cfUsd = priceUsd + shippingUsd;
  const insuranceUsd = cfUsd * (insuranceRatePct / 100);
  const cifUsd = cfUsd + insuranceUsd;
  const cifNaira = cifUsd * ngnRate;
  const costNaira = priceUsd * ngnRate;

  const evDutyExempt = isEV && priceUsd < EV_LUXURY_THRESHOLD_USD;
  const dutyRatePct = evDutyExempt ? 0 : 20;
  const dutyNaira = cifNaira * (dutyRatePct / 100);

  const levyRatePct = condition === "used" ? 5 : 10;
  const levyNaira = cifNaira * (levyRatePct / 100);

  const surchargeNaira = dutyNaira * 0.07;
  const nacNaira = cifNaira * 0.02;
  // CISS is assessed on Cost (FOB value), not CIF -- was wrongly based on
  // CIF before.
  const cissNaira = costNaira * 0.01;
  const etlsNaira = cifNaira * 0.005;

  const greenTaxRatePct = isEV ? 0 : engineSize === "small" ? 0 : engineSize === "medium" ? 2 : 4;
  const greenTaxNaira = cifNaira * (greenTaxRatePct / 100);

  const subNaira = dutyNaira + levyNaira + surchargeNaira + nacNaira + cissNaira + etlsNaira + greenTaxNaira;
  const vatRatePct = evDutyExempt ? 0 : 7.5;
  const vatNaira = (cifNaira + subNaira) * (vatRatePct / 100);
  const totalDutiesNaira = subNaira + vatNaira;

  const dmechFeeNaira = cifNaira * 0.08;
  const totalLandedNaira =
    cifNaira + totalDutiesNaira + CLEARING_FEE_NAIRA + TERMINAL_FEE_NAIRA + dmechFeeNaira;

  return {
    hsCode,
    costUsd: priceUsd,
    freightUsd: shippingUsd,
    cfUsd,
    insuranceUsd,
    insuranceRatePct,
    cifUsd,
    cifKobo: toKobo(cifNaira),
    costKobo: toKobo(costNaira),
    dutyKobo: toKobo(dutyNaira),
    dutyRatePct,
    levyKobo: toKobo(levyNaira),
    levyRatePct,
    surchargeKobo: toKobo(surchargeNaira),
    nacKobo: toKobo(nacNaira),
    cissKobo: toKobo(cissNaira),
    etlsKobo: toKobo(etlsNaira),
    greenTaxKobo: toKobo(greenTaxNaira),
    greenTaxRatePct,
    greenTaxExempt: greenTaxRatePct === 0,
    evDutyExempt,
    vatKobo: toKobo(vatNaira),
    vatRatePct,
    clearingKobo: toKobo(CLEARING_FEE_NAIRA),
    terminalKobo: toKobo(TERMINAL_FEE_NAIRA),
    dmechFeeKobo: toKobo(dmechFeeNaira),
    totalDutiesKobo: toKobo(totalDutiesNaira),
    totalLandedKobo: toKobo(totalLandedNaira),
  };
}
