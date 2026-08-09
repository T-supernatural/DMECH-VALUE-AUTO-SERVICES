import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// Called by the login page right after signInWithPassword() resolves --
// success or failure. Deliberately unauthenticated (a failed login has no
// session to authenticate with) and deliberately fire-and-forget from the
// client: logging a login attempt must never block or fail the login
// itself. IP/user-agent are read server-side from real request headers,
// not trusted client-supplied values.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const success = body?.success === true;
  const deviceId = typeof body?.device_id === "string" && body.device_id ? body.device_id : null;

  if (!email) {
    return NextResponse.json({ error: "Missing email." }, { status: 400 });
  }

  const ipAddress =
    request.headers.get("x-nf-client-connection-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    null;
  const userAgent = request.headers.get("user-agent");

  const supabase = createServiceClient();
  const { data: user } = await supabase.from("users").select("id").eq("email", email).maybeSingle();

  let isNewDevice = false;
  if (user && deviceId) {
    const { data: priorDevice } = await supabase
      .from("staff_login_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("device_id", deviceId)
      .eq("success", true)
      .limit(1)
      .maybeSingle();
    isNewDevice = !priorDevice;
  }

  await supabase.from("staff_login_events").insert({
    user_id: user?.id ?? null,
    email,
    success,
    device_id: deviceId,
    is_new_device: isNewDevice,
    ip_address: ipAddress,
    user_agent: userAgent,
  });

  return NextResponse.json({ ok: true });
}
