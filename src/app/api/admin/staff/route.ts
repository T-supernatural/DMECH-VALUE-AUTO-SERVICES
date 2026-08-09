import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { roleGuard } from "@/lib/guards";
import type { StaffRole } from "@/types";

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

// Wraps the same Admin API call the first staff account was seeded with by
// hand (Phase 2 kickoff): create the auth user first, then the matching
// `users` row. Both steps use the service-role client — there's no RLS
// write policy for creating other staff rows, by design (see 004's
// migration comment); this route is the only path in.
export async function POST(request: Request) {
  const staff = await roleGuard(["super_admin", "it_manager"]);
  if (!staff) {
    return NextResponse.json({ error: "Not permitted." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const fullName = typeof body?.full_name === "string" ? body.full_name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role = body?.role as StaffRole;
  const navAccess = Object.prototype.hasOwnProperty.call(body ?? {}, "nav_access") && Array.isArray(body?.nav_access)
    ? body.nav_access.filter((item: unknown) => typeof item === "string")
    : undefined;

  if (!fullName || !email || password.length < 8 || !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Name, a valid email, an 8+ character password, and a role are required." },
      { status: 400 },
    );
  }

  // IT Manager can provision accounts but must never be able to create
  // another super_admin -- that decision stays with an existing Super Admin
  // or Managing Partner, not an account-provisioning role.
  if (staff.role === "it_manager" && role === "super_admin") {
    return NextResponse.json({ error: "IT Manager cannot assign the Super Admin role." }, { status: 403 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const authRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, email_confirm: true }),
  });
  const authData = await authRes.json();

  if (!authRes.ok) {
    return NextResponse.json(
      { error: authData?.msg || authData?.error_description || "Could not create the account." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("users")
    .insert({
      auth_user_id: authData.id,
      email,
      phone: phone || null,
      full_name: fullName,
      role,
      is_active: true,
      must_change_password: true,
      metadata: {
        ...(navAccess !== undefined ? { nav_access: navAccess } : {}),
      },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: "Account created, but the staff record failed to save." }, { status: 500 });
  }

  return NextResponse.json({ staff: data });
}
