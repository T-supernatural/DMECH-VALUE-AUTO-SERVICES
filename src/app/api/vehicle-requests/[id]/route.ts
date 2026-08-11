import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { StaffRole, VehicleRequestStatus } from "@/types";

export const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "sales_manager"];

const ALLOWED = ["status", "staff_notes"] as const;
const VALID_STATUSES: VehicleRequestStatus[] = ["new", "contacted", "sourcing", "fulfilled", "closed"];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff || !EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if ("status" in body && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }
  updates.updated_at = new Date().toISOString();

  const supabase = createServiceClient();
  const { data: before } = await supabase.from("vehicle_requests").select("*").eq("id", id).maybeSingle();

  const { data, error } = await supabase
    .from("vehicle_requests")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update the request." }, { status: 500 });
  }

  await logAudit({ userId: staff.id, action: "update", tableName: "vehicle_requests", recordId: id, oldValue: before, newValue: updates });

  return NextResponse.json({ request: data });
}
