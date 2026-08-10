"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Handshake,
  Users,
  Package,
  Wrench,
  HardHat,
  Ship,
  FileCheck,
  UserCog,
  ShieldCheck,
  PiggyBank,
  Receipt,
  CircleDollarSign,
  Building2,
  Settings,
  History,
  KeyRound,
  BarChart3,
  HandCoins,
  LogOut,
  Globe,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { OPS_NAV_ITEMS, getEffectiveNavAccess, type OpsNavItemId } from "@/lib/staff-permissions";
import { createClient } from "@/lib/supabase/client";
import type { DmechUser, StaffRole } from "@/types";

const NAV_ICON_MAP = {
  dashboard: LayoutDashboard,
  customers: Users,
  vehicles: Car,
  parts: Package,
  "dealer-partners": Handshake,
  sourcing: Globe,
  "pre-orders": ClipboardList,
  workshop: Wrench,
  specialists: HardHat,
  invoices: Receipt,
  receipts: CircleDollarSign,
  financing: CircleDollarSign,
  shipments: Ship,
  customs: FileCheck,
  "warranty-claims": ShieldCheck,
  "reserve-fund": PiggyBank,
  "business-reports": BarChart3,
  "consignment-payables": HandCoins,
  staff: UserCog,
  business: Building2,
  platform: Settings,
  "audit-log": History,
  "login-activity": KeyRound,
} as const;

type SidebarNavItem = {
  id: OpsNavItemId;
  href: string;
  label: string;
  icon: LucideIcon;
};

const NAV: Record<string, SidebarNavItem[]> = OPS_NAV_ITEMS.reduce<Record<string, SidebarNavItem[]>>((acc, item) => {
  const existing = acc[item.section] ?? [];
  existing.push({
    id: item.id,
    href: item.href,
    label: item.label,
    icon: NAV_ICON_MAP[item.id as keyof typeof NAV_ICON_MAP],
  });
  acc[item.section] = existing;
  return acc;
}, {});

const ROLE_LABEL: Record<StaffRole, string> = {
  super_admin: "Super Admin",
  managing_partner: "Managing Partner",
  sales_manager: "Sales Manager",
  ops_manager: "Ops Manager",
  it_manager: "IT Manager",
  workshop_lead: "Workshop Lead",
  sales_rep: "Sales Rep",
  accountant: "Accountant",
};

export function Sidebar({ staff }: { staff: DmechUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const role = staff.role as StaffRole;
  const visibleNavIds = new Set<OpsNavItemId>(getEffectiveNavAccess(staff));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = staff.full_name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="ops-sidebar">
      {/* Plain <a>, not <Link> — a real navigation so the splash (OpsShell,
          gated by client useState that only resets on a fresh mount)
          actually replays instead of silently no-op'ing on a client-side
          route that doesn't remount the layout. */}
      <a href="/ops/dashboard" className="ops-sidebar-logo">
        <Logo variant="sidebar" />
      </a>

      <nav className="ops-nav">
        {Object.entries(NAV).map(([section, items]) => {
          const visible = items.filter((item) => visibleNavIds.has(item.id));
          if (visible.length === 0) return null;
          return (
            <div key={section} className="ops-nav-section">
              <div className="ops-nav-section-label">{section}</div>
              {visible.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ops-nav-item${isActive ? " active" : ""}`}
                  >
                    <item.icon size={16} strokeWidth={2} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="ops-sidebar-footer">
        <div className="ops-user-block">
          <div className="ops-user-avatar">{initials}</div>
          <div className="ops-user-info">
            <div className="ops-user-name">{staff.full_name}</div>
            <div className="ops-user-role">{ROLE_LABEL[role]}</div>
          </div>
          <button type="button" className="ops-logout-btn" onClick={logout} title="Sign out">
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </aside>
  );
}
