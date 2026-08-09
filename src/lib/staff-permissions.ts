import type { DmechUser, StaffRole } from "@/types";

export const OPS_NAV_ITEMS = [
  { id: "dashboard", href: "/ops/dashboard", label: "Dashboard", section: "Overview" },
  { id: "customers", href: "/ops/customers", label: "Customers", section: "Customers" },
  { id: "vehicles", href: "/ops/vehicles", label: "Vehicles", section: "Inventory" },
  { id: "parts", href: "/ops/parts", label: "Parts", section: "Inventory" },
  { id: "dealer-partners", href: "/ops/dealer-partners", label: "Dealer Partners", section: "Inventory" },
  { id: "workshop", href: "/ops/workshop", label: "Workshop", section: "Operations" },
  { id: "specialists", href: "/ops/specialists", label: "Specialists", section: "Operations" },
  { id: "invoices", href: "/ops/invoices", label: "Invoices", section: "Finance" },
  { id: "receipts", href: "/ops/receipts", label: "Receipts", section: "Finance" },
  { id: "financing", href: "/ops/settings/platform", label: "Financing", section: "Finance" },
  { id: "shipments", href: "/ops/shipments", label: "Shipments", section: "Logistics" },
  { id: "customs", href: "/ops/customs", label: "Customs", section: "Logistics" },
  { id: "warranty-claims", href: "/ops/warranty-claims", label: "Warranty Claims", section: "Certified Program" },
  { id: "reserve-fund", href: "/ops/reports/reserve-fund", label: "Reserve Fund", section: "Certified Program" },
  { id: "business-reports", href: "/ops/reports", label: "Business Reports", section: "Reports" },
  { id: "consignment-payables", href: "/ops/reports/consignment-payables", label: "Consignment Payables", section: "Reports" },
  { id: "staff", href: "/ops/settings/staff", label: "Staff", section: "Settings" },
  { id: "business", href: "/ops/settings/business", label: "Business", section: "Settings" },
  { id: "platform", href: "/ops/settings/platform", label: "Platform", section: "Settings" },
  { id: "audit-log", href: "/ops/settings/audit-log", label: "Audit Log", section: "Settings" },
  { id: "login-activity", href: "/ops/settings/login-activity", label: "Login Activity", section: "Settings" },
] as const;

export type OpsNavItemId = (typeof OPS_NAV_ITEMS)[number]["id"];

export const DEFAULT_NAV_ACCESS_BY_ROLE: Record<StaffRole, OpsNavItemId[]> = {
  super_admin: OPS_NAV_ITEMS.map((item) => item.id),
  managing_partner: [
    "dashboard",
    "customers",
    "vehicles",
    "parts",
    "dealer-partners",
    "workshop",
    "specialists",
    "invoices",
    "receipts",
    "financing",
    "shipments",
    "customs",
    "warranty-claims",
    "reserve-fund",
    "business-reports",
    "consignment-payables",
    "staff",
    "business",
    "platform",
    "audit-log",
    "login-activity",
  ],
  sales_manager: [
    "dashboard",
    "customers",
    "vehicles",
    "parts",
    "dealer-partners",
    "invoices",
    "receipts",
    "financing",
    "shipments",
    "customs",
    "business-reports",
    "consignment-payables",
  ],
  ops_manager: [
    "dashboard",
    "customers",
    "vehicles",
    "parts",
    "dealer-partners",
    "workshop",
    "specialists",
    "invoices",
    "receipts",
    "financing",
    "shipments",
    "customs",
  ],
  it_manager: [
    "dashboard",
    "customers",
    "vehicles",
    "parts",
    "dealer-partners",
    "workshop",
    "specialists",
    "invoices",
    "receipts",
    "financing",
    "shipments",
    "customs",
    "staff",
    "platform",
    "audit-log",
    "login-activity",
  ],
  workshop_lead: ["dashboard", "workshop", "specialists", "vehicles"],
  sales_rep: ["dashboard", "customers", "vehicles", "dealer-partners"],
  accountant: [
    "dashboard",
    "invoices",
    "receipts",
    "financing",
    "customers",
    "vehicles",
    "warranty-claims",
    "reserve-fund",
    "business-reports",
    "consignment-payables",
  ],
};

export const NAV_ID_BY_HREF: Record<string, OpsNavItemId> = Object.fromEntries(
  OPS_NAV_ITEMS.map((item) => [item.href, item.id]),
) as Record<string, OpsNavItemId>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function getDefaultNavAccess(role: StaffRole): OpsNavItemId[] {
  return [...DEFAULT_NAV_ACCESS_BY_ROLE[role]];
}

export function normalizeNavAccess(value: unknown): OpsNavItemId[] {
  const direct = asStringArray(value);
  if (direct.length > 0) {
    return direct.filter((item): item is OpsNavItemId => OPS_NAV_ITEMS.some((navItem) => navItem.id === item));
  }
  return [];
}

export function getEffectiveNavAccess(staff: Pick<DmechUser, "role" | "metadata">): OpsNavItemId[] {
  const metadata = (staff.metadata ?? {}) as Record<string, unknown>;
  const explicit = normalizeNavAccess(metadata.nav_access ?? metadata.navigation_access ?? metadata.sidebar_access);

  if (explicit.length > 0) {
    return explicit;
  }

  return getDefaultNavAccess(staff.role as StaffRole);
}

export function buildNavAccessForRole(role: StaffRole, selected?: string[]): OpsNavItemId[] {
  const base = selected && selected.length > 0 ? selected : getDefaultNavAccess(role);
  return base.filter((item): item is OpsNavItemId => OPS_NAV_ITEMS.some((navItem) => navItem.id === item));
}
