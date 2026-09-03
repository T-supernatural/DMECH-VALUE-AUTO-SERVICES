import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardCheck, Gauge, ShieldCheck, Wrench } from "lucide-react";
import { ProgrammeCard } from "../components/ProgrammeCard";
import { SectionHeading } from "../components/SectionHeading";
import { PROGRAMMES } from "../lib/programmes";

const SKILLS = [
  [Gauge, "Diagnostic thinking", "Move from symptom to evidence, then from evidence to a defensible next step."],
  [Wrench, "Workshop practice", "Build habits around tools, measurement, torque, safety, and documented work."],
  [ShieldCheck, "EV and high-voltage awareness", "Understand the systems, hazards, and controlled procedures behind electric vehicles."],
  [ClipboardCheck, "Professional discipline", "Learn to report clearly, quote from findings, and verify work before release."],
] as const;

const HERO_PRACTICES = [
  [Gauge, "Diagnose with evidence", "Build a disciplined route from symptom to a defensible next step."],
  [Wrench, "Work to method", "Use tools, measurements, and controlled workshop practice correctly."],
  [ClipboardCheck, "Prove the result", "Record the work and verify the repair before release."],
] as const;

export default function AcademyHomePage() {
  return (
    <main>
      <section className="academy-home-hero">
        <div className="academy-container academy-home-hero-inner">
          <div>
            <div className="academy-home-hero-badge"><span /> DMECH Academy · Practical technician development</div>
            <h1>Make the workshop your <em>classroom.</em></h1>
            <p>Automotive training grounded in real workshop discipline: diagnose with evidence, work with control, and prove the result.</p>
            <div className="academy-home-hero-actions">
              <Link href="/programmes" className="academy-home-hero-cta">Explore Programmes <ArrowRight size={16} strokeWidth={2.25} /></Link>
              <Link href="/register-interest" className="academy-home-hero-link">Register Interest <ArrowRight size={15} /></Link>
            </div>
          </div>

          <aside className="academy-home-hero-capsule" aria-label="The Academy method">
            <div className="academy-home-hero-capsule-inner">
              <div className="academy-home-hero-capsule-eyebrow">The Academy method</div>
              {HERO_PRACTICES.map(([Icon, title, description]) => (
                <div className="academy-home-hero-capsule-item" key={title}>
                  <span className="academy-home-hero-capsule-icon"><Icon size={17} strokeWidth={2} /></span>
                  <div>
                    <div className="academy-home-hero-capsule-title">{title}</div>
                    <div className="academy-home-hero-capsule-desc">{description}</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="academy-section academy-section-white"><div className="academy-container"><SectionHeading eyebrow="The Academy difference" title="Technicians are made through repeated, supervised practice." text="DMECH Academy turns the habits of a working automotive workshop into a structured path for people who want to handle vehicles with more confidence and discipline." /><div className="academy-skill-grid">{SKILLS.map(([Icon, title, text]) => <article className="academy-skill" key={title}><Icon size={22} /><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
      <section className="academy-section"><div className="academy-container"><SectionHeading eyebrow="Technician progression" title="Responsibility grows with competence." text="The Technician Standard gives practical development a visible direction, from safe bay habits to leading work and people." /><div className="academy-progression"><Link href="/technician-standard" className="academy-level"><span>LEVEL 01</span><h3>Bay Technician</h3><p>Safety, tools, service routines, and disciplined job-card capture.</p></Link><div className="academy-level-arrow">→</div><Link href="/technician-standard" className="academy-level"><span>LEVEL 02</span><h3>Diagnostic Technician</h3><p>Independent fault finding, testing, reporting, and evidence-based quoting.</p></Link><div className="academy-level-arrow">→</div><Link href="/technician-standard" className="academy-level"><span>LEVEL 03</span><h3>Lead Technician</h3><p>Release authority, bay supervision, mentoring, and technical judgement.</p></Link></div></div></section>
      <section className="academy-section academy-section-white"><div className="academy-container"><SectionHeading eyebrow="Featured programmes" title="Start with the skill you need to build." text="Illustrative Academy programmes are designed around practical capability. Availability and cohort details are confirmed by DMECH." /><div className="academy-programme-grid">{PROGRAMMES.map((programme) => <ProgrammeCard key={programme.slug} programme={programme} />)}</div><Link href="/programmes" className="academy-text-link academy-more-link">View all programmes <ArrowRight size={15} /></Link></div></section>
      <section className="academy-section academy-dark-band"><div className="academy-container academy-split"><div><div className="academy-kicker">Learn → Practise → Assess → Progress</div><h2>Method before speed.</h2><p>Training should make good work repeatable. Theory supports the practical task, instructors observe the method, and progression follows demonstrated competency.</p></div><Link href="/how-its-taught" className="academy-button academy-button-light">How It&apos;s Taught <ArrowRight size={16} /></Link></div></section>
      <section className="academy-section academy-section-white"><div className="academy-container academy-split academy-corporate"><div><SectionHeading eyebrow="For organisations" title="Develop the technicians who keep your vehicles moving." text="DMECH Academy can discuss structured development for fleet technicians, company workshops, apprentice pipelines, and custom cohorts." /></div><Link href="/corporate-training" className="academy-button academy-button-primary">Corporate Training <ArrowRight size={16} /></Link></div></section>
      <section className="academy-final-cta"><div className="academy-container"><BookOpen size={28} /><h2>Build the habit of proving the work.</h2><p>Explore the programmes or tell DMECH what capability you want your team to develop.</p><Link href="/register-interest" className="academy-button academy-button-primary">Register Interest <ArrowRight size={16} /></Link></div></section>
    </main>
  );
}
