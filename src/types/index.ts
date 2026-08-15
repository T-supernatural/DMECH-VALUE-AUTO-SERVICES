// Hand-written types matching supabase/migrations/001_schema.sql.
// Not generated — cast Supabase query results to these at the call site
// (see oro-energy-management-hub convention). Keep in sync with the schema
// by hand; there is no `supabase gen types` step in this project.

export type StaffRole =
  | "super_admin"
  | "managing_partner"
  | "sales_manager"
  | "ops_manager"
  | "it_manager"
  | "workshop_lead"
  | "sales_rep"
  | "accountant";

export type UserRole = StaffRole | "customer";

export interface DmechUser {
  id: string;
  auth_user_id: string | null;
  email: string;
  phone: string | null;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  avatar_url: string | null;
  metadata: Record<string, unknown>;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  phone: string;
  source: "calculator" | "workshop_booking" | string;
  payload: Record<string, unknown>;
  converted_customer_id: string | null;
  created_at: string;
}

export type CustomerType =
  | "instalment_buyer"
  | "cash_buyer"
  | "workshop_walkin"
  | "corporate"
  | "parts_retail"
  | "parts_wholesale"
  | "dealer_partner";

export const CUSTOMER_TYPE_LABELS: Record<CustomerType, string> = {
  instalment_buyer: "Instalment Buyer",
  cash_buyer: "Cash Buyer",
  workshop_walkin: "Workshop Walk-In",
  corporate: "Corporate",
  parts_retail: "Parts — Retail",
  parts_wholesale: "Parts — Wholesale",
  dealer_partner: "Dealer Partner",
};

// dealer_partner is deliberately excluded from self-service/general staff
// registration (RegistrationForm.tsx, CustomerIntakeForm.tsx) — it's a
// business relationship DMECH initiates, not something a site visitor or
// walk-in registers as. Managed only via Ops > Dealer Partners.
export const REGISTRABLE_CUSTOMER_TYPES: CustomerType[] = [
  "instalment_buyer",
  "cash_buyer",
  "workshop_walkin",
  "corporate",
  "parts_retail",
  "parts_wholesale",
];

// Types that involve DMECH extending credit — the ones a requested
// credit_limit_kobo (and therefore an approval tier) actually applies to.
export const FINANCING_CUSTOMER_TYPES: CustomerType[] = ["instalment_buyer", "corporate"];

export type ApprovalStatus = "pending" | "stage2_docs" | "approved" | "declined";

export interface CustomerDocument {
  type: string;
  url: string;
  uploaded_at: string;
  verified: boolean;
}

export interface Guarantor {
  name: string;
  phone: string;
  relationship: string;
}

export interface CompanyDetails {
  company_name: string;
  rc_number: string;
  contact_person: string;
}

