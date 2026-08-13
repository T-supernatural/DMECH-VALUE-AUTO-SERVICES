import Link from "next/link";
import { Car, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

// The explicit bridge into the sales/import funnel now that Home leads with
// identity instead of vehicles — without this, a visitor who came
// specifically to buy or import a car has no obvious next step.
export function SalesGateway() {
  return (
    <section className="section">
      <div className="section-inner">
        <Reveal>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              flexWrap: "wrap",
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: 16,
              padding: "32px 36px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: "var(--blue-d)",
                  color: "var(--blue)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Car size={26} strokeWidth={1.75} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: 19, fontWeight: 700, marginBottom: 4 }}>
                  Looking To Buy Or Import A Vehicle?
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>
                  Calculator, live inventory, financing plans, and vehicle sourcing from abroad —
                  all in one place.
                </div>
              </div>
            </div>
            <Link
              href="/sales"
              className="v-card-btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}
            >
              Visit Vehicle Sales &amp; Financing <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
