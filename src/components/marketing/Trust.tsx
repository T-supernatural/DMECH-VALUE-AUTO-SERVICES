import { FileText, Search, Target } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

const COMPARISON = [
  {
    row: "Diagnosis",
    workshop: "Experience and trial replacement",
    dealership: "Computerised, marque-specific",
    dmech: "Computerised and evidence-shown, across mixed marques",
  },
  {
    row: "Parts",
    workshop: "Unverified, source unstated",
    dealership: "Genuine, often long lead times",
    dmech: "Genuine and traceable, with direct import channels",
  },
  {
    row: "Quotation",
    workshop: "Verbal, revised during the job",
    dealership: "Written, premium-priced",
    dmech: "Written and fixed; variations re-approved, never absorbed",
  },
  {
    row: "Records",
    workshop: "None",
    dealership: "Held by the dealer",
    dmech: "Per-asset history, auditable by you at any time",
  },
  {
    row: "Warranty",
    workshop: "Informal or none",
    dealership: "Yes, within their terms",
    dmech: "Written workmanship warranty; failures come back to us",
  },
  {
    row: "Fleet support",
    workshop: "Ad hoc",
    dealership: "Limited to their marque",
    dmech: "SLA contracts with monthly uptime and cost reporting",
  },
  {
    row: "Vehicle mix",
    workshop: "Anything, unevenly",
    dealership: "Their marque only",
    dmech: "Mixed fleets, imports, and older vehicles by design",
  },
];

export function Trust() {
  return (
    <section className="section" id="why">
      <div className="section-inner">
        <Reveal>
          <div className="section-eyebrow">Why DMECH</div>
          <div className="section-title">Buy With Confidence, Not Guesswork</div>
          <div className="section-subtitle">
            The informal car market runs on trust you can&apos;t verify. We built DMECH to change
            that.
          </div>
        </Reveal>
        <div className="trust-grid">
          <Reveal delayMs={0}>
            <div className="trust-card">
              <div className="trust-icon">
                <FileText size={24} strokeWidth={1.75} />
              </div>
              <div className="trust-title">Full Documentation</div>
              <div className="trust-desc">
                Every vehicle comes with original title, verified history report, pre-shipment
                inspection, and customs clearance papers. Nothing hidden.
              </div>
            </div>
          </Reveal>
          <Reveal delayMs={80}>
            <div className="trust-card">
              <div className="trust-icon">
                <Search size={24} strokeWidth={1.75} />
              </div>
              <div className="trust-title">Verified Vehicle History</div>
              <div className="trust-desc">
                We check accident records, mileage, and title status before purchase. You know
                exactly what you&apos;re buying — no surprises after payment.
              </div>
            </div>
          </Reveal>
          <Reveal delayMs={160}>
            <div className="trust-card">
              <div className="trust-icon">
                <Target size={24} strokeWidth={1.75} />
              </div>
              <div className="trust-title">Transparent Pricing</div>
              <div className="trust-desc">
                Our calculator shows every naira — vehicle cost, shipping, duties, and our fee. The
                price we quote is the price you pay.
              </div>
            </div>
          </Reveal>
        </div>
        <div className="dmech-table-wrap">
          <table className="dmech-table">
            <thead>
              <tr>
                <th></th>
                <th>Informal Workshop</th>
                <th>Franchise Dealership</th>
                <th className="col-us">DMECH</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.row}>
                  <td>{row.row}</td>
                  <td>{row.workshop}</td>
                  <td>{row.dealership}</td>
                  <td className="col-us">{row.dmech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