export interface Customer {
  id: string;
  user_id: string | null;
  type: CustomerType;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  bvn: string | null;
  employer: string | null;
  monthly_income_kobo: number | null;
  guarantor: Guarantor | null;
  company_details: CompanyDetails | null;
  tin: string | null;
  approval_status: ApprovalStatus;
  approval_tier: 1 | 2 | 3 | 4 | null;
  approved_by: string[];
  credit_limit_kobo: number | null;
  ltv_tier: "new" | "medium" | "high" | "vip";
  documents: CustomerDocument[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type LifecycleStage =
  | "intake"
  | "inspection"
  | "sourced"
  | "purchased"
  | "shipped"
  | "in_transit"
  | "at_port"
  | "customs"
  | "cleared"
  | "available"
  | "reserved"
  | "sold"
  | "delivered";

// Order matters — this is what drives the Vehicles lifecycle bar. Keep it in
// sync with the schema's CHECK constraint; the old ops mockup's UI array
// dropped "reserved", which is the bug this list exists to prevent repeating.
// "intake"/"inspection" were added for the Nigerian-Used/Certified program —
// non-import channels enter there and skip the shipping-specific stages;
// render a channel-appropriate subset (see LIFECYCLE_STAGES_BY_CHANNEL)
// rather than forcing every vehicle through all 13 stages.
export const LIFECYCLE_STAGES: LifecycleStage[] = [
  "intake",
  "inspection",
  "sourced",
  "purchased",
  "shipped",
  "in_transit",
  "at_port",
  "customs",
  "cleared",
  "available",
  "reserved",
  "sold",
  "delivered",
];

export type AcquisitionChannel = "import" | "local_outright" | "consignment" | "trade_in";

// Which lifecycle stages are relevant per acquisition channel, for the
// Vehicles page lifecycle bar. Import keeps the full shipping pipeline;
// local-sourced channels skip straight from inspection to available.
export const LIFECYCLE_STAGES_BY_CHANNEL: Record<AcquisitionChannel, LifecycleStage[]> = {
  import: [
    "sourced",
    "purchased",
    "shipped",
    "in_transit",
    "at_port",
    "customs",
    "cleared",
    "available",
    "reserved",
    "sold",
    "delivered",
  ],
  local_outright: ["intake", "inspection", "available", "reserved", "sold", "delivered"],
  consignment: ["intake", "inspection", "available", "reserved", "sold", "delivered"],
  trade_in: ["intake", "inspection", "available", "reserved", "sold", "delivered"],
};

export type CertificationStatus = "uncertified" | "pending_inspection" | "certified";

export interface TitleVerificationCheck {
  check: string;
  status: "pass" | "fail" | "pending";
  verified_by: string | null;
  verified_at: string | null;
  notes: string | null;
}

export type FuelType = "petrol" | "diesel" | "hybrid" | "electric";
export type SourceRegion = "usa" | "europe" | "china" | "nigeria";
export type VehicleCondition = "used" | "new";

export type DamageLevel = "none" | "light" | "moderate" | "heavy";
export type AccidentStatus = "none" | "minor" | "major" | "unknown";
export type RepairStatus = "not_repaired" | "repaired" | "repaired_and_inspected";

export interface VehicleHistoryReport {
  has_accident_history: boolean;
  accident_status: AccidentStatus;
  accident_summary: string | null;
  repair_status: RepairStatus;
  front_damage_level: DamageLevel;
  rear_damage_level: DamageLevel;
  left_side_damage_level: DamageLevel;
  right_side_damage_level: DamageLevel;
  before_after_photo_urls: string[];
  inspection_notes: string | null;
  verified_by: string | null;
  verified_at: string | null;
}

// Buyer-persona tags — orthogonal to acquisition_channel/source_region (how
// DMECH got the vehicle) and condition/fuel_type (what it is). A vehicle can
// carry more than one (a pickup is both Construction and Logistics).
export type VehicleUseCategory = "corporate" | "family" | "construction" | "catering" | "logistics" | "fleet" | "luxury";

export const USE_CATEGORY_LABELS: Record<VehicleUseCategory, string> = {
  corporate: "Corporate",
  family: "Family",
  construction: "Construction",
  catering: "Catering",
  logistics: "Logistics",
  fleet: "Fleet",
  luxury: "Luxury & Prestige",
};

export const USE_CATEGORY_DESCRIPTIONS: Record<VehicleUseCategory, string> = {
  corporate: "Executive sedans & fleet vehicles for your business",
  family: "Spacious, safe SUVs and vans for the family",
  construction: "Rugged pickups & trucks built for the job site",
  catering: "Reliable vans for food & hospitality business",
  logistics: "Haulage-ready vehicles for moving goods",
  fleet: "Multi-vehicle operations, company transport, and managed fleet deployments",
  luxury: "Premium and exotic vehicles for the discerning owner",
};

export type PhotoTag =
  | "hero"
  | "front"
  | "rear"
  | "left_side"
  | "right_side"
  | "interior_front"
  | "dashboard"
  | "steering"
  | "seats"
  | "engine_bay"
  | "boot"
  | "wheels"
  | "chassis"
  | "vin_plate"
  | "damage";

export const PHOTO_TAGS: { value: PhotoTag; label: string }[] = [
  { value: "hero", label: "Hero / Featured" },
  { value: "front", label: "Front View" },
  { value: "rear", label: "Rear View" },
  { value: "left_side", label: "Left Side" },
  { value: "right_side", label: "Right Side" },
  { value: "interior_front", label: "Interior Front" },
  { value: "dashboard", label: "Dashboard" },
  { value: "steering", label: "Steering" },
  { value: "seats", label: "Seats" },
  { value: "engine_bay", label: "Engine Bay" },
  { value: "boot", label: "Boot" },
  { value: "wheels", label: "Wheels" },
  { value: "chassis", label: "Chassis" },
  { value: "vin_plate", label: "VIN Plate" },
  { value: "damage", label: "Damage (internal only)" },
];

export interface VehiclePhoto {
  id: string;
  url: string;
  tag: PhotoTag | null;
  is_internal: boolean;
  sort_order: number;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  colour: string | null;
  engine_cc: number | null;
  fuel_type: FuelType | null;
  battery_range_km: number | null;
  source_region: SourceRegion | null;
  source_detail: string | null;
  condition: VehicleCondition | null;
  use_categories: VehicleUseCategory[];
  purchase_price_usd_cents: number | null;
  shipping_cost_usd_cents: number | null;
  customs_duty_kobo: number | null;
  sale_price_kobo: number | null;
  cost_basis_kobo: number | null;
  margin_pct: number | null;
  lifecycle_stage: LifecycleStage;
  reserved_until: string | null;
  buyer_id: string | null;
  shipment_id: string | null;
  condition_report: Array<{ area: string; score: string; notes: string; photo_urls: string[] }>;
  photos: VehiclePhoto[];
  video_url: string | null;
  inspection_score: number | null;

  // Nigerian-Used/Certified program
  acquisition_channel: AcquisitionChannel;
  certification_status: CertificationStatus;
  consignor_customer_id: string | null;
  consignment_commission_pct: number | null;
  consignment_payout_kobo: number | null;
  consignment_payout_paid_at: string | null;
  trade_in_credit_kobo: number | null;
  trade_in_applied_to_instalment_id: string | null;
  title_verification: TitleVerificationCheck[];
  history_report: VehicleHistoryReport | null;

  // Publish gate + catalog metadata (see migration 006)
  is_published: boolean;
  lot_number: string | null;
  // Inert until a public /vehicles/[id] page exists — see migration 006's comment.
  seo_title: string | null;
  seo_description: string | null;

  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type WarrantyCoverageTier = "basic" | "extended";
export type WarrantyPolicyStatus = "active" | "expired" | "void" | "claimed_out";

export interface WarrantyPolicy {
  id: string;
  vehicle_id: string;
  coverage_tier: WarrantyCoverageTier;
  duration_days: number;
  mileage_limit_km: number | null;
  covered_components: string[];
  excluded_items: string[];
  price_kobo: number;
  reserve_contribution_pct: number;
  reserve_contribution_kobo: number;
  status: WarrantyPolicyStatus;
  starts_at: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export type WarrantyClaimStatus = "submitted" | "assessed" | "approved" | "denied" | "paid";

export interface WarrantyClaim {
  id: string;
  warranty_policy_id: string;
  customer_id: string;
  reported_at: string;
  issue_description: string;
  assessed_cost_kobo: number | null;
  approved_kobo: number | null;
  status: WarrantyClaimStatus;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WarrantyReserveLedgerEntry {
  id: string;
  entry_type: "accrual" | "claim_payout" | "adjustment";
  amount_kobo: number;
  related_policy_id: string | null;
  related_claim_id: string | null;
  note: string | null;
  created_at: string;
}

export interface Shipment {
  id: string;
  reference: string;
  cargo_type: string;
  origin: string;
  destination: string;
  departed_at: string | null;
  eta: string | null;
  progress_pct: number;
  vessel_name: string | null;
  tracking_url: string | null;
  container_number: string | null;
  bill_of_lading: string | null;
  created_at: string;
  updated_at: string;
}

export type InstalmentPlanType = "dmech_direct" | "partner_finance";
export type InstalmentStatus = "active" | "completed" | "defaulted" | "cancelled";

export interface Instalment {
  id: string;
  customer_id: string;
  vehicle_id: string;
  plan_type: InstalmentPlanType | null;
  total_price_kobo: number;
  deposit_pct: number | null;
  deposit_amount_kobo: number | null;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  tenor_months: number;
  monthly_amount_kobo: number | null;
  admin_fee_pct: number | null;
  status: InstalmentStatus;
  guarantor_notified: boolean;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = "pending" | "paid" | "overdue" | "partial";
export type PaymentMethod = "bank_transfer" | "paystack" | "pos" | "cash";

export interface Payment {
  id: string;
  instalment_id: string;
  customer_id: string;
  amount_kobo: number;
  amount_paid_kobo: number | null;
  payment_number: number | null;
  due_date: string;
  paid_date: string | null;
  status: PaymentStatus;
  days_overdue: number;
  paystack_ref: string | null;
  payment_method: PaymentMethod | null;
  receipt_url: string | null;
  reminder_sent: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface CustomsEntry {
  id: string;
  vehicle_id: string;
  agent: string | null;
  status: string;
  documents_checklist: Array<{ label: string; done: boolean }>;
  duty_estimated_kobo: number | null;
  duty_paid_kobo: number | null;
  cleared_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Part {
  id: string;
  name: string;
  compatibility: string | null;
  qty: number;
  cost_price_kobo: number;
  sale_price_kobo: number;
  source: string | null;
  condition: "tested" | "good" | "excellent" | null;
  vin_trace: string | null;
  reorder_threshold: number;
  units_sold: number;
  created_at: string;
  updated_at: string;
}

export interface Specialist {
  id: string;
  user_id: string | null;
  name: string;
  specialty: string | null;
  rating: number | null;
  jobs_completed: number;
  revenue_generated_kobo: number;
  share_pct: number;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export type JobCardStage = "reception" | "diagnostics" | "planning" | "execution" | "qa" | "released";

export interface JobCard {
  id: string;
  reference: string;
  customer_id: string | null;
  vehicle_desc: string;
  specialist_id: string | null;
  stage: JobCardStage;
  priority: "low" | "medium" | "high";
  complaint: string | null;
  service_type: string | null;
  quote_kobo: number | null;
  parts_used: Array<{ part_id: string; qty: number }>;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DmechNotification {
  id: string;
  recipient_id: string | null;
  recipient_phone: string | null;
  channel: "whatsapp" | "sms" | "email";
  template: string;
  payload: Record<string, unknown>;
  status: "queued" | "sent" | "delivered" | "failed";
  sent_at: string | null;
  delivered_at: string | null;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  user_id: string | null;
  action: string;
  table_name: string;
  record_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  created_at: string;
}

export interface StaffLoginEvent {
  id: string;
  user_id: string | null;
  email: string;
  success: boolean;
  device_id: string | null;
  is_new_device: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface PlatformConfigRow<T = unknown> {
  key: string;
  value: T;
  updated_by: string | null;
  updated_at: string;
}

// Stored as the platform_config row with key='business_profile'. Starts
// empty ({}) — every field renders blank on an invoice until a real value
// is entered via Settings > Business, never fabricated.
export interface BusinessProfile {
  legal_name?: string;
  tin?: string;
  rc_number?: string;
  vat_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  bank_name?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

export type InvoiceDocType = "invoice" | "receipt";

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price_kobo: number;
  amount_kobo: number;
  // Harmonized System code for the goods/service line -- e.g. "8703" for a
  // motor vehicle, "8708" for vehicle parts. Optional freeform: workshop
  // labor and misc lines don't have a real goods HS code.
  hsn_code?: string | null;
}

// 'B2B' when the customer has a TIN on file, 'B2C' otherwise -- computed
// automatically at invoice creation, never a user-facing choice.
export type InvoiceTypeCode = "B2B" | "B2C";

// UN/EDIFACT transmission status of an Access Point Provider submission
// (e.g. MAXFRONT's FETCH, same as JUSTRA) -- 'NotSent' until DMECH has a
// real AP relationship wired up; the transmission client itself isn't
// built yet, only these tracking columns are.
export type FetchTransmissionStatus = "NotSent" | "Pending" | "Sent" | "Failed" | "Cancelled";

export interface Invoice {
  id: string;
  doc_type: InvoiceDocType;
  invoice_number: string;
  vehicle_id: string | null;
  customer_id: string | null;
  instalment_id: string | null;
  payment_id: string | null;
  // Self-FK: set on a receipt to point back at the manually-created invoice
  // it settles (the "Mark Paid" flow) -- null for every other receipt,
  // which link via payment_id/instalment_id instead.
  related_invoice_id: string | null;
  // How/when this specific receipt's money was actually received --
  // denormalized here (not just derived from `payments`) since deposits,
  // cash sales, and manually-marked-paid invoices have no payments row.
  payment_method: PaymentMethod | null;
  paid_date: string | null;
  // Set only on an invoice with no receipt issued against it yet -- see
  // migration 017's comment on why this is a soft-delete, not a hard one.
  voided_at: string | null;
  issue_date: string;
  line_items: InvoiceLineItem[];
  subtotal_kobo: number;
  vat_rate: number;
  vat_exempt: boolean;
  vat_amount_kobo: number;
  total_kobo: number;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  // Snapshotted at creation, not live-looked-up -- an issued invoice
  // shouldn't silently change if the customer's TIN is edited later.
  customer_tin: string | null;
  invoice_type_code: InvoiceTypeCode | null;
  payment_means_code: string | null;
  fetch_invoice_id: string | null;
  fetch_irn: string | null;
  fetch_transmission_status: FetchTransmissionStatus;
  fetch_transmitted_at: string | null;
}

// ── Sourcing catalog + Pre-Orders ──────────────────────────────────────
// A sourcing_listings row is a real, specific vehicle DMECH has spotted
// abroad (Copart/IAAI, Europe, China EV sources) but does not yet own —
// deliberately not a `vehicles` row until DMECH actually buys it.
export type SourcingPlatform = "copart" | "iaai" | "europe_other" | "china_ev" | "other";
export type SourcingListingStatus = "available" | "reserved" | "purchased" | "delisted";
export type TitleStatus = "clean" | "salvage" | "rebuilt" | "certificate_of_destruction" | "unknown";

export const SOURCING_PLATFORM_LABELS: Record<SourcingPlatform, string> = {
  copart: "Copart (USA)",
  iaai: "IAAI (USA)",
  europe_other: "Europe",
  china_ev: "China (EV)",
  other: "Other",
};

export const TITLE_STATUS_LABELS: Record<TitleStatus, string> = {
  clean: "Clean Title",
  salvage: "Salvage Title",
  rebuilt: "Rebuilt Title",
  certificate_of_destruction: "Certificate of Destruction",
  unknown: "Unknown",
};

export interface SourcingListingPhoto {
  url: string;
  sort_order: number;
}

export interface SourcingListing {
  id: string;
  source_platform: SourcingPlatform;
  source_type: "manual" | "api_feed";
  make: string;
  model: string;
  year: number;
  trim: string | null;
  vin: string | null;
  lot_number: string | null;
  title_status: TitleStatus | null;
  primary_damage: string | null;
  secondary_damage: string | null;
  odometer_km: number | null;
  run_and_drive: boolean | null;
  fuel_type: FuelType | null;
  condition_notes: string | null;
  location_country: string;
  location_city: string | null;
  auction_date: string | null;
  estimated_price_usd_cents: number;
  estimated_shipping_usd_cents: number | null;
  photos: SourcingListingPhoto[];
  status: SourcingListingStatus;
  fulfilled_vehicle_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// A customer's commitment against one sourcing_listing. The deposit is a
// reservation fee, not a downpayment against a fixed price -- the final
// total is only known once DMECH actually wins the auction.
export type PreOrderStatus = "pending_deposit" | "deposit_paid" | "sourcing" | "purchased" | "cancelled" | "refunded";

export const PRE_ORDER_STATUS_LABELS: Record<PreOrderStatus, string> = {
  pending_deposit: "Pending Deposit",
  deposit_paid: "Deposit Paid",
  sourcing: "Sourcing",
  purchased: "Purchased",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export interface PreOrder {
  id: string;
  customer_id: string;
  sourcing_listing_id: string;
  estimated_total_usd_cents: number;
  deposit_pct: number;
  deposit_amount_kobo: number;
  deposit_paid: boolean;
  deposit_paid_at: string | null;
  deposit_payment_method: PaymentMethod | null;
  // Set once the linked sourcing listing is marked purchased -- the amount
  // left after the deposit, against the real final sale price rather than
  // the reservation-time estimate. Null until then.
  balance_amount_kobo: number | null;
  balance_paid: boolean;
  balance_paid_at: string | null;
  balance_payment_method: PaymentMethod | null;
  status: PreOrderStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// "Can't find what you want? Tell us" — a visitor describes a specific
// vehicle they're after that isn't necessarily in `vehicles` or
// `sourcing_listings` yet. Staff triage it through its own status workflow.
export type VehicleRequestTimeline = "immediately" | "within_1_month" | "within_3_months" | "just_browsing";
export type VehicleRequestSource = "dedicated_page" | "vehicles_empty" | "sourcing_empty";
export type VehicleRequestStatus = "new" | "contacted" | "sourcing" | "fulfilled" | "closed";

export const VEHICLE_REQUEST_TIMELINE_LABELS: Record<VehicleRequestTimeline, string> = {
  immediately: "Ready now",
  within_1_month: "Within a month",
  within_3_months: "Within 3 months",
  just_browsing: "Just browsing",
};

export const VEHICLE_REQUEST_STATUS_LABELS: Record<VehicleRequestStatus, string> = {
  new: "New",
  contacted: "Contacted",
  sourcing: "Sourcing",
  fulfilled: "Fulfilled",
  closed: "Closed",
};

export interface VehicleRequest {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  make: string | null;
  model: string | null;
  year_min: number | null;
  year_max: number | null;
  budget_max_kobo: number | null;
  fuel_type: FuelType | null;
  source_region_preference: SourceRegion | null;
  condition_preference: VehicleCondition | null;
  timeline: VehicleRequestTimeline | null;
  notes: string | null;
  source: VehicleRequestSource;
  status: VehicleRequestStatus;
  staff_notes: string | null;
  created_at: string;
  updated_at: string;
}
