import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { customerGuard } from "@/lib/guards";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { UserCircle2 } from "lucide-react";

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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "var(--bg, #fafcfe)",
      }}
    >
      <div
        style={{
          maxWidth: 440,
          width: "100%",
          background: "#fff",
          border: "1px solid var(--border, #e2e8f0)",
          borderRadius: 16,
          padding: 36,
          textAlign: "center",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <Logo variant="nav" />
        </div>
        <div style={{ display: "flex", justifyContent: "center", color: "var(--blue)", marginBottom: 12 }}>
          <UserCircle2 size={36} strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 22, marginBottom: 8 }}>Customer Portal</h1>
        <p style={{ color: "var(--muted)", lineHeight: 1.7, fontSize: 14, marginBottom: 24 }}>
          Sign in to track your vehicle, payments, and documents — or register to get started.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/login"
            style={{
              textDecoration: "none",
              background: "var(--blue, #1899e7)",
              color: "#fff",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            style={{
              textDecoration: "none",
              background: "transparent",
              color: "var(--text, #2a3444)",
              border: "1px solid var(--border, #e2e8f0)",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
