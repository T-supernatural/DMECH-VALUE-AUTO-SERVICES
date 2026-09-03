import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { SectionHeading } from "@academy-components/SectionHeading";

export const metadata: Metadata = { title: "Technician Standard | DMECH Academy", description: "Explore the DMECH Academy Technician Standard progression from Bay Technician to Lead Technician.", alternates: { canonical: "/technician-standard" } };

const LEVELS = [
  ["01", "Bay Technician", "Build the foundation.", ["Workshop safety and PPE", "Lifting, support, tooling and torque discipline", "Scheduled service routines", "Five-gate capture and job-card discipline"]],
  ["02", "Diagnostic Technician", "Turn symptoms into evidence.", ["Independent fault finding", "Scan tools, multimeter and mechanical testing", "Evidence-based findings", "Quoting from diagnosis and knowing what is not proven"]],
  ["03", "Lead Technician", "Take responsibility for the bay.", ["Release authority and bay supervision", "Scheduling and parts decisions", "Warranty judgement", "Mentoring and assessing developing technicians"]],
] as const;

export default function TechnicianStandardPage() { return <main><section className="academy-page-hero"><div className="academy-container"><div className="academy-kicker">DMECH Technician Standard</div><h1>Responsibility follows competence.</h1><p>A practical progression for technicians who want to build safe habits, diagnostic judgement, and the ability to lead good work.</p></div></section><section className="academy-section academy-section-white"><div className="academy-container"><SectionHeading eyebrow="Three levels" title="From the bay to the lead role." text="The levels describe increasing responsibility. DMECH will confirm programme entry and progression requirements for each cohort." /><div className="academy-level-stack">{LEVELS.map(([number, title, intro, skills]) => <article className="academy-standard-level" key={number}><div className="academy-standard-number">{number}</div><div><div className="academy-eyebrow">Level {number}</div><h2>{title}</h2><p className="academy-standard-intro">{intro}</p><ul>{skills.map((skill) => <li key={skill}><CheckCircle2 size={16} />{skill}</li>)}</ul></div></article>)}</div></div></section><section className="academy-dark-band"><div className="academy-container academy-split"><div><div className="academy-kicker">Learn it. Work it. Prove it.</div><h2>Progression is demonstrated, not assumed.</h2><p>Practical sign-off should follow observed work, clear evidence, and the judgement to know when more investigation is needed.</p></div><Link href="/register-interest" className="academy-button academy-button-light">Ask about progression <ArrowRight size={16} /></Link></div></section></main>; }
