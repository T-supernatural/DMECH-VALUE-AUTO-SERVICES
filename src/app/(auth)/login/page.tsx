"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "@/styles/ops.css";
import { Logo } from "@/components/Logo";
import { createClient } from "@/lib/supabase/client";
import { getDeviceId } from "@/lib/device-id";

// Fire-and-forget -- a login-event logging failure must never block or
// fail the actual login.
function logLoginEvent(email: string, success: boolean) {
  fetch("/api/auth/login-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, success, device_id: getDeviceId() }),
    keepalive: true,
  }).catch(() => {});
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      logLoginEvent(email, false);
      // Generic on purpose — don't confirm whether the email has an account.
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    logLoginEvent(email, true);
    const next = searchParams.get("next") || "/ops/dashboard";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
          <Logo variant="splash" />
        </div>
        <div className="login-title">Staff Login</div>
        <div className="login-subtitle">Operations Platform — DMECH Services Limited</div>

        <form onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div data-theme="dark">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
