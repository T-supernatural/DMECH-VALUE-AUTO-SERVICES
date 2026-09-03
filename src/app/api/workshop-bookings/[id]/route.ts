import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { staffGuard } from "@/lib/guards";
import type { StaffRole } from "@/types";

const EDIT_ROLES: StaffRole[] = ["super_admin", "managing_partner", "ops_manager", "workshop_lead"];
const STATUSES = ["new", "confirmed", "in_progress", "completed", "cancelled"] as const;
type BookingStatus = (typeof STATUSES)[number];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await staffGuard();
  if (!staff) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  if (!EDIT_ROLES.includes(staff.role as StaffRole)) {
    return NextResponse.json({ error: "Not permitted to edit workshop bookings." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const updates: Record<string, unknown> = {};
  if (STATUSES.includes(body?.status as BookingStatus)) updates.status = body.status;
  if (typeof body?.job_card_id === "string" || body?.job_card_id === null) updates.job_card_id = body.job_card_id;
  if (typeof body?.staff_notes === "string" || body?.staff_notes === null) updates.staff_notes = body.staff_notes;
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No valid changes supplied." }, { status: 400 });

  const service = createServiceClient();
  const { data, error } = await service
    .from("workshop_bookings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", (await params).id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: "Could not update workshop booking." }, { status: 500 });
  return NextResponse.json({ booking: data });
}
