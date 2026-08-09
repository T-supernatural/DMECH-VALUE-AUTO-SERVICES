import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { roleGuard } from "@/lib/guards";
import { logAudit } from "@/lib/audit";
import type { StaffRole } from "@/types";

const ALLOWED = ["role", "is_active"] as const;

const VALID_ROLES: StaffRole[] = [
  "super_admin",
  "managing_partner",
  "sales_manager",
  "ops_manager",
  "workshop_lead",
  "sales_rep",
  "accountant",
  "it_manager",
];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const staff = await roleGuard(["super_admin", "it_manager"]);
  if (!staff) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if ("role" in body && !VALID_ROLES.includes(body.role)) {
    return NextResponse.json({ error: "Invalid role." }, { status: 400 });
  }
  // Same rule as account creation: IT Manager provisions accounts but can
  // never grant (or, by extension, hold) super_admin.
  if (staff.role === "it_manager" && body.role === "super_admin") {
    return NextResponse.json({ error: "IT Manager cannot assign the Super Admin role." }, { status: 403 });
  }

  const resetPassword = typeof body.password === "string" ? body.password : null;
  if (resetPassword !== null) {
    if (resetPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }
    if (id === staff.id) {
      return NextResponse.json({ error: "Use Change Password for your own account." }, { status: 400 });
    }
  }

  const supabase = createServiceClient();
  const { data: before } = await supabase.from("users").select("role, is_active, auth_user_id").eq("id", id).maybeSingle();

  // Same boundary enforced server-side, not just hidden in the UI: IT
  // Manager can't touch an *existing* Super Admin account either -- not
  // just barred from creating one.
  if (staff.role === "it_manager" && before?.role === "super_admin") {
    return NextResponse.json({ error: "IT Manager cannot modify a Super Admin account." }, { status: 403 });
  }

  const updates: Record<string, unknown> = {};
  for (const key of ALLOWED) {
    if (key in body) updates[key] = body[key];
  }
  // A password reset forces the same "set your own password on next login"
  // flow a brand-new account goes through -- an admin-chosen password is
  // always meant to be temporary, never the account's real permanent one.
  if (resetPassword !== null) updates.must_change_password = true;

  if (resetPassword !== null) {
    if (!before?.auth_user_id) {
      return NextResponse.json({ error: "No auth account found for this staff member." }, { status: 400 });
    }
    const { error: authError } = await supabase.auth.admin.updateUserById(before.auth_user_id, {
      password: resetPassword,
    });
    if (authError) {
      return NextResponse.json({ error: "Could not reset the password." }, { status: 500 });
    }
  }

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Could not update staff record." }, { status: 500 });
  }

  // Deactivating a staff account (e.g. incident response on a suspected
  // compromise) must not just be gated at the app layer -- staffGuard()
  // rejecting is_active=false on the next request is already effective, but
  // that still leaves their existing Supabase session able to hit
  // unauthenticated endpoints or simply outlive this check somewhere it
  // wasn't applied. Banning at the auth layer too kills the session/refresh
  // token outright. Reactivating clears the ban the same way.
  if ("is_active" in updates && before?.auth_user_id) {
    await supabase.auth.admin.updateUserById(before.auth_user_id, {
      ban_duration: updates.is_active ? "none" : "876000h",
    });
  }

  await logAudit({ userId: staff.id, action: "update", tableName: "users", recordId: id, oldValue: before, newValue: updates });

  return NextResponse.json({ staff: data });
}
