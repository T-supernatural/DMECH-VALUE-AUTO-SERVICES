import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerGuard } from "@/lib/guards";
import Link from "next/link";

export default async function PortalHome() {
  const customer = await customerGuard();
  if (customer) {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (authUser) {
    redirect("/verify");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Customer Portal</h1>
      <p style={{ color: "var(--muted)", maxWidth: 580, lineHeight: 1.7 }}>
        The customer portal is being expanded in Phase 3. You can register for access or sign in to view your dashboard, payments, and documents.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Link href="/login" className="ops-btn" style={{ textDecoration: "none" }}>
          Sign in
        </Link>
        <Link href="/register" className="ops-btn" style={{ textDecoration: "none" }}>
          Register
        </Link>
      </div>
    </main>
  );
}
