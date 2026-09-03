import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Gauge, ShieldCheck, Wrench } from "lucide-react";
import { ProgrammeCard } from "@academy-components/ProgrammeCard";
import { SectionHeading } from "@academy-components/SectionHeading";
import { PROGRAMMES } from "@academy-lib/programmes";

const SKILLS = [
  [Gauge, "Diagnostic thinking", "Move from symptom to evidence, then from evidence to a defensible next step."],
  [Wrench, "Workshop practice", "Build habits around tools, measurement, torque, safety, and documented work."],
  [ShieldCheck, "EV and high-voltage awareness", "Understand the systems, hazards, and controlled procedures behind electric vehicles."],
  [ClipboardCheck, "Professional discipline", "Learn to report clearly, quote from findings, and verify work before release."],
] as const;

export default function AcademyHomePage() {
  return (
    <main>
      <section className="academy-hero"><div className="academy-container academy-hero-grid"><div><div className="academy-kicker">DMECH Academy / Practical technician development</div><h1