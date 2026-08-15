import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { StaffRole } from "@/types";

const DELETE_ROLES: StaffRole[] = ["super_admin", "managing_partner", "sales_manager", "ops_manager", "it_manager"];

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  if (!DELETE_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted to delete customers." }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("customers")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select("id, full_name")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Customer not found or already deleted." }, { status: 404 });
  }

  await logAudit({
    userId: staff.id,
    action: "delete",
    tableName: "customers",
    recordId: id,
    oldValue: { deleted_at: null },
    newValue: { deleted_at: new Date().toISOString() },
  });

  return NextResponse.json({ success: true, deletedId: id });
}
