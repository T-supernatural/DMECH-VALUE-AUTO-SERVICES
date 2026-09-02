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

// ── Auction/pre-shipment fees ────────────────────────────────────────────
// These are charged by the auction platform (Copart/IAAI) in the US, on top
// of the winning bid, before the vehicle even ships -- previously entirely
// missing from this calculator, which only ever modeled the winning bid
// itself plus Nigeria-side duty/logistics. Sourced from Copart's and IAAI's
// own published buyer-fee pages (Aug 2026); treated as real but variable
// estimates, not confirmed per-transaction figures -- flagged to the user
// the same way the HS code and EV exemption are.
//
// Modeled on Copart's PUBLIC (non-licensed) buyer fee schedule as the
// conservative default -- if DMECH holds licensed-dealer/broker status at
// either platform, the real buyer's fee is typically a flat 5-6% instead of
// this tiered public schedule, which would lower this line meaningfully.
// That status wasn't confirmed, so this defaults to the higher, safer
// assumption rather than risk under-quoting a customer.
const COPART_PUBLIC_BUYER_FEE_TIERS: { max: number; fee: number }[] = [
  { max: 399.99, fee: 75 },
  { max: 899.99, fee: 135 },
  { max: 1399.99, fee: 185 },
  { max: 1999.99, fee: 235 },
  { max: 2499.99, fee: 285 },
  { max: 2999.99, fee: 335 },
  { max: 3499.99, fee: 385 },
  { max: 3999.99, fee: 435 },
  { max: 4499.99, fee: 485 },
  { max: 4999.99, fee: 535 },
];

// Flat/near-flat fees -- point estimates from the middle of each platform's
// published range (see comment above); real per-lot amounts vary by
// platform, title status, and bid method (pre-bid vs. live).
const VIRTUAL_BID_FEE_USD = 75; // remote pre-bid, not live in-person bidding
const AUCTION_GATE_FEE_USD = 90; // Copart: $79-95 clean/salvage; IAAI: ~$105
const ENVIRONMENTAL_FEE_USD = 15; // consistent across both platforms
const TITLE_HANDLING_FEE_USD = 20; // consistent across both platforms
// Genuinely the widest-variance line here -- depends entirely on how far
// the winning lot's yard is from the export port. $0.60-$1.50/mile is the
// sourced range; this assumes a moderate haul to a nearby port, which is
// also the outcome a broker actively optimizing for landed cost should be
// aiming for by preferring yards close to port in the first place.
const INLAND_HAUL_TO_PORT_USD = 250;

function calculateBuyerFeeUsd(priceUsd: number): number {
  const tier = COPART_PUBLIC_BUYER_FEE_TIERS.find((t) => priceUsd <= t.max);
  if (tier) return tier.fee;
  // $5,000-$14,999.99: 10% of price. $15,000+: 7.5% (secured buyer rate).
  return priceUsd < 15_000 ? priceUsd * 0.1 : priceUsd * 0.075;
}

export type EngineSize = "small" | "medium" | "large"; // <2000cc | 2000-3999cc | 4000cc+
export type VehicleCondition = "used" | "new";

export interface DutyInput {
  priceUsd: number;
  dutyReferenceUsd?: number;
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
  dutyReferenceUsd: number;
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
  buyerFeeUsd: number;
  virtualBidFeeUsd: number;
  auctionGateFeeUsd: number;
  environmentalFeeUsd: number;
  titleFeeUsd: number;
  inlandHaulUsd: number;
  totalAuctionFeesUsd: number;
  totalAuctionFeesKobo: number;
  totalDutiesKobo: number;
  totalLandedKobo: number;
}

const CLEARING_FEE_NAIRA = 350_000;
const TERMINAL_FEE_NAIRA = 180_000;

export function calculateLandedCost(input: DutyInput): DutyBreakdown {
  const { priceUsd, shippingUsd, condition, engineSize, isEV, isDiesel, ngnRate } = input;
  const insuranceRatePct = input.insuranceRatePct ?? DEFAULT_INSURANCE_RATE_PCT;
  const dutyReferenceUsd = input.dutyReferenceUsd ?? priceUsd;

  const hsCode = isEV ? HS_CODE_ELECTRIC : isDiesel ? HS_CODE_DIESEL : HS_CODE_PETROL;

  // CIF = Cost + Insurance + Freight. Insurance is billed on Cost + Freight
  // combined (CF), not on Cost alone -- this line was missing entirely
  // before, which made the old "CIF" actually just CF.
  const cfUsd = priceUsd + shippingUsd;
  const insuranceUsd = cfUsd * (insuranceRatePct / 100);
  const cifUsd = cfUsd + insuranceUsd;
  const cifNaira = cifUsd * ngnRate;
  const costNaira = priceUsd * ngnRate;

  const evDutyExempt = isEV && dutyReferenceUsd < EV_LUXURY_THRESHOLD_USD;
  const dutyRatePct = evDutyExempt ? 0 : 20;
  // Duty is selected from the vehicle's model/year reference value when one
  // is supplied. The customer's purchase price remains a separate commercial
  // input for acquisition and other valuation-dependent costs.
  const dutyBaseNaira = dutyReferenceUsd * ngnRate;
  const dutyNaira = dutyBaseNaira * (dutyRatePct / 100);

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

  // Auction/pre-shipment fees -- real costs charged in the US before the
  // vehicle ships, kept out of the CIF/duty/VAT base (unlike Cost, Freight,
  // and Insurance) since it isn't confirmed whether NCS assesses duty on
  // the buyer's premium or just the auction sale price. Added straight to
  // the final total instead, the same way Clearing/Terminal fees already
  // are -- a real cost to the customer either way.
  const buyerFeeUsd = calculateBuyerFeeUsd(priceUsd);
  const totalAuctionFeesUsd =
    buyerFeeUsd + VIRTUAL_BID_FEE_USD + AUCTION_GATE_FEE_USD + ENVIRONMENTAL_FEE_USD + TITLE_HANDLING_FEE_USD + INLAND_HAUL_TO_PORT_USD;
  const totalAuctionFeesNaira = totalAuctionFeesUsd * ngnRate;

  const totalLandedNaira =
    cifNaira + totalDutiesNaira + CLEARING_FEE_NAIRA + TERMINAL_FEE_NAIRA + dmechFeeNaira + totalAuctionFeesNaira;

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
    dutyReferenceUsd,
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
    buyerFeeUsd,
    virtualBidFeeUsd: VIRTUAL_BID_FEE_USD,
    auctionGateFeeUsd: AUCTION_GATE_FEE_USD,
    environmentalFeeUsd: ENVIRONMENTAL_FEE_USD,
    titleFeeUsd: TITLE_HANDLING_FEE_USD,
    inlandHaulUsd: INLAND_HAUL_TO_PORT_USD,
    totalAuctionFeesUsd,
    totalAuctionFeesKobo: toKobo(totalAuctionFeesNaira),
    totalDutiesKobo: toKobo(totalDutiesNaira),
    totalLandedKobo: toKobo(totalLandedNaira),
  };
}
