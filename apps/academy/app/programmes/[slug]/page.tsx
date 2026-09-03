import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { getProgramme, PROGRAMMES } from "../../../lib/programmes";

export function generateStaticParams() { return PROGRAMMES.map((programme) => ({ slug: programme.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const programme = getProgramme((await params).slug);
  if (!programme) return { title: "Programme | DMECH Academy" };
  return { title: `${programme.title} | DMECH Academy`, description: programme.summary, alternates: { canonical: `/programmes/${programme.slug}` }, openGraph: { title: `${programme.title} | DMECH Academy`, description: programme.summary, url: `/programmes/${programme.slug}`, type: "website" } };
}

export default async function ProgrammeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const programme = getProgramme((await params).slug);
  if (!programme) notFound();
  return <main><section className="academy-page-hero"><div className="academy-container"><Link href="/programmes" className="academy-back-link"><ArrowLeft size={15} /> All programmes</Link><div className="academy-code">{programme.code}</div><h1>{programme.title}</h1><p>{programme.summary}</p><div className="academy-detail-meta"><span>{programme.audience}</span><span>{programme.format}</span></div></div></section><section className="academy-section academy-section-white"><div className="academy-container academy-detail-grid"><div><div className="academy-eyebrow">Programme overview</div><h2>Build a method you can use.</h2><p className="academy-prose">{programme.practical}</p><div className="academy-eyebrow academy-detail-eyebrow">Learning outcomes</div><div className="academy-outcome-list">{programme.outcomes.map((outcome) => <div key={outcome}><CheckCircle2 size={18} />{outcome}</div>)}</div></div><aside className="academy-detail-aside"><div className="academy-eyebrow">Entry point</div><h3>Who it&apos;s for</h3><p>{programme.audience}</p><div className="academy-eyebrow academy-detail-eyebrow">Prerequisite</div><p>{programme.prerequisites}</p><Link href="/register-interest" className="academy-button academy-button-primary">Register Interest <ArrowRight size={16} /></Link></aside></div></section><section className="academy-section"><div className="academy-container academy-detail-grid"><div><div className="academy-eyebrow">Curriculum</div><h2>What the programme covers</h2><div className="academy-module-list">{programme.modules.map((module, index) => <div key={module}><span>{String(index + 1).padStart(2, "0")}</span><strong>{module}</strong></div>)}</div></div><div><div className="academy-eyebrow">Training focus</div><div className="academy-focus-list">{programme.focus.map((focus) => <div key={focus}>{focus}</div>)}</div><Link href="/how-its-taught" className="academy-text-link">See how it&apos;s taught <ArrowRight size={15} /></Link></div></div></section><section className="academy-final-cta"><div className="academy-container"><h2>Interested in {programme.title}?</h2><p>Register your interest and DMECH can confirm the next appropriate step.</p><Link href="/register-interest" className="academy-button academy-button-light">Register Interest <ArrowRight size={16} /></Link></div></section></main>;
}
