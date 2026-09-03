import type { Metadata } from "next";
import { ProgrammeCard } from "@academy-components/ProgrammeCard";
import { SectionHeading } from "@academy-components/SectionHeading";
import { PROGRAMMES } from "@academy-lib/programmes";

export const metadata: Metadata = { title: "Programmes | DMECH Academy", description: "Explore practical automotive technician development programmes from DMECH Academy.", alternates: { canonical: "/programmes" } };

export default function ProgrammesPage() {
  return <main><section className="academy-page-hero"><div className="academy-container"><div className="academy-kicker">Programme catalogue</div><h1>Training built for the work.</h1><p>Explore the current Academy programme concepts. Cohort availability, entry requirements, and delivery details are confirmed by DMECH.</p></div></section><section className="academy-section academy-section-white"><div className="academy-container"><SectionHeading eyebrow="Choose your direction" title="Practical capability, structured clearly." text="Each programme is designed around the evidence, habits, and supervised practice needed to make better workshop decisions." /><div className="academy-programme-grid">{PROGRAMMES.map((programme) => <ProgrammeCard key={programme.slug} programme={programme} />)}</div></div></section></main>;
}
