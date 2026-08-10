import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { SourcingListingForm } from "@/components/ops/SourcingListingForm";
import { staffGuard } from "@/lib/guards";
import type { StaffRole } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

export default async function NewSourcingListingPage() {
  const staff = await staffGuard();
  if (!staff) redirect("/login");
  if (!EDIT_ROLES.includes(staff.role as StaffRole)) redirect("/ops/sourcing");

  return (
    <>
      <TopBar title="Add Sourcing Listing" />
      <div className="ops-content">
        <SourcingListingForm />
      </div>
    </>
  );
}
