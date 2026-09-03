import Link from "next/link";
import type { AcademyProgramme } from "../lib/programmes";

export function ProgrammeCard({ programme }: { programme: AcademyProgramme }) {
  return <article className="academy-programme-card"><div className="academy-code">{programme.code}</div><h3>{programme.title}</h3><p>{programme.summary}</p><div className="academy-card-meta"><span>{programme.audience}</span><span>{programme.format}</span></div><Link href={`/programmes/${programme.slug}`} className="academy-text-link">View programme <span aria-hidden="true">→</span></Link></article>;
}
