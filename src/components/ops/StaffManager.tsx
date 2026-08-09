"use client";

import { useState } from "react";
import type { DmechUser, StaffRole } from "@/types";

function initials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

const ROLE_OPTIONS: { value: StaffRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "managing_partner", label: "Managing Partner" },
  { value: "sales_manager", label: "Sales Manager" },
  { value: "ops_manager", label: "Ops Manager" },
  { value: "workshop_lead", label: "Workshop Lead" },
  { value: "sales_rep", label: "Sales Rep" },
  { value: "accountant", label: "Accountant" },
  { value: "it_manager", label: "IT Manager" },
];

export function StaffManager({
  staff,
  currentUserId,
  currentUserRole,
}: {
  staff: DmechUser[];
  currentUserId: string;
  currentUserRole: StaffRole;
}) {
  const [roster, setRoster] = useState(staff);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<StaffRole>("sales_rep");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetStatus, setResetStatus] = useState<"idle" | "saving" | "error" | "saved">("idle");

  // IT Manager provisions accounts but can never grant Super Admin --
  // that decision stays with an existing Super Admin/Managing Partner.
  const assignableRoles =
    currentUserRole === "it_manager" ? ROLE_OPTIONS.filter((r) => r.value !== "super_admin") : ROLE_OPTIONS;

  async function addStaff() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, email, phone, password, role }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Something went wrong.");
        setStatus("error");
        return;
      }
      setRoster((prev) => [...prev, json.staff]);
      setFullName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("sales_rep");
      setStatus("idle");
    } catch {
      setError("Something went wrong.");
      setStatus("error");
    }
  }

  async function updateStaff(id: string, updates: Partial<Pick<DmechUser, "role" | "is_active">>) {
    setRoster((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    await fetch(`/api/admin/staff/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  }

  async function submitPasswordReset(id: string) {
    setResetStatus("saving");
    try {
      const res = await fetch(`/api/admin/staff/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPasswordValue }),
      });
      if (!res.ok) {
        setResetStatus("error");
        return;
      }
      setResetStatus("saved");
      setResetPasswordValue("");
      setTimeout(() => {
        setResettingId(null);
        setResetStatus("idle");
      }, 1200);
    } catch {
      setResetStatus("error");
    }
  }

  const activeCount = roster.filter((s) => s.is_active).length;
  const superAdminCount = roster.filter((s) => s.role === "super_admin").length;

  return (
    <>
      <div className="ops-stat-grid" style={{ marginBottom: 20 }}>
        <div className="ops-stat-card">
          <div className="ops-stat-value">{roster.length}</div>
          <div className="ops-stat-label">Total Staff</div>
        </div>
        <div className="ops-stat-card">
          <div className="ops-stat-value">{activeCount}</div>
          <div className="ops-stat-label">Active</div>
        </div>
        <div className="ops-stat-card">
          <div className="ops-stat-value">{roster.length - activeCount}</div>
          <div className="ops-stat-label">Deactivated</div>
        </div>
        <div className="ops-stat-card">
          <div className="ops-stat-value">{superAdminCount}</div>
          <div className="ops-stat-label">Super Admins</div>
        </div>
      </div>

      <div className="ops-panel" style={{ maxWidth: 620 }}>
        <div className="ops-panel-title">Add Staff</div>

        <div className="ops-form-grid">
          <div>
            <label className="ops-field-label" htmlFor="staff-name">
              Full Name
            </label>
            <input
              id="staff-name"
              className="ops-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="staff-email">
              Email
            </label>
            <input
              id="staff-email"
              className="ops-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="staff-phone">
              Phone (optional)
            </label>
            <input
              id="staff-phone"
              className="ops-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="ops-field-label" htmlFor="staff-role">
              Role
            </label>
            <select
              id="staff-role"
              className="ops-input"
              value={role}
              onChange={(e) => setRole(e.target.value as StaffRole)}
            >
              {assignableRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="ops-field-label" htmlFor="staff-password">
          Initial Password
        </label>
        <input
          id="staff-password"
          className="ops-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="ops-btn"
            onClick={addStaff}
            disabled={status === "saving" || !fullName || !email || password.length < 8}
          >
            {status === "saving" ? "Adding..." : "Add Staff"}
          </button>
          {error && <span style={{ color: "var(--red)", fontSize: 12 }}>{error}</span>}
        </div>
      </div>

      <div className="ops-table-wrap" style={{ marginTop: 16 }}>
        <table className="ops-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Active</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {roster.map((s) => {
              const isSelf = s.id === currentUserId;
              // IT Manager can't touch a Super Admin account at all -- not
              // just barred from granting the role, but from editing or
              // deactivating one that already exists.
              const isLockedSuperAdmin = currentUserRole === "it_manager" && s.role === "super_admin";
              const rowRoleOptions =
                s.role === "super_admin" && !assignableRoles.some((r) => r.value === "super_admin")
                  ? [{ value: "super_admin" as StaffRole, label: "Super Admin" }, ...assignableRoles]
                  : assignableRoles;
              const isResetting = resettingId === s.id;
              return (
                <tr key={s.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span className="ops-user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {initials(s.full_name)}
                      </span>
                      {s.full_name}
                      {isSelf && <span className="ops-badge ops-badge-muted">You</span>}
                    </div>
                  </td>
                  <td>{s.email}</td>
                  <td>
                    <select
                      className="ops-input"
                      style={{ marginBottom: 0, width: "auto" }}
                      value={s.role}
                      disabled={isSelf || isLockedSuperAdmin}
                      onChange={(e) => updateStaff(s.id, { role: e.target.value as StaffRole })}
                    >
                      {rowRoleOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={s.is_active}
                      disabled={isSelf || isLockedSuperAdmin}
                      onChange={(e) => updateStaff(s.id, { is_active: e.target.checked })}
                    />
                  </td>
                  <td>
                    {isSelf ? (
                      <span style={{ color: "var(--subtle)", fontSize: 12 }}>Use Change Password</span>
                    ) : isLockedSuperAdmin ? (
                      <span style={{ color: "var(--subtle)", fontSize: 12 }}>—</span>
                    ) : isResetting ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                          type="password"
                          className="ops-input"
                          style={{ marginBottom: 0, width: 140 }}
                          placeholder="New password"
                          value={resetPasswordValue}
                          onChange={(e) => setResetPasswordValue(e.target.value)}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="ops-btn"
                          style={{ padding: "6px 12px", fontSize: 12 }}
                          disabled={resetPasswordValue.length < 8 || resetStatus === "saving"}
                          onClick={() => submitPasswordReset(s.id)}
                        >
                          {resetStatus === "saving" ? "Saving..." : "Set"}
                        </button>
                        <button
                          type="button"
                          className="ops-btn-ghost"
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          onClick={() => {
                            setResettingId(null);
                            setResetPasswordValue("");
                            setResetStatus("idle");
                          }}
                        >
                          Cancel
                        </button>
                        {resetStatus === "error" && (
                          <span style={{ color: "var(--red)", fontSize: 12 }}>Failed</span>
                        )}
                        {resetStatus === "saved" && (
                          <span style={{ color: "var(--green)", fontSize: 12 }}>Saved</span>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="ops-btn-ghost"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => {
                          setResettingId(s.id);
                          setResetPasswordValue("");
                          setResetStatus("idle");
                        }}
                      >
                        Reset Password
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
