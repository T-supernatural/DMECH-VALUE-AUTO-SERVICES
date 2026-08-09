import Link from "next/link";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/ops/TopBar";
import { roleGuard } from "@/lib/guards";
import { createClient } from "@/lib/supabase/server";
import { describeUserAgent } from "@/lib/user-agent";
import type { StaffLoginEvent } from "@/types";

interface LoginEventRow extends StaffLoginEvent {
  users: { full_name: string } | null;
}

interface PageProps {
  searchParams: Promise<{ status?: string; staff?: string }>;
}

export default async function LoginActivityPage({ searchParams }: PageProps) {
  const staff = await roleGuard(["super_admin", "managing_partner", "it_manager"]);
  if (!staff) redirect("/ops/dashboard");

  const { status, staff: staffId } = await searchParams;
  const hasFilters = Boolean(status || staffId);

  const supabase = await createClient();

  let query = supabase
    .from("staff_login_events")
    .select("*, users(full_name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (status === "success") query = query.eq("success", true);
  if (status === "failed") query = query.eq("success", false);
  if (status === "new_device") query = query.eq("is_new_device", true);
  if (staffId) query = query.eq("user_id", staffId);

  const [{ data }, { data: staffList }] = await Promise.all([
    query,
    supabase.from("users").select("id, full_name").neq("role", "customer").order("full_name"),
  ]);

  const events = (data ?? []) as unknown as LoginEventRow[];

  return (
    <>
      <TopBar title="Login Activity" />
      <div className="ops-content">
        <p style={{ fontSize: 12, color: "var(--muted)", marginBottom: 14 }}>
          Every staff sign-in attempt, successful or not, with the IP and device it came from —
          this is what makes "do we have a breach" an answerable question. Devices are recognized
          by a per-browser id stored locally; clearing site data or using a new browser looks like
          a new device even for a real staff member. Most recent 200 entries{hasFilters ? " matching these filters" : ""}.
        </p>

        <form className="ops-filter-bar" method="get">
          <div className="ops-filter-field">
            <label className="ops-field-label" htmlFor="la-status">Status</label>
            <select id="la-status" name="status" className="ops-input" defaultValue={status ?? ""}>
              <option value="">All</option>
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
              <option value="new_device">New Device</option>
            </select>
          </div>
          <div className="ops-filter-field">
            <label className="ops-field-label" htmlFor="la-staff">Staff</label>
            <select id="la-staff" name="staff" className="ops-input" defaultValue={staffId ?? ""}>
              <option value="">All Staff</option>
              {(staffList ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="ops-btn">Filter</button>
          {hasFilters && (
            <Link href="/ops/settings/login-activity" className="ops-btn-ghost">Clear</Link>
          )}
        </form>

        {events.length === 0 ? (
          <div className="ops-panel" style={{ color: "var(--muted)", fontSize: 14 }}>
            {hasFilters ? "No events match these filters." : "No login attempts recorded yet."}
          </div>
        ) : (
          <div className="ops-table-wrap">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Staff / Email</th>
                  <th>Status</th>
                  <th>Device</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      {new Date(e.created_at).toLocaleString("en-NG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>{e.users?.full_name ?? e.email}</td>
                    <td style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span className={`ops-badge ${e.success ? "ops-badge-green" : "ops-badge-red"}`}>
                        {e.success ? "Success" : "Failed"}
                      </span>
                      {e.is_new_device && <span className="ops-badge ops-badge-amber">New Device</span>}
                    </td>
                    <td>{describeUserAgent(e.user_agent)}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 11 }}>{e.ip_address ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
