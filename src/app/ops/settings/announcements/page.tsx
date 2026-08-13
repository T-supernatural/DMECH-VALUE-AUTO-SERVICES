"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AnnouncementsSettings() {
  const [itemsText, setItemsText] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    fetch("/api/marketing/ticker")
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) setItemsText(data.map((i: any) => i.text).join("\n"));
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  async function save() {
    setSaving(true);
    try {
      const lines = itemsText.split("\n").map((l) => l.trim()).filter(Boolean);
      const payload = { ticker_items: lines.map((t) => ({ text: t })) };
      const res = await fetch("/api/admin/settings/platform", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (e) {
      // noop
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 920 }}>
      <h2>Announcements / Ticker</h2>
      <p style={{ color: "var(--muted)", marginBottom: 12 }}>One item per line. These appear in the site-wide ticker.</p>
      <textarea value={itemsText} onChange={(e) => setItemsText(e.target.value)} style={{ width: "100%", minHeight: 220, fontFamily: "monospace", padding: 12 }} />
      <div style={{ marginTop: 12 }}>
        <button className="ops-btn" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </div>
    </div>
  );
}
