import Link from "next/link";
import { Car, ArrowRight } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

// The explicit bridge into the sales/import funnel now that Home leads with
// identity instead of vehicles — without this, a visitor who came
// specifically to buy or import a car has no obvious next step.
export function SalesGateway() {
  return (
    <section className="gateway-section">
      <Reveal>
        <div className="gateway-card">
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div className="gateway-icon">
              <Car size={26} strokeWidth={1.75} />
            </div>
            <div>
              <div className="gateway-title">Looking To Buy Or Import A Vehicle?</div>
              <div className="gateway-desc">
                Calculator, live inventory, financing plans, and vehicle sourcing from abroad —
                all in one place.
              </div>
            </div>
          </div>
          <Link href="/sales" className="gateway-cta">
            Visit Vehicle Sales &amp; Financing <ArrowRight size={16} strokeWidth={2.25} />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
